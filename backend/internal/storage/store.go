package storage

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"golang.org/x/crypto/bcrypt"

	"haven-property/backend/internal/models"
)

var (
	ErrNotFound = errors.New("record not found")
)

type Store struct {
	mu                  sync.RWMutex
	filePath            string
	properties          map[string]models.Property
	units               map[string]models.Unit
	tenants             map[string]models.Tenant
	maintenanceRequests map[string]models.MaintenanceRequest
	users               map[string]models.User
}

type dataSnapshot struct {
	Properties          []models.Property           `json:"properties"`
	Units               []models.Unit               `json:"units"`
	Tenants             []models.Tenant             `json:"tenants"`
	MaintenanceRequests []models.MaintenanceRequest `json:"maintenanceRequests"`
	Users               []models.User               `json:"users,omitempty"`
}

func NewStore(dataDir string) (*Store, error) {
	if dataDir != "" {
		if err := os.MkdirAll(dataDir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create data dir: %w", err)
		}
	}

	var filePath string
	if dataDir != "" {
		filePath = filepath.Join(dataDir, "haven_db.json")
	}

	s := &Store{
		filePath:            filePath,
		properties:          make(map[string]models.Property),
		units:               make(map[string]models.Unit),
		tenants:             make(map[string]models.Tenant),
		maintenanceRequests: make(map[string]models.MaintenanceRequest),
		users:               make(map[string]models.User),
	}

	// Try loading from file or fallback to seeds
	if err := s.loadFromFile(); err != nil {
		s.seedDefaults()
	}

	s.recalculateMetricsLocked()
	return s, nil
}

func (s *Store) seedDefaults() {
	s.properties = make(map[string]models.Property)
	s.units = make(map[string]models.Unit)
	s.tenants = make(map[string]models.Tenant)
	s.maintenanceRequests = make(map[string]models.MaintenanceRequest)
	s.users = make(map[string]models.User)

	for _, p := range GetInitialProperties() {
		s.properties[p.ID] = p
	}
	for _, u := range GetInitialUnits() {
		s.units[u.ID] = u
	}
	for _, t := range GetInitialTenants() {
		s.tenants[t.ID] = t
	}
	for _, r := range GetInitialMaintenanceRequests() {
		s.maintenanceRequests[r.ID] = r
	}
	for _, u := range GetInitialUsers() {
		u.Password = hashPassword(u.Password)
		s.users[u.ID] = u
	}
}

func hashPassword(password string) string {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		panic(fmt.Sprintf("failed to hash password: %v", err))
	}
	return string(hashed)
}

func passwordMatches(storedPassword, password string) bool {
	if password == "" {
		return false
	}
	if strings.HasPrefix(storedPassword, "$2a$") || strings.HasPrefix(storedPassword, "$2b$") || strings.HasPrefix(storedPassword, "$2y$") {
		return bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(password)) == nil
	}
	return storedPassword == password
}

func (s *Store) loadFromFile() error {
	if s.filePath == "" {
		return errors.New("no file path configured")
	}

	data, err := os.ReadFile(s.filePath)
	if err != nil {
		return err
	}

	var snapshot dataSnapshot
	if err := json.Unmarshal(data, &snapshot); err != nil {
		return err
	}

	if len(snapshot.Properties) == 0 && len(snapshot.Units) == 0 {
		return errors.New("empty snapshot")
	}

	s.properties = make(map[string]models.Property)
	for _, p := range snapshot.Properties {
		s.properties[p.ID] = p
	}

	s.units = make(map[string]models.Unit)
	for _, u := range snapshot.Units {
		s.units[u.ID] = u
	}

	s.tenants = make(map[string]models.Tenant)
	for _, t := range snapshot.Tenants {
		s.tenants[t.ID] = t
	}

	s.maintenanceRequests = make(map[string]models.MaintenanceRequest)
	for _, r := range snapshot.MaintenanceRequests {
		s.maintenanceRequests[r.ID] = r
	}

	s.users = make(map[string]models.User)
	for _, u := range snapshot.Users {
		s.users[u.ID] = u
	}
	if len(s.users) == 0 {
		for _, u := range GetInitialUsers() {
			s.users[u.ID] = u
		}
	}

	return nil
}

func (s *Store) saveToFileLocked() {
	if s.filePath == "" {
		return
	}

	snapshot := dataSnapshot{
		Properties:          make([]models.Property, 0, len(s.properties)),
		Units:               make([]models.Unit, 0, len(s.units)),
		Tenants:             make([]models.Tenant, 0, len(s.tenants)),
		MaintenanceRequests: make([]models.MaintenanceRequest, 0, len(s.maintenanceRequests)),
		Users:               make([]models.User, 0, len(s.users)),
	}

	for _, p := range s.properties {
		snapshot.Properties = append(snapshot.Properties, p)
	}
	for _, u := range s.units {
		snapshot.Units = append(snapshot.Units, u)
	}
	for _, t := range s.tenants {
		snapshot.Tenants = append(snapshot.Tenants, t)
	}
	for _, r := range s.maintenanceRequests {
		snapshot.MaintenanceRequests = append(snapshot.MaintenanceRequests, r)
	}
	for _, u := range s.users {
		snapshot.Users = append(snapshot.Users, u)
	}

	bytes, err := json.MarshalIndent(snapshot, "", "  ")
	if err != nil {
		return
	}
	tmpPath := s.filePath + ".tmp"
	if err := os.WriteFile(tmpPath, bytes, 0600); err != nil {
		return
	}
	if err := os.Rename(tmpPath, s.filePath); err != nil {
		_ = os.Remove(tmpPath)
	}
}

// Recalculate metrics ensures totalUnits, occupiedUnits, and monthlyRevenue are always 100% accurate
func (s *Store) recalculateMetricsLocked() {
	for propID, prop := range s.properties {
		var totalUnits int
		var occupiedUnits int
		var monthlyRev float64

		for _, u := range s.units {
			if u.PropertyID == propID {
				totalUnits++
				if u.Status == models.UnitStatusOccupied {
					occupiedUnits++
					monthlyRev += u.RentAmount
				}
			}
		}

		if totalUnits > 0 {
			prop.TotalUnits = totalUnits
		}
		prop.OccupiedUnits = occupiedUnits
		prop.MonthlyRevenue = monthlyRev
		s.properties[propID] = prop
	}
}

func (s *Store) Reset() {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.seedDefaults()
	s.recalculateMetricsLocked()
	s.saveToFileLocked()
}

// --- USER & AUTH METHODS ---

func (s *Store) GetUsers() []models.User {
	s.mu.RLock()
	defer s.mu.RUnlock()

	res := make([]models.User, 0, len(s.users))
	for _, u := range s.users {
		res = append(res, u)
	}
	return res
}

func (s *Store) GetUserByID(id string) (*models.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	u, ok := s.users[id]
	if !ok {
		return nil, ErrNotFound
	}
	return &u, nil
}

func normalizePhone(raw string) string {
	digits := ""
	for _, ch := range raw {
		if ch >= '0' && ch <= '9' {
			digits += string(ch)
		}
	}
	if strings.HasPrefix(digits, "254") {
		digits = digits[3:]
	} else if strings.HasPrefix(digits, "0") {
		digits = digits[1:]
	}
	return digits
}

func (s *Store) FindUserByIdentifier(identifier string) (*models.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	cleanIdent := strings.TrimSpace(identifier)
	cleanPhone := normalizePhone(cleanIdent)

	for _, u := range s.users {
		// Match by Email
		if strings.EqualFold(strings.TrimSpace(u.Email), cleanIdent) {
			return &u, nil
		}
		// Match by Phone
		if cleanPhone != "" && normalizePhone(u.Phone) == cleanPhone {
			return &u, nil
		}
	}
	return nil, ErrNotFound
}

func (s *Store) Authenticate(identifier string, password string, roleHint string, nameHint string) (*models.User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	cleanIdent := strings.TrimSpace(identifier)
	cleanPhone := normalizePhone(cleanIdent)

	// 1. Check if user already exists
	for _, u := range s.users {
		matchedEmail := strings.EqualFold(strings.TrimSpace(u.Email), cleanIdent)
		matchedPhone := cleanPhone != "" && normalizePhone(u.Phone) == cleanPhone

		if matchedEmail || matchedPhone {
			if !passwordMatches(u.Password, password) {
				return nil, errors.New("invalid credentials")
			}
			if !strings.HasPrefix(u.Password, "$2a$") && !strings.HasPrefix(u.Password, "$2b$") && !strings.HasPrefix(u.Password, "$2y$") {
				u.Password = hashPassword(password)
				s.users[u.ID] = u
				s.saveToFileLocked()
			}
			return &u, nil
		}
	}

	// 2. If user doesn't exist, create a real account dynamically
	newID := fmt.Sprintf("user-%d", time.Now().UnixNano())
	userRole := models.RoleTenant
	if roleHint == "landlord" {
		userRole = models.RoleLandlord
	}

	userName := nameHint
	if userName == "" {
		if userRole == models.RoleLandlord {
			userName = "Property Manager"
		} else {
			userName = "Apartment Resident"
		}
	}

	isEmail := strings.Contains(cleanIdent, "@")
	userEmail := "resident@havenmgmt.co.ke"
	userPhone := "+254 700 000 000"

	if isEmail {
		userEmail = cleanIdent
	} else if cleanPhone != "" {
		userPhone = "+254 " + cleanPhone
		userEmail = fmt.Sprintf("tenant.%s@havenmgmt.co.ke", cleanPhone)
	}

	if password == "" {
		return nil, errors.New("password is required")
	}

	newUser := models.User{
		ID:        newID,
		Name:      userName,
		Email:     userEmail,
		Phone:     userPhone,
		Password:  hashPassword(password),
		Role:      userRole,
		AvatarURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}

	if userRole == models.RoleTenant {
		newUser.PropertyID = "prop-1"
		newUser.PropertyName = "Kilimani Heights Apartments"
		newUser.UnitID = "unit-102"
		newUser.UnitNumber = "4B"
		rent := 75000.0
		newUser.RentAmount = &rent
		newUser.MpesaAccount = "HAVEN-4B"
	}

	s.users[newID] = newUser
	s.saveToFileLocked()
	return &newUser, nil
}

func (s *Store) RegisterUser(req models.RegisterRequest) (*models.User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	cleanEmail := strings.TrimSpace(req.Email)
	cleanPhone := normalizePhone(req.Phone)

	for _, u := range s.users {
		if cleanEmail != "" && strings.EqualFold(u.Email, cleanEmail) {
			return nil, errors.New("an account with this email address already exists")
		}
		if cleanPhone != "" && normalizePhone(u.Phone) == cleanPhone {
			return nil, errors.New("an account with this phone number already exists")
		}
	}

	newID := fmt.Sprintf("user-%d", time.Now().UnixNano())
	userPass := req.Password
	if userPass == "" {
		userPass = "haven2026"
	}

	newUser := models.User{
		ID:           newID,
		Name:         req.Name,
		Email:        cleanEmail,
		Phone:        req.Phone,
		Password:     userPass,
		Role:         req.Role,
		PropertyID:   req.PropertyID,
		PropertyName: req.PropertyName,
		UnitNumber:   req.UnitNumber,
		RentAmount:   req.RentAmount,
		AvatarURL:    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
		CreatedAt:    time.Now().UTC().Format(time.RFC3339),
	}

	if newUser.Role == models.RoleTenant {
		if newUser.PropertyName == "" {
			newUser.PropertyID = "prop-1"
			newUser.PropertyName = "Kilimani Heights Apartments"
		}
		if newUser.UnitNumber == "" {
			newUser.UnitNumber = "3A"
		}
		if newUser.RentAmount == nil {
			r := 75000.0
			newUser.RentAmount = &r
		}
		newUser.MpesaAccount = fmt.Sprintf("HAVEN-%s", newUser.UnitNumber)
	}

	s.users[newID] = newUser
	s.saveToFileLocked()
	return &newUser, nil
}

func (s *Store) GetTenantRequests(tenantName, unitNumber, unitID string) []models.MaintenanceRequest {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var res []models.MaintenanceRequest
	for _, r := range s.maintenanceRequests {
		if unitID != "" && r.UnitID == unitID {
			res = append(res, r)
			continue
		}
		if unitNumber != "" && r.UnitNumber == unitNumber {
			res = append(res, r)
			continue
		}
		if tenantName != "" && strings.Contains(strings.ToLower(r.TenantName), strings.ToLower(tenantName)) {
			res = append(res, r)
			continue
		}
	}
	return res
}

func (s *Store) RecordMpesaPayment(unitNumber string, amount float64, receiptRef string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for id, t := range s.tenants {
		if t.UnitNumber == unitNumber {
			t.RentStatus = models.RentStatusPaid
			t.LastMpesaReceipt = receiptRef
			s.tenants[id] = t
			s.saveToFileLocked()
			return nil
		}
	}
	return nil
}

// --- PROPERTIES CRUD ---

func (s *Store) GetProperties() []models.Property {
	s.mu.RLock()
	defer s.mu.RUnlock()

	props := make([]models.Property, 0, len(s.properties))
	for _, p := range s.properties {
		props = append(props, p)
	}
	return props
}

func (s *Store) GetPropertyByID(id string) (*models.Property, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	p, ok := s.properties[id]
	if !ok {
		return nil, ErrNotFound
	}
	return &p, nil
}

func (s *Store) CreateProperty(p models.Property) (*models.Property, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if p.ID == "" {
		p.ID = fmt.Sprintf("prop-%d", time.Now().UnixNano())
	}
	if p.ImageURL == "" {
		p.ImageURL = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
	}
	p.OccupiedUnits = 0
	p.MonthlyRevenue = 0

	s.properties[p.ID] = p
	s.saveToFileLocked()

	created := s.properties[p.ID]
	return &created, nil
}

func (s *Store) UpdateProperty(id string, updates models.Property) (*models.Property, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, ok := s.properties[id]
	if !ok {
		return nil, ErrNotFound
	}

	updates.ID = id
	updates.OccupiedUnits = existing.OccupiedUnits
	updates.MonthlyRevenue = existing.MonthlyRevenue
	s.properties[id] = updates
	s.recalculateMetricsLocked()
	s.saveToFileLocked()

	updated := s.properties[id]
	return &updated, nil
}

func (s *Store) DeleteProperty(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.properties[id]; !ok {
		return ErrNotFound
	}

	delete(s.properties, id)

	// Cascade delete associated units
	for uid, u := range s.units {
		if u.PropertyID == id {
			delete(s.units, uid)
		}
	}

	s.saveToFileLocked()
	return nil
}

// --- UNITS CRUD ---

func (s *Store) GetUnits(propertyID string) []models.Unit {
	s.mu.RLock()
	defer s.mu.RUnlock()

	units := make([]models.Unit, 0, len(s.units))
	for _, u := range s.units {
		if propertyID == "" || u.PropertyID == propertyID {
			units = append(units, u)
		}
	}
	return units
}

func (s *Store) GetUnitByID(id string) (*models.Unit, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	u, ok := s.units[id]
	if !ok {
		return nil, ErrNotFound
	}
	return &u, nil
}

func (s *Store) CreateUnit(u models.Unit) (*models.Unit, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if u.ID == "" {
		u.ID = fmt.Sprintf("unit-%d", time.Now().UnixNano())
	}
	if u.Status == "" {
		u.Status = models.UnitStatusVacant
	}

	s.units[u.ID] = u
	s.recalculateMetricsLocked()
	s.saveToFileLocked()

	created := s.units[u.ID]
	return &created, nil
}

func (s *Store) UpdateUnit(id string, u models.Unit) (*models.Unit, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.units[id]; !ok {
		return nil, ErrNotFound
	}

	u.ID = id
	s.units[id] = u
	s.recalculateMetricsLocked()
	s.saveToFileLocked()

	updated := s.units[id]
	return &updated, nil
}

func (s *Store) DeleteUnit(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.units[id]; !ok {
		return ErrNotFound
	}

	delete(s.units, id)
	s.recalculateMetricsLocked()
	s.saveToFileLocked()
	return nil
}

// --- TENANTS CRUD ---

func (s *Store) GetTenants() []models.Tenant {
	s.mu.RLock()
	defer s.mu.RUnlock()

	tenants := make([]models.Tenant, 0, len(s.tenants))
	for _, t := range s.tenants {
		tenants = append(tenants, t)
	}
	return tenants
}

func (s *Store) GetTenantByID(id string) (*models.Tenant, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	t, ok := s.tenants[id]
	if !ok {
		return nil, ErrNotFound
	}
	return &t, nil
}

func (s *Store) CreateTenant(t models.Tenant) (*models.Tenant, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if t.ID == "" {
		t.ID = fmt.Sprintf("tenant-%d", time.Now().UnixNano())
	}
	if t.RentStatus == "" {
		t.RentStatus = models.RentStatusPaid
	}

	s.tenants[t.ID] = t

	// Mark unit as occupied
	if u, ok := s.units[t.UnitID]; ok {
		u.Status = models.UnitStatusOccupied
		u.CurrentTenantID = t.ID
		u.LeaseStart = t.LeaseStart
		u.LeaseEnd = t.LeaseEnd
		s.units[t.UnitID] = u
	}

	s.recalculateMetricsLocked()
	s.saveToFileLocked()

	created := s.tenants[t.ID]
	return &created, nil
}

func (s *Store) UpdateTenant(id string, t models.Tenant) (*models.Tenant, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.tenants[id]; !ok {
		return nil, ErrNotFound
	}

	t.ID = id
	s.tenants[id] = t
	s.saveToFileLocked()

	updated := s.tenants[id]
	return &updated, nil
}

func (s *Store) DeleteTenant(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	t, ok := s.tenants[id]
	if !ok {
		return ErrNotFound
	}

	// Free up unit
	if u, ok := s.units[t.UnitID]; ok {
		u.Status = models.UnitStatusVacant
		u.CurrentTenantID = ""
		s.units[t.UnitID] = u
	}

	delete(s.tenants, id)
	s.recalculateMetricsLocked()
	s.saveToFileLocked()
	return nil
}

// --- MAINTENANCE REQUESTS CRUD ---

func (s *Store) GetMaintenanceRequests() []models.MaintenanceRequest {
	s.mu.RLock()
	defer s.mu.RUnlock()

	requests := make([]models.MaintenanceRequest, 0, len(s.maintenanceRequests))
	for _, r := range s.maintenanceRequests {
		requests = append(requests, r)
	}
	return requests
}

func (s *Store) GetMaintenanceRequestByID(id string) (*models.MaintenanceRequest, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	r, ok := s.maintenanceRequests[id]
	if !ok {
		return nil, ErrNotFound
	}
	return &r, nil
}

func (s *Store) CreateMaintenanceRequest(r models.MaintenanceRequest) (*models.MaintenanceRequest, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now().UTC().Format(time.RFC3339)
	if r.ID == "" {
		r.ID = fmt.Sprintf("req-%d", time.Now().UnixNano())
	}
	if r.TicketNumber == "" {
		r.TicketNumber = fmt.Sprintf("TKT-%04d", len(s.maintenanceRequests)+1001)
	}
	if r.Status == "" {
		r.Status = models.StatusNew
	}
	if r.Priority == "" {
		r.Priority = models.PriorityMedium
	}
	r.CreatedAt = now
	r.UpdatedAt = now

	if len(r.Timeline) == 0 {
		r.Timeline = []models.TimelineEntry{
			{
				ID:          fmt.Sprintf("t-%d", time.Now().UnixNano()),
				Timestamp:   now,
				Author:      r.TenantName,
				Role:        "tenant",
				Title:       "Breakage Ticket Logged",
				Description: fmt.Sprintf("Report filed for %s (%s).", r.PropertyName, r.UnitNumber),
				Type:        "creation",
			},
		}
	}

	s.maintenanceRequests[r.ID] = r
	s.saveToFileLocked()

	created := s.maintenanceRequests[r.ID]
	return &created, nil
}

func (s *Store) UpdateMaintenanceRequest(id string, r models.MaintenanceRequest) (*models.MaintenanceRequest, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, ok := s.maintenanceRequests[id]
	if !ok {
		return nil, ErrNotFound
	}

	r.ID = id
	r.TicketNumber = existing.TicketNumber
	r.CreatedAt = existing.CreatedAt
	r.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	s.maintenanceRequests[id] = r
	s.saveToFileLocked()

	updated := s.maintenanceRequests[id]
	return &updated, nil
}

func (s *Store) DeleteMaintenanceRequest(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.maintenanceRequests[id]; !ok {
		return ErrNotFound
	}
	delete(s.maintenanceRequests, id)
	s.saveToFileLocked()
	return nil
}

func (s *Store) AddTimelineEntry(requestID string, entry models.TimelineEntry) (*models.TimelineEntry, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	req, ok := s.maintenanceRequests[requestID]
	if !ok {
		return nil, ErrNotFound
	}

	now := time.Now().UTC().Format(time.RFC3339)
	if entry.ID == "" {
		entry.ID = fmt.Sprintf("t-%d", time.Now().UnixNano())
	}
	if entry.Timestamp == "" {
		entry.Timestamp = now
	}
	if entry.Type == "" {
		entry.Type = "comment"
	}

	req.Timeline = append(req.Timeline, entry)
	req.UpdatedAt = now
	s.maintenanceRequests[requestID] = req
	s.saveToFileLocked()

	return &entry, nil
}

func (s *Store) AssignContractor(requestID string, c models.AssignContractorRequest) (*models.MaintenanceRequest, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	req, ok := s.maintenanceRequests[requestID]
	if !ok {
		return nil, ErrNotFound
	}

	now := time.Now().UTC().Format(time.RFC3339)
	req.AssignedContractor = &models.ContractorInfo{
		Name:             c.Name,
		Company:          c.Company,
		Phone:            c.Phone,
		WhatsApp:         c.WhatsApp,
		ScheduledDate:    c.ScheduledDate,
		EstimatedArrival: c.EstimatedArrival,
	}
	if c.EstimatedCost != nil {
		req.RepairCost = c.EstimatedCost
	}
	req.Status = models.StatusScheduled
	req.UpdatedAt = now

	// Timeline entry for contractor assignment
	schedStr := c.ScheduledDate
	if c.EstimatedArrival != "" {
		schedStr = fmt.Sprintf("%s (%s)", c.ScheduledDate, c.EstimatedArrival)
	}
	req.Timeline = append(req.Timeline, models.TimelineEntry{
		ID:          fmt.Sprintf("t-%d", time.Now().UnixNano()),
		Timestamp:   now,
		Author:      "Eleanor Wanjiku (Landlord)",
		Role:        "landlord",
		Title:       fmt.Sprintf("Fundi Dispatched: %s", c.Name),
		Description: fmt.Sprintf("Assigned to %s (%s) for %s.", c.Name, c.Company, schedStr),
		Type:        "contractor",
	})

	s.maintenanceRequests[requestID] = req
	s.saveToFileLocked()

	updated := s.maintenanceRequests[requestID]
	return &updated, nil
}

func (s *Store) UpdateRequestStatus(requestID string, status models.IssueStatus, comment string) (*models.MaintenanceRequest, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	req, ok := s.maintenanceRequests[requestID]
	if !ok {
		return nil, ErrNotFound
	}

	now := time.Now().UTC().Format(time.RFC3339)
	req.Status = status
	req.UpdatedAt = now
	if status == models.StatusResolved {
		req.ResolvedAt = now
	}

	desc := comment
	if desc == "" {
		desc = fmt.Sprintf("Ticket status changed to %s.", status)
	}

	req.Timeline = append(req.Timeline, models.TimelineEntry{
		ID:          fmt.Sprintf("t-%d", time.Now().UnixNano()),
		Timestamp:   now,
		Author:      "Eleanor Wanjiku (Landlord)",
		Role:        "landlord",
		Title:       fmt.Sprintf("Status Changed: %s", status),
		Description: desc,
		Type:        "status_change",
	})

	s.maintenanceRequests[requestID] = req
	s.saveToFileLocked()

	updated := s.maintenanceRequests[requestID]
	return &updated, nil
}

func (s *Store) UpdateRequestPriority(requestID string, priority models.IssuePriority) (*models.MaintenanceRequest, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	req, ok := s.maintenanceRequests[requestID]
	if !ok {
		return nil, ErrNotFound
	}

	req.Priority = priority
	req.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
	s.maintenanceRequests[requestID] = req
	s.saveToFileLocked()

	updated := s.maintenanceRequests[requestID]
	return &updated, nil
}

// --- PORTFOLIO STATS COMPUTATION ---

func (s *Store) GetStats() models.PortfolioStats {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var totalUnits int
	var occupiedUnits int
	var monthlyRev float64

	for _, u := range s.units {
		totalUnits++
		if u.Status == models.UnitStatusOccupied {
			occupiedUnits++
			monthlyRev += u.RentAmount
		}
	}

	var occupancyRate int
	if totalUnits > 0 {
		occupancyRate = int((float64(occupiedUnits) / float64(totalUnits)) * 100)
	}

	var openIssues, emergencyIssues, scheduledIssues, resolvedIssues int
	var totalEstCost float64
	categoryCounts := make(map[string]int)

	for _, r := range s.maintenanceRequests {
		categoryCounts[string(r.Category)]++

		if r.Status == models.StatusResolved {
			resolvedIssues++
		} else {
			openIssues++
		}

		if r.Priority == models.PriorityEmergency && r.Status != models.StatusResolved {
			emergencyIssues++
		}

		if r.Status == models.StatusScheduled || r.Status == models.StatusInProgress {
			scheduledIssues++
		}

		if r.RepairCost != nil {
			totalEstCost += *r.RepairCost
		}
	}

	return models.PortfolioStats{
		TotalProperties:    len(s.properties),
		TotalUnits:         totalUnits,
		OccupiedUnits:      occupiedUnits,
		OccupancyRate:      occupancyRate,
		MonthlyRevenue:     monthlyRev,
		OpenIssues:         openIssues,
		EmergencyIssues:    emergencyIssues,
		ScheduledIssues:    scheduledIssues,
		ResolvedIssues:     resolvedIssues,
		TotalEstimatedCost: totalEstCost,
		CategoryCounts:     categoryCounts,
		GeneratedAt:        time.Now().UTC(),
	}
}
