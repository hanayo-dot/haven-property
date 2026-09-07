package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"haven-property/backend/internal/handlers"
	"haven-property/backend/internal/models"
	"haven-property/backend/internal/services"
	"haven-property/backend/internal/storage"
)

func setupTestRouter(t *testing.T) (*http.ServeMux, *storage.Store) {
	tempDir, err := os.MkdirTemp("", "haven-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	t.Cleanup(func() {
		_ = os.RemoveAll(tempDir)
	})

	store, err := storage.NewStore(tempDir)
	if err != nil {
		t.Fatalf("failed to init store: %v", err)
	}

	ai := services.NewAIService()
	export := services.NewExportService()

	mux := http.NewServeMux()
	h := handlers.NewHandler(store, ai, export)
	h.RegisterRoutes(mux)

	return mux, store
}

func TestHealthCheck(t *testing.T) {
	mux, _ := setupTestRouter(t)

	req := httptest.NewRequest("GET", "/api/health", nil)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}

	var resp map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to parse json response: %v", err)
	}
	if resp["status"] != "healthy" {
		t.Fatalf("expected status 'healthy', got %v", resp["status"])
	}
}

func TestStatsEndpoint(t *testing.T) {
	mux, _ := setupTestRouter(t)

	req := httptest.NewRequest("GET", "/api/stats", nil)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}

	var stats models.PortfolioStats
	if err := json.NewDecoder(w.Body).Decode(&stats); err != nil {
		t.Fatalf("failed to parse stats: %v", err)
	}

	if stats.TotalProperties != 3 {
		t.Errorf("expected 3 initial properties, got %d", stats.TotalProperties)
	}
	if stats.OccupiedUnits <= 0 {
		t.Errorf("expected occupied units > 0, got %d", stats.OccupiedUnits)
	}
}

func TestAuthAndLogin(t *testing.T) {
	mux, _ := setupTestRouter(t)

	// 1. List Demo Users
	req := httptest.NewRequest("GET", "/api/auth/users", nil)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var users []models.User
	_ = json.NewDecoder(w.Body).Decode(&users)
	if len(users) < 4 {
		t.Errorf("expected at least 4 demo users, got %d", len(users))
	}

	// 2. Login Landlord
	loginBody, _ := json.Marshal(models.LoginRequest{
		Email:    "wanjiku@havenmgmt.co.ke",
		Role:     "landlord",
		Password: "haven2026",
	})
	req = httptest.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(loginBody))
	w = httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var landlordResp models.LoginResponse
	_ = json.NewDecoder(w.Body).Decode(&landlordResp)
	if landlordResp.User.Role != models.RoleLandlord {
		t.Errorf("expected landlord role, got %s", landlordResp.User.Role)
	}

	// 3. Login Tenant by Email
	tenantLoginBody, _ := json.Marshal(models.LoginRequest{
		Identifier: "juma.ochieng@gmail.com",
		Password:   "haven2026",
	})
	req = httptest.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(tenantLoginBody))
	w = httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var tenantResp models.LoginResponse
	_ = json.NewDecoder(w.Body).Decode(&tenantResp)
	if tenantResp.User.Role != models.RoleTenant {
		t.Errorf("expected tenant role, got %s", tenantResp.User.Role)
	}
	if tenantResp.User.UnitNumber != "4B" {
		t.Errorf("expected unit 4B, got %s", tenantResp.User.UnitNumber)
	}

	// 4. Login Tenant by Kenyan Phone Number (0712345678)
	phoneLoginBody, _ := json.Marshal(models.LoginRequest{
		Identifier: "0712345678",
		Password:   "haven2026",
	})
	req = httptest.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(phoneLoginBody))
	w = httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var phoneResp models.LoginResponse
	_ = json.NewDecoder(w.Body).Decode(&phoneResp)
	if phoneResp.User.Name != "Juma Ochieng" {
		t.Errorf("expected Juma Ochieng from phone login, got %s", phoneResp.User.Name)
	}

	// 5. Register a brand new resident
	regBody, _ := json.Marshal(models.RegisterRequest{
		Name:         "Grace Wangari",
		Email:        "grace.w@gmail.com",
		Phone:        "+254 799 111 222",
		Password:     "secretpass",
		Role:         models.RoleTenant,
		PropertyID:   "prop-1",
		PropertyName: "Kilimani Heights Apartments",
		UnitNumber:   "5A",
	})
	req = httptest.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(regBody))
	w = httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201 created, got %d", w.Code)
	}

	var regResp models.LoginResponse
	_ = json.NewDecoder(w.Body).Decode(&regResp)
	if regResp.User.Name != "Grace Wangari" {
		t.Errorf("expected Grace Wangari, got %s", regResp.User.Name)
	}
	if regResp.User.UnitNumber != "5A" {
		t.Errorf("expected unit 5A, got %s", regResp.User.UnitNumber)
	}
}

func TestMpesaSimulation(t *testing.T) {
	mux, _ := setupTestRouter(t)

	body, _ := json.Marshal(models.MpesaPaymentRequest{
		TenantID:    "user-tenant-1",
		PhoneNumber: "+254 712 345 678",
		Amount:      75000,
		Account:     "HAVEN-4B",
	})
	req := httptest.NewRequest("POST", "/api/tenant/mpesa/simulate", bytes.NewBuffer(body))
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var mpesaResp models.MpesaPaymentResponse
	_ = json.NewDecoder(w.Body).Decode(&mpesaResp)
	if !mpesaResp.Success || mpesaResp.ReceiptNumber == "" {
		t.Errorf("expected successful M-Pesa receipt, got %+v", mpesaResp)
	}
}

func TestPropertyCRUD(t *testing.T) {
	mux, _ := setupTestRouter(t)

	// 1. List properties
	req := httptest.NewRequest("GET", "/api/properties", nil)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	// 2. Create property
	newProp := models.Property{
		Name:    "Lavington Greens Court",
		Address: "James Gichuru Road",
		City:    "Nairobi",
		State:   "Lavington",
		Zip:     "00100",
		Type:    "Residential Court",
	}
	body, _ := json.Marshal(newProp)
	req = httptest.NewRequest("POST", "/api/properties", bytes.NewBuffer(body))
	w = httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201 created, got %d (body: %s)", w.Code, w.Body.String())
	}

	var created models.Property
	_ = json.NewDecoder(w.Body).Decode(&created)
	if created.ID == "" || created.Name != "Lavington Greens Court" {
		t.Fatalf("invalid created property: %+v", created)
	}

	// 3. Get single property
	req = httptest.NewRequest("GET", "/api/properties/"+created.ID, nil)
	w = httptest.NewRecorder()
	mux.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	// 4. Delete property
	req = httptest.NewRequest("DELETE", "/api/properties/"+created.ID, nil)
	w = httptest.NewRecorder()
	mux.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
}

func TestMaintenanceWorkflow(t *testing.T) {
	mux, _ := setupTestRouter(t)

	// Create a new maintenance ticket
	newReq := models.MaintenanceRequest{
		PropertyID:      "prop-1",
		PropertyName:    "Kilimani Heights Apartments",
		UnitID:          "unit-101",
		UnitNumber:      "4B",
		TenantName:      "Juma Ochieng",
		TenantPhone:     "+254 712 345 678",
		TenantEmail:     "juma.ochieng@gmail.com",
		Title:           "Kitchen sink tap leak",
		Description:     "Water pooling underneath sink fitting",
		Category:        models.CategoryPlumbing,
		Priority:        models.PriorityHigh,
		Status:          models.StatusNew,
		EntryPermission: true,
	}

	body, _ := json.Marshal(newReq)
	req := httptest.NewRequest("POST", "/api/maintenance", bytes.NewBuffer(body))
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d (body: %s)", w.Code, w.Body.String())
	}

	var created models.MaintenanceRequest
	_ = json.NewDecoder(w.Body).Decode(&created)
	if created.ID == "" {
		t.Fatalf("expected ID to be set")
	}
	if created.AIDiagnosis == nil {
		t.Errorf("expected AI diagnosis to be auto-generated")
	}

	// Assign fundi / contractor
	cost := 3500.0
	contractorReq := models.AssignContractorRequest{
		Name:             "Fundi John Onyango",
		Company:          "Apex Plumbing Nairobi",
		Phone:            "+254 722 889 900",
		ScheduledDate:    "2026-08-25",
		EstimatedArrival: "10:00 AM",
		EstimatedCost:    &cost,
	}
	cBody, _ := json.Marshal(contractorReq)
	req = httptest.NewRequest("POST", "/api/maintenance/"+created.ID+"/contractor", bytes.NewBuffer(cBody))
	w = httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var assigned models.MaintenanceRequest
	_ = json.NewDecoder(w.Body).Decode(&assigned)
	if assigned.Status != models.StatusScheduled {
		t.Errorf("expected status 'Scheduled', got %s", assigned.Status)
	}
	if assigned.AssignedContractor == nil || assigned.AssignedContractor.Name != "Fundi John Onyango" {
		t.Errorf("expected contractor Fundi John Onyango, got %+v", assigned.AssignedContractor)
	}

	// Update status to Resolved
	statusReq := models.StatusUpdateRequest{
		Status:  models.StatusResolved,
		Comment: "Repaired pipe joint with new rubber washer and thread seal tape",
	}
	sBody, _ := json.Marshal(statusReq)
	req = httptest.NewRequest("POST", "/api/maintenance/"+created.ID+"/status", bytes.NewBuffer(sBody))
	w = httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var resolved models.MaintenanceRequest
	_ = json.NewDecoder(w.Body).Decode(&resolved)
	if resolved.Status != models.StatusResolved {
		t.Errorf("expected status 'Resolved', got %s", resolved.Status)
	}
	if resolved.ResolvedAt == "" {
		t.Errorf("expected resolvedAt timestamp to be set")
	}
}

func TestExportCSV(t *testing.T) {
	mux, _ := setupTestRouter(t)

	req := httptest.NewRequest("GET", "/api/export/maintenance", nil)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	if w.Header().Get("Content-Type") != "text/csv; charset=utf-8" {
		t.Errorf("expected text/csv content type, got %s", w.Header().Get("Content-Type"))
	}
	if w.Body.Len() == 0 {
		t.Errorf("expected non-empty CSV body")
	}
}
