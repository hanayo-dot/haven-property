package models

import "time"

type UserRole string

const (
	RoleLandlord UserRole = "landlord"
	RoleTenant   UserRole = "tenant"
)

type User struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Email        string   `json:"email"`
	Phone        string   `json:"phone"`
	Password     string   `json:"-"`
	Role         UserRole `json:"role"` // "landlord" | "tenant"
	PropertyID   string   `json:"propertyId,omitempty"`
	PropertyName string   `json:"propertyName,omitempty"`
	UnitID       string   `json:"unitId,omitempty"`
	UnitNumber   string   `json:"unitNumber,omitempty"`
	RentAmount   *float64 `json:"rentAmount,omitempty"` // in KSh.
	MpesaAccount string   `json:"mpesaAccount,omitempty"`
	AvatarURL    string   `json:"avatarUrl,omitempty"`
	CreatedAt    string   `json:"createdAt,omitempty"`
}

type IssueCategory string

const (
	CategoryPlumbing          IssueCategory = "Plumbing"
	CategoryElectrical        IssueCategory = "Electrical"
	CategoryAppliance         IssueCategory = "Appliance"
	CategoryHVAC              IssueCategory = "HVAC / Climate"
	CategoryStructuralWindows IssueCategory = "Structural & Windows"
	CategoryLocksSecurity     IssueCategory = "Locks & Security"
	CategoryPestControl       IssueCategory = "Pest Control"
	CategoryOther             IssueCategory = "Other"
)

type IssuePriority string

const (
	PriorityEmergency IssuePriority = "Emergency"
	PriorityHigh      IssuePriority = "High"
	PriorityMedium    IssuePriority = "Medium"
	PriorityLow       IssuePriority = "Low"
)

type IssueStatus string

const (
	StatusNew         IssueStatus = "New"
	StatusUnderReview IssueStatus = "Under Review"
	StatusScheduled   IssueStatus = "Scheduled"
	StatusInProgress  IssueStatus = "In Progress"
	StatusResolved    IssueStatus = "Resolved"
)

type RentStatus string

const (
	RentStatusPaid    RentStatus = "Paid"
	RentStatusPending RentStatus = "Pending"
	RentStatusOverdue RentStatus = "Overdue"
)

type UnitStatus string

const (
	UnitStatusOccupied    UnitStatus = "Occupied"
	UnitStatusVacant      UnitStatus = "Vacant"
	UnitStatusMaintenance UnitStatus = "Maintenance"
)

type DamagePhoto struct {
	ID        string `json:"id"`
	URL       string `json:"url"`
	Caption   string `json:"caption,omitempty"`
	Timestamp string `json:"timestamp"`
	Tag       string `json:"tag,omitempty"`
}

type TimelineEntry struct {
	ID          string `json:"id"`
	Timestamp   string `json:"timestamp"`
	Author      string `json:"author"`
	Role        string `json:"role"` // 'landlord' | 'tenant' | 'system' | 'contractor'
	Title       string `json:"title"`
	Description string `json:"description"`
	Type        string `json:"type"` // 'status_change' | 'comment' | 'contractor' | 'cost' | 'creation'
}

type AIDiagnosis struct {
	CategorySummary    string   `json:"categorySummary"`
	SeverityAssessment string   `json:"severityAssessment"`
	EstimatedCostRange string   `json:"estimatedCostRange"` // in KSh.
	RecommendedAction  string   `json:"recommendedAction"`
	UrgentSafetyTips   []string `json:"urgentSafetyTips,omitempty"`
	SuggestedTrade     string   `json:"suggestedTrade"`
}

type ContractorInfo struct {
	Name             string `json:"name"`
	Company          string `json:"company"`
	Phone            string `json:"phone"`
	WhatsApp         string `json:"whatsApp,omitempty"`
	ScheduledDate    string `json:"scheduledDate,omitempty"`
	EstimatedArrival string `json:"estimatedArrival,omitempty"`
}

type MaintenanceRequest struct {
	ID                 string          `json:"id"`
	TicketNumber       string          `json:"ticketNumber"`
	PropertyID         string          `json:"propertyId"`
	PropertyName       string          `json:"propertyName"`
	UnitID             string          `json:"unitId"`
	UnitNumber         string          `json:"unitNumber"`
	TenantName         string          `json:"tenantName"`
	TenantPhone        string          `json:"tenantPhone"`
	TenantEmail        string          `json:"tenantEmail"`
	Title              string          `json:"title"`
	Description        string          `json:"description"`
	Category           IssueCategory   `json:"category"`
	Priority           IssuePriority   `json:"priority"`
	Status             IssueStatus     `json:"status"`
	Photos             []DamagePhoto   `json:"photos"`
	EntryPermission    bool            `json:"entryPermission"`
	PreferredTime      string          `json:"preferredTime,omitempty"`
	CreatedAt          string          `json:"createdAt"`
	UpdatedAt          string          `json:"updatedAt"`
	ResolvedAt         string          `json:"resolvedAt,omitempty"`
	AssignedContractor *ContractorInfo `json:"assignedContractor,omitempty"`
	RepairCost         *float64        `json:"repairCost,omitempty"` // in KSh.
	LandlordNotes      string          `json:"landlordNotes,omitempty"`
	Timeline           []TimelineEntry `json:"timeline"`
	AIDiagnosis        *AIDiagnosis    `json:"aiDiagnosis,omitempty"`
}

type ManagerContact struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
	Email string `json:"email"`
}

type CaretakerContact struct {
	Name     string `json:"name"`
	Phone    string `json:"phone"`
	WhatsApp string `json:"whatsApp,omitempty"`
}

type Property struct {
	ID               string            `json:"id"`
	Name             string            `json:"name"`
	Address          string            `json:"address"`
	City             string            `json:"city"`
	State            string            `json:"state"`
	Zip              string            `json:"zip"`
	Type             string            `json:"type"`
	ImageURL         string            `json:"imageUrl"`
	TotalUnits       int               `json:"totalUnits"`
	OccupiedUnits    int               `json:"occupiedUnits"`
	MonthlyRevenue   float64           `json:"monthlyRevenue"` // in KSh.
	Description      string            `json:"description"`
	YearBuilt        int               `json:"yearBuilt"`
	MpesaPaybill     string            `json:"mpesaPaybill,omitempty"`
	MpesaTill        string            `json:"mpesaTill,omitempty"`
	CaretakerContact *CaretakerContact `json:"caretakerContact,omitempty"`
	ManagerContact   ManagerContact    `json:"managerContact"`
}

type Unit struct {
	ID              string     `json:"id"`
	PropertyID      string     `json:"propertyId"`
	UnitNumber      string     `json:"unitNumber"`
	Floor           int        `json:"floor"`
	RentAmount      float64    `json:"rentAmount"` // in KSh.
	Bedrooms        int        `json:"bedrooms"`
	Bathrooms       float64    `json:"bathrooms"`
	Sqft            int        `json:"sqft"`
	Status          UnitStatus `json:"status"`
	CurrentTenantID string     `json:"currentTenantId,omitempty"`
	LeaseStart      string     `json:"leaseStart,omitempty"`
	LeaseEnd        string     `json:"leaseEnd,omitempty"`
	DepositAmount   float64    `json:"depositAmount"` // in KSh.
}

type EmergencyContact struct {
	Name     string `json:"name"`
	Relation string `json:"relation"`
	Phone    string `json:"phone"`
}

type Tenant struct {
	ID               string            `json:"id"`
	Name             string            `json:"name"`
	Email            string            `json:"email"`
	Phone            string            `json:"phone"`
	PropertyID       string            `json:"propertyId"`
	PropertyName     string            `json:"propertyName"`
	UnitID           string            `json:"unitId"`
	UnitNumber       string            `json:"unitNumber"`
	LeaseStart       string            `json:"leaseStart"`
	LeaseEnd         string            `json:"leaseEnd"`
	RentAmount       float64           `json:"rentAmount"` // in KSh.
	RentStatus       RentStatus        `json:"rentStatus"`
	LastMpesaReceipt string            `json:"lastMpesaReceipt,omitempty"`
	EmergencyContact *EmergencyContact `json:"emergencyContact,omitempty"`
	AvatarURL        string            `json:"avatarUrl,omitempty"`
}

type PortfolioStats struct {
	TotalProperties    int            `json:"totalProperties"`
	TotalUnits         int            `json:"totalUnits"`
	OccupiedUnits      int            `json:"occupiedUnits"`
	OccupancyRate      int            `json:"occupancyRate"`
	MonthlyRevenue     float64        `json:"monthlyRevenue"` // in KSh.
	OpenIssues         int            `json:"openIssues"`
	EmergencyIssues    int            `json:"emergencyIssues"`
	ScheduledIssues    int            `json:"scheduledIssues"`
	ResolvedIssues     int            `json:"resolvedIssues"`
	TotalEstimatedCost float64        `json:"totalEstimatedCost"` // in KSh.
	CategoryCounts     map[string]int `json:"categoryCounts"`
	GeneratedAt        time.Time      `json:"generatedAt"`
}

// Request and Response DTOs
type LoginRequest struct {
	Identifier string `json:"identifier"` // Email OR Phone number
	Email      string `json:"email,omitempty"`
	Phone      string `json:"phone,omitempty"`
	Password   string `json:"password,omitempty"`
	Role       string `json:"role,omitempty"`
	Name       string `json:"name,omitempty"`
}

type RegisterRequest struct {
	Name         string   `json:"name"`
	Email        string   `json:"email"`
	Phone        string   `json:"phone"`
	Password     string   `json:"password"`
	Role         UserRole `json:"role"`
	PropertyID   string   `json:"propertyId,omitempty"`
	PropertyName string   `json:"propertyName,omitempty"`
	UnitNumber   string   `json:"unitNumber,omitempty"`
	RentAmount   *float64 `json:"rentAmount,omitempty"`
}

type LoginResponse struct {
	User  User   `json:"user"`
	Token string `json:"token"`
}

type MpesaPaymentRequest struct {
	TenantID    string  `json:"tenantId"`
	PhoneNumber string  `json:"phoneNumber"`
	Amount      float64 `json:"amount"`
	Account     string  `json:"account"`
}

type MpesaPaymentResponse struct {
	Success         bool   `json:"success"`
	ReceiptNumber   string `json:"receiptNumber"`
	Message         string `json:"message"`
	TransactionTime string `json:"transactionTime"`
}

type AssignContractorRequest struct {
	Name             string   `json:"name"`
	Company          string   `json:"company"`
	Phone            string   `json:"phone"`
	WhatsApp         string   `json:"whatsApp,omitempty"`
	ScheduledDate    string   `json:"scheduledDate,omitempty"`
	EstimatedArrival string   `json:"estimatedArrival,omitempty"`
	EstimatedCost    *float64 `json:"estimatedCost,omitempty"`
}

type StatusUpdateRequest struct {
	Status  IssueStatus `json:"status"`
	Comment string      `json:"comment,omitempty"`
}

type PriorityUpdateRequest struct {
	Priority IssuePriority `json:"priority"`
}

type AddCommentRequest struct {
	Author      string `json:"author,omitempty"`
	Role        string `json:"role,omitempty"`
	Title       string `json:"title,omitempty"`
	Description string `json:"description"`
	Type        string `json:"type,omitempty"`
}

type AIDiagnosisRequest struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Category    string   `json:"category"`
	Photos      []string `json:"photos,omitempty"`
}
