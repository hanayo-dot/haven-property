package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"haven-property/backend/internal/middleware"
	"haven-property/backend/internal/models"
	"haven-property/backend/internal/services"
	"haven-property/backend/internal/storage"
)

type Handler struct {
	store         *storage.Store
	aiService     *services.AIService
	exportService *services.ExportService
}

func NewHandler(store *storage.Store, ai *services.AIService, export *services.ExportService) *Handler {
	return &Handler{
		store:         store,
		aiService:     ai,
		exportService: export,
	}
}

func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	// Health & System
	mux.HandleFunc("GET /api/health", h.HealthCheck)
	mux.HandleFunc("GET /api/stats", h.GetStats)
	mux.HandleFunc("POST /api/reset", h.ResetToDemo)

	// Auth & Users
	mux.HandleFunc("GET /api/auth/users", h.ListUsers)
	mux.HandleFunc("POST /api/auth/login", h.Login)
	mux.HandleFunc("POST /api/auth/register", h.Register)
	mux.HandleFunc("GET /api/auth/me", h.GetCurrentUser)

	// Tenant Portal Specifics
	mux.HandleFunc("GET /api/tenant/tickets", h.GetTenantTickets)
	mux.HandleFunc("POST /api/tenant/mpesa/simulate", h.SimulateMpesaPayment)

	// Properties
	mux.HandleFunc("GET /api/properties", h.ListProperties)
	mux.HandleFunc("POST /api/properties", h.CreateProperty)
	mux.HandleFunc("GET /api/properties/{id}", h.GetProperty)
	mux.HandleFunc("PUT /api/properties/{id}", h.UpdateProperty)
	mux.HandleFunc("DELETE /api/properties/{id}", h.DeleteProperty)

	// Units
	mux.HandleFunc("GET /api/units", h.ListUnits)
	mux.HandleFunc("POST /api/units", h.CreateUnit)
	mux.HandleFunc("GET /api/units/{id}", h.GetUnit)
	mux.HandleFunc("PUT /api/units/{id}", h.UpdateUnit)
	mux.HandleFunc("DELETE /api/units/{id}", h.DeleteUnit)

	// Tenants
	mux.HandleFunc("GET /api/tenants", h.ListTenants)
	mux.HandleFunc("POST /api/tenants", h.CreateTenant)
	mux.HandleFunc("GET /api/tenants/{id}", h.GetTenant)
	mux.HandleFunc("PUT /api/tenants/{id}", h.UpdateTenant)
	mux.HandleFunc("DELETE /api/tenants/{id}", h.DeleteTenant)

	// Maintenance Requests
	mux.HandleFunc("GET /api/maintenance", h.ListMaintenanceRequests)
	mux.HandleFunc("POST /api/maintenance", h.CreateMaintenanceRequest)
	mux.HandleFunc("GET /api/maintenance/{id}", h.GetMaintenanceRequest)
	mux.HandleFunc("PUT /api/maintenance/{id}", h.UpdateMaintenanceRequest)
	mux.HandleFunc("DELETE /api/maintenance/{id}", h.DeleteMaintenanceRequest)

	// Maintenance Actions
	mux.HandleFunc("POST /api/maintenance/{id}/status", h.UpdateMaintenanceStatus)
	mux.HandleFunc("POST /api/maintenance/{id}/priority", h.UpdateMaintenancePriority)
	mux.HandleFunc("POST /api/maintenance/{id}/contractor", h.AssignContractor)
	mux.HandleFunc("POST /api/maintenance/{id}/timeline", h.AddTimelineEntry)

	// AI Diagnostics
	mux.HandleFunc("POST /api/ai/diagnose", h.DiagnoseAI)

	// Exports
	mux.HandleFunc("GET /api/export/maintenance", h.ExportMaintenanceCSV)
	mux.HandleFunc("GET /api/export/tenants", h.ExportTenantsCSV)
}

// Health & System
func (h *Handler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	middleware.JSON(w, map[string]interface{}{
		"status":    "healthy",
		"service":   "Haven Property Management OS (Go)",
		"timestamp": fmt.Sprint(r.Context()),
	}, http.StatusOK)
}

func (h *Handler) GetStats(w http.ResponseWriter, r *http.Request) {
	stats := h.store.GetStats()
	middleware.JSON(w, stats, http.StatusOK)
}

func (h *Handler) ResetToDemo(w http.ResponseWriter, r *http.Request) {
	h.store.Reset()
	middleware.JSON(w, map[string]string{"message": "Database reset to initial demo dataset successfully"}, http.StatusOK)
}

// Auth & Users
func (h *Handler) ListUsers(w http.ResponseWriter, r *http.Request) {
	users := h.store.GetUsers()
	middleware.JSON(w, users, http.StatusOK)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.JSONError(w, "Invalid login payload", http.StatusBadRequest)
		return
	}

	identifier := req.Identifier
	if identifier == "" {
		if req.Email != "" {
			identifier = req.Email
		} else if req.Phone != "" {
			identifier = req.Phone
		}
	}

	if identifier == "" {
		middleware.JSONError(w, "Email or phone number is required", http.StatusBadRequest)
		return
	}

	user, err := h.store.Authenticate(identifier, req.Password, req.Role, req.Name)
	if err != nil {
		middleware.JSONError(w, err.Error(), http.StatusUnauthorized)
		return
	}

	token := fmt.Sprintf("haven_token_%s_%d", user.Role, time.Now().Unix())
	middleware.JSON(w, models.LoginResponse{
		User:  *user,
		Token: token,
	}, http.StatusOK)
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.JSONError(w, "Invalid registration payload", http.StatusBadRequest)
		return
	}
	if req.Name == "" || (req.Email == "" && req.Phone == "") {
		middleware.JSONError(w, "Name and either email or phone number are required", http.StatusBadRequest)
		return
	}
	if req.Role == "" {
		req.Role = models.RoleTenant
	}

	user, err := h.store.RegisterUser(req)
	if err != nil {
		middleware.JSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	token := fmt.Sprintf("haven_token_%s_%d", user.Role, time.Now().Unix())
	middleware.JSON(w, models.LoginResponse{
		User:  *user,
		Token: token,
	}, http.StatusCreated)
}

func (h *Handler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	identifier := r.URL.Query().Get("identifier")
	if identifier == "" {
		identifier = r.URL.Query().Get("email")
	}
	if identifier == "" {
		identifier = r.URL.Query().Get("phone")
	}

	if identifier == "" {
		middleware.JSONError(w, "Identifier (email or phone) is required", http.StatusBadRequest)
		return
	}

	user, err := h.store.FindUserByIdentifier(identifier)
	if err != nil {
		middleware.JSONError(w, "User not found", http.StatusNotFound)
		return
	}

	middleware.JSON(w, user, http.StatusOK)
}

func (h *Handler) GetTenantTickets(w http.ResponseWriter, r *http.Request) {
	tenantName := r.URL.Query().Get("tenantName")
	unitNumber := r.URL.Query().Get("unitNumber")
	unitID := r.URL.Query().Get("unitId")

	tickets := h.store.GetTenantRequests(tenantName, unitNumber, unitID)
	middleware.JSON(w, tickets, http.StatusOK)
}

func (h *Handler) SimulateMpesaPayment(w http.ResponseWriter, r *http.Request) {
	var req models.MpesaPaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.JSONError(w, "Invalid payment payload", http.StatusBadRequest)
		return
	}

	receipt := fmt.Sprintf("QK%s%04d", strings.ToUpper(fmt.Sprintf("%x", time.Now().UnixNano()%0xFFF)), time.Now().Nanosecond()%9000+1000)
	unitNum := req.Account
	if strings.HasPrefix(unitNum, "HAVEN-") {
		unitNum = strings.TrimPrefix(unitNum, "HAVEN-")
	}

	_ = h.store.RecordMpesaPayment(unitNum, req.Amount, receipt)

	middleware.JSON(w, models.MpesaPaymentResponse{
		Success:         true,
		ReceiptNumber:   receipt,
		Message:         fmt.Sprintf("KSh %.2f paid successfully to Haven Properties for Unit %s", req.Amount, unitNum),
		TransactionTime: time.Now().Format("02/01/2006 15:04:05"),
	}, http.StatusOK)
}

// Properties
func (h *Handler) ListProperties(w http.ResponseWriter, r *http.Request) {
	props := h.store.GetProperties()
	middleware.JSON(w, props, http.StatusOK)
}

func (h *Handler) GetProperty(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	prop, err := h.store.GetPropertyByID(id)
	if err != nil {
		middleware.JSONError(w, "Property not found", http.StatusNotFound)
		return
	}
	middleware.JSON(w, prop, http.StatusOK)
}

func (h *Handler) CreateProperty(w http.ResponseWriter, r *http.Request) {
	var req models.Property
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.JSONError(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	if req.Name == "" {
		middleware.JSONError(w, "Property name is required", http.StatusBadRequest)
		return
	}

	created, err := h.store.CreateProperty(req)
	if err != nil {
		middleware.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	middleware.JSON(w, created, http.StatusCreated)
}

func (h *Handler) UpdateProperty(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req models.Property
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.JSONError(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	updated, err := h.store.UpdateProperty(id, req)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			middleware.JSONError(w, "Property not found", http.StatusNotFound)
			return
		}
		middleware.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	middleware.JSON(w, updated, http.StatusOK)
}

func (h *Handler) DeleteProperty(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.store.DeleteProperty(id); err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			middleware.JSONError(w, "Property not found", http.StatusNotFound)
			return
		}
		middleware.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	middleware.JSON(w, map[string]string{"message": "Property deleted successfully"}, http.StatusOK)
}

// Units
func (h *Handler) ListUnits(w http.ResponseWriter, r *http.Request) {
	propertyID := r.URL.Query().Get("propertyId")
	units := h.store.GetUnits(propertyID)
	middleware.JSON(w, units, http.StatusOK)
}

func (h *Handler) GetUnit(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	unit, err := h.store.GetUnitByID(id)
	if err != nil {
		middleware.JSONError(w, "Unit not found", http.StatusNotFound)
		return
	}
	middleware.JSON(w, unit, http.StatusOK)
}

func (h *Handler) CreateUnit(w http.ResponseWriter, r *http.Request) {
	var req models.Unit
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.JSONError(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	if req.UnitNumber == "" || req.PropertyID == "" {
		middleware.JSONError(w, "Unit number and property ID are required", http.StatusBadRequest)
		return
	}

	created, err := h.store.CreateUnit(req)
	if err != nil {
		middleware.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	middleware.JSON(w, created, http.StatusCreated)
}

func (h *Handler) UpdateUnit(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req models.Unit
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.JSONError(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	updated, err := h.store.UpdateUnit(id, req)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			middleware.JSONError(w, "Unit not found", http.StatusNotFound)
			return
		}
		middleware.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	middleware.JSON(w, updated, http.StatusOK)
}

func (h *Handler) DeleteUnit(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.store.DeleteUnit(id); err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			middleware.JSONError(w, "Unit not found", http.StatusNotFound)
			return
		}
		middleware.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	middleware.JSON(w, map[string]string{"message": "Unit deleted successfully"}, http.StatusOK)
}

// Tenants
func (h *Handler) ListTenants(w http.ResponseWriter, r *http.Request) {
	tenants := h.store.GetTenants()
	middleware.JSON(w, tenants, http.StatusOK)
}

func (h *Handler) GetTenant(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	tenant, err := h.store.GetTenantByID(id)
	if err != nil {
		middleware.JSONError(w, "Tenant not found", http.StatusNotFound)
		return
	}
	middleware.JSON(w, tenant, http.StatusOK)
}

func (h *Handler) CreateTenant(w http.ResponseWriter, r *http.Request) {
	var req models.Tenant
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.JSONError(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	if req.Name == "" || req.PropertyID == "" {
		middleware.JSONError(w, "Tenant name and property ID are required", http.StatusBadRequest)
		return
	}

	created, err := h.store.CreateTenant(req)
	if err != nil {
		middleware.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	middleware.JSON(w, created, http.StatusCreated)
}

func (h *Handler) UpdateTenant(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req models.Tenant
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.JSONError(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	updated, err := h.store.UpdateTenant(id, req)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			middleware.JSONError(w, "Tenant not found", http.StatusNotFound)
			return
		}
		middleware.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	middleware.JSON(w, updated, http.StatusOK)
}

func (h *Handler) DeleteTenant(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.store.DeleteTenant(id); err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			middleware.JSONError(w, "Tenant not found", http.StatusNotFound)
			return
		}
		middleware.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	middleware.JSON(w, map[string]string{"message": "Tenant deleted successfully"}, http.StatusOK)
}

// Maintenance Requests
func (h *Handler) ListMaintenanceRequests(w http.ResponseWriter, r *http.Request) {
	reqs := h.store.GetMaintenanceRequests()
	middleware.JSON(w, reqs, http.StatusOK)
}

func (h *Handler) GetMaintenanceRequest(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	req, err := h.store.GetMaintenanceRequestByID(id)
	if err != nil {
		middleware.JSONError(w, "Maintenance request not found", http.StatusNotFound)
		return
	}
	middleware.JSON(w, req, http.StatusOK)
}

func (h *Handler) CreateMaintenanceRequest(w http.ResponseWriter, r *http.Request) {
	var req models.MaintenanceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.JSONError(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	if req.Title == "" || req.PropertyID == "" {
		middleware.JSONError(w, "Title and property are required", http.StatusBadRequest)
		return
	}

	// If AI Diagnosis was not supplied by client, generate it automatically
	if req.AIDiagnosis == nil {
		photoUrls := make([]string, 0, len(req.Photos))
		for _, p := range req.Photos {
			photoUrls = append(photoUrls, p.URL)
		}
		diag, err := h.aiService.DiagnoseBreakage(r.Context(), models.AIDiagnosisRequest{
			Title:       req.Title,
			Description: req.Description,
			Category:    string(req.Category),
			Photos:      photoUrls,
		})
		if err == nil {
			req.AIDiagnosis = diag
		}
	}

	created, err := h.store.CreateMaintenanceRequest(req)
	if err != nil {
		middleware.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	middleware.JSON(w, created, http.StatusCreated)
}

func (h *Handler) UpdateMaintenanceRequest(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req models.MaintenanceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.JSONError(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	updated, err := h.store.UpdateMaintenanceRequest(id, req)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			middleware.JSONError(w, "Maintenance request not found", http.StatusNotFound)
			return
		}
		middleware.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	middleware.JSON(w, updated, http.StatusOK)
}

func (h *Handler) DeleteMaintenanceRequest(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.store.DeleteMaintenanceRequest(id); err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			middleware.JSONError(w, "Maintenance request not found", http.StatusNotFound)
			return
		}
		middleware.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	middleware.JSON(w, map[string]string{"message": "Maintenance request deleted successfully"}, http.StatusOK)
}

// Maintenance Actions
func (h *Handler) UpdateMaintenanceStatus(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req models.StatusUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.JSONError(w, "Invalid status update payload", http.StatusBadRequest)
		return
	}

	updated, err := h.store.UpdateRequestStatus(id, req.Status, req.Comment)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			middleware.JSONError(w, "Maintenance request not found", http.StatusNotFound)
			return
		}
		middleware.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	middleware.JSON(w, updated, http.StatusOK)
}

func (h *Handler) UpdateMaintenancePriority(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req models.PriorityUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.JSONError(w, "Invalid priority update payload", http.StatusBadRequest)
		return
	}

	updated, err := h.store.UpdateRequestPriority(id, req.Priority)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			middleware.JSONError(w, "Maintenance request not found", http.StatusNotFound)
			return
		}
		middleware.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	middleware.JSON(w, updated, http.StatusOK)
}

func (h *Handler) AssignContractor(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req models.AssignContractorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.JSONError(w, "Invalid contractor dispatch payload", http.StatusBadRequest)
		return
	}
	if req.Name == "" || req.Company == "" {
		middleware.JSONError(w, "Contractor name and company are required", http.StatusBadRequest)
		return
	}

	updated, err := h.store.AssignContractor(id, req)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			middleware.JSONError(w, "Maintenance request not found", http.StatusNotFound)
			return
		}
		middleware.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	middleware.JSON(w, updated, http.StatusOK)
}

func (h *Handler) AddTimelineEntry(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req models.AddCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.JSONError(w, "Invalid timeline entry payload", http.StatusBadRequest)
		return
	}
	if req.Description == "" {
		middleware.JSONError(w, "Description is required", http.StatusBadRequest)
		return
	}

	author := req.Author
	if author == "" {
		author = "Landlord"
	}
	role := req.Role
	if role == "" {
		role = "landlord"
	}
	title := req.Title
	if title == "" {
		title = "Landlord Note"
	}

	entry, err := h.store.AddTimelineEntry(id, models.TimelineEntry{
		Author:      author,
		Role:        role,
		Title:       title,
		Description: req.Description,
		Type:        req.Type,
	})
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			middleware.JSONError(w, "Maintenance request not found", http.StatusNotFound)
			return
		}
		middleware.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	middleware.JSON(w, entry, http.StatusCreated)
}

// AI Diagnostics
func (h *Handler) DiagnoseAI(w http.ResponseWriter, r *http.Request) {
	var req models.AIDiagnosisRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.JSONError(w, "Invalid AI diagnosis payload", http.StatusBadRequest)
		return
	}
	if req.Title == "" {
		middleware.JSONError(w, "Title is required for damage diagnosis", http.StatusBadRequest)
		return
	}

	diag, err := h.aiService.DiagnoseBreakage(r.Context(), req)
	if err != nil {
		middleware.JSONError(w, fmt.Sprintf("AI diagnosis failed: %v", err), http.StatusInternalServerError)
		return
	}
	middleware.JSON(w, diag, http.StatusOK)
}

// Exports
func (h *Handler) ExportMaintenanceCSV(w http.ResponseWriter, r *http.Request) {
	reqs := h.store.GetMaintenanceRequests()
	csvBytes, err := h.exportService.ExportMaintenanceRequestsCSV(reqs)
	if err != nil {
		middleware.JSONError(w, fmt.Sprintf("Failed to generate CSV: %v", err), http.StatusInternalServerError)
		return
	}

	filename := services.FormatExportFilename("maintenance_kenya")
	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(csvBytes)
}

func (h *Handler) ExportTenantsCSV(w http.ResponseWriter, r *http.Request) {
	tenants := h.store.GetTenants()
	csvBytes, err := h.exportService.ExportTenantsCSV(tenants)
	if err != nil {
		middleware.JSONError(w, fmt.Sprintf("Failed to generate CSV: %v", err), http.StatusInternalServerError)
		return
	}

	filename := services.FormatExportFilename("residents_kenya")
	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(csvBytes)
}
