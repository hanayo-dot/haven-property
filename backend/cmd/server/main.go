package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"haven-property/backend/internal/handlers"
	"haven-property/backend/internal/middleware"
	"haven-property/backend/internal/services"
	"haven-property/backend/internal/storage"
)

func main() {
	portFlag := flag.String("port", "", "Port to run the HTTP server on (defaults to PORT env var or 8080)")
	dataDirFlag := flag.String("data-dir", "data", "Directory to store local JSON database file")
	flag.Parse()

	port := *portFlag
	if port == "" {
		port = os.Getenv("PORT")
	}
	if port == "" {
		port = "8080"
	}

	dataDir := *dataDirFlag
	if envDataDir := os.Getenv("DATA_DIR"); envDataDir != "" {
		dataDir = envDataDir
	}

	log.Printf("=================================================")
	log.Printf(" Haven Property & Maintenance Management OS")
	log.Printf(" Backend Server (Go 1.25+)")
	log.Printf("=================================================")

	// Initialize Storage
	store, err := storage.NewStore(dataDir)
	if err != nil {
		log.Fatalf("Failed to initialize storage: %v", err)
	}
	log.Printf("✓ Storage initialized (Data Directory: %s)", dataDir)

	// Initialize Services
	aiService := services.NewAIService()
	exportService := services.NewExportService()
	log.Printf("✓ Services loaded (AI Gemini / Export Service)")

	// Initialize Router and Handlers
	mux := http.NewServeMux()
	handler := handlers.NewHandler(store, aiService, exportService)
	handler.RegisterRoutes(mux)

	// Look for static frontend directory (SPA fallback)
	staticDir := os.Getenv("STATIC_DIR")
	if staticDir == "" {
		candidates := []string{"./dist", "../dist", "dist"}
		for _, c := range candidates {
			if _, err := os.Stat(filepath.Join(c, "index.html")); err == nil {
				staticDir = c
				break
			}
		}
	}

	if staticDir != "" {
		mux.Handle("/", spaHandler(staticDir))
		log.Printf("✓ Serving static SPA frontend from: %s", staticDir)
	}

	// Apply Middlewares (Recovery -> Logging -> CORS -> Mux)
	var finalHandler http.Handler = mux
	finalHandler = middleware.CORS(finalHandler)
	finalHandler = middleware.Auth(finalHandler)
	finalHandler = middleware.Authorize(finalHandler)
	finalHandler = middleware.Logging(finalHandler)
	finalHandler = middleware.Recovery(finalHandler)

	server := &http.Server{
		Addr:         fmt.Sprintf("0.0.0.0:%s", port),
		Handler:      finalHandler,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Server start in goroutine
	go func() {
		log.Printf("✓ Server listening on http://0.0.0.0:%s", port)
		log.Printf("  • Health check:  http://localhost:%s/api/health", port)
		log.Printf("  • Stats API:     http://localhost:%s/api/stats", port)
		log.Printf("  • Properties:    http://localhost:%s/api/properties", port)
		log.Printf("  • Maintenance:   http://localhost:%s/api/maintenance", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server error: %v", err)
		}
	}()

	// Graceful Shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server gracefully...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited cleanly.")
}

func spaHandler(staticDir string) http.Handler {
	fs := http.Dir(staticDir)
	fileServer := http.FileServer(fs)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Never intercept /api/ routes
		if strings.HasPrefix(r.URL.Path, "/api/") || r.URL.Path == "/api" {
			http.NotFound(w, r)
			return
		}

		path := filepath.Clean(r.URL.Path)
		f, err := fs.Open(path)
		if err != nil {
			// Fallback to index.html for SPA client-side routes
			http.ServeFile(w, r, filepath.Join(staticDir, "index.html"))
			return
		}
		defer f.Close()

		stat, err := f.Stat()
		if err != nil || stat.IsDir() {
			http.ServeFile(w, r, filepath.Join(staticDir, "index.html"))
			return
		}

		fileServer.ServeHTTP(w, r)
	})
}
