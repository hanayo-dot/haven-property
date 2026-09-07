package middleware

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

type authClaims struct {
	UserID string `json:"sub"`
	Role   string `json:"role"`
	Expiry int64  `json:"exp"`
}

type claimsContextKey struct{}

var generatedAuthSecret = func() []byte {
	secret := make([]byte, 32)
	if _, err := rand.Read(secret); err != nil {
		panic(err)
	}
	return secret
}()

func AuthenticatedUser(ctx context.Context) (string, string, bool) {
	claims, ok := ctx.Value(claimsContextKey{}).(*authClaims)
	if !ok {
		return "", "", false
	}
	return claims.UserID, claims.Role, true
}

func authSecret() []byte {
	secret := os.Getenv("AUTH_SECRET")
	if secret == "" {
		return generatedAuthSecret
	}
	return []byte(secret)
}

func IssueToken(userID, role string) string {
	claims, _ := json.Marshal(authClaims{UserID: userID, Role: role, Expiry: time.Now().Add(24 * time.Hour).Unix()})
	payload := base64.RawURLEncoding.EncodeToString(claims)
	mac := hmac.New(sha256.New, authSecret())
	_, _ = mac.Write([]byte(payload))
	signature := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	return payload + "." + signature
}

func parseToken(token string) (*authClaims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return nil, errors.New("invalid token")
	}
	mac := hmac.New(sha256.New, authSecret())
	_, _ = mac.Write([]byte(parts[0]))
	expected, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil || !hmac.Equal(expected, mac.Sum(nil)) {
		return nil, errors.New("invalid token")
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return nil, errors.New("invalid token")
	}
	var claims authClaims
	if err := json.Unmarshal(payload, &claims); err != nil || claims.UserID == "" || claims.Expiry <= time.Now().Unix() {
		return nil, errors.New("expired token")
	}
	return &claims, nil
}

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 10<<20)
		if r.Method == http.MethodOptions || r.URL.Path == "/api/health" || r.URL.Path == "/api/auth/login" || r.URL.Path == "/api/auth/register" {
			next.ServeHTTP(w, r)
			return
		}

		header := r.Header.Get("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			JSONError(w, "Authentication required", http.StatusUnauthorized)
			return
		}
		claims, err := parseToken(strings.TrimSpace(strings.TrimPrefix(header, "Bearer ")))
		if err != nil {
			JSONError(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), claimsContextKey{}, claims)))
	})
}

func Authorize(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions || r.URL.Path == "/api/health" || r.URL.Path == "/api/auth/login" || r.URL.Path == "/api/auth/register" {
			next.ServeHTTP(w, r)
			return
		}
		claims, ok := r.Context().Value(claimsContextKey{}).(*authClaims)
		if !ok {
			JSONError(w, "Authentication required", http.StatusUnauthorized)
			return
		}
		if claims.Role == "landlord" {
			next.ServeHTTP(w, r)
			return
		}
		if claims.Role == "tenant" && ((r.Method == http.MethodGet && (r.URL.Path == "/api/properties" || r.URL.Path == "/api/units" || strings.HasPrefix(r.URL.Path, "/api/properties/") || strings.HasPrefix(r.URL.Path, "/api/units/"))) || r.URL.Path == "/api/auth/me" || r.URL.Path == "/api/tenant/tickets" || r.URL.Path == "/api/tenant/mpesa/simulate" || (r.Method == http.MethodPost && r.URL.Path == "/api/maintenance")) {
			next.ServeHTTP(w, r)
			return
		}
		JSONError(w, "Insufficient permissions", http.StatusForbidden)
	})
}

type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := os.Getenv("CORS_ORIGIN")
		if origin == "" {
			origin = "http://localhost:3000"
		}
		if r.Header.Get("Origin") == origin {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept")
		w.Header().Set("Access-Control-Max-Age", "86400")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func Logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rw := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}

		next.ServeHTTP(rw, r)

		duration := time.Since(start)
		log.Printf("[%s] %s %s -> %d (%v)", r.Method, r.URL.Path, r.RemoteAddr, rw.statusCode, duration)
	})
}

func Recovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				log.Printf("[PANIC RECOVERED] %v", rec)
				JSONError(w, "Internal server error occurred", http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(w, r)
	})
}

func JSON(w http.ResponseWriter, data interface{}, statusCode int) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(statusCode)
	if data != nil {
		_ = json.NewEncoder(w).Encode(data)
	}
}

func JSONError(w http.ResponseWriter, message string, statusCode int) {
	JSON(w, map[string]string{"error": message}, statusCode)
}
