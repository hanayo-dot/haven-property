package services

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"time"

	"haven-property/backend/internal/models"
)

type ExportService struct{}

func NewExportService() *ExportService {
	return &ExportService{}
}

func FormatExportFilename(prefix string) string {
	return fmt.Sprintf("haven_%s_%s.csv", prefix, time.Now().Format("2006-01-02"))
}

func (s *ExportService) ExportMaintenanceRequestsCSV(requests []models.MaintenanceRequest) ([]byte, error) {
	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	headers := []string{
		"Ticket Number",
		"Property",
		"Unit",
		"Tenant Name",
		"Tenant Phone",
		"Tenant Email",
		"Title",
		"Category",
		"Priority",
		"Status",
		"Fundi Assigned",
		"Company",
		"Scheduled Date",
		"Repair Cost (KSh)",
		"Created At",
		"Resolved At",
		"AI Diagnosis Summary",
		"AI Estimated Range",
	}
	if err := writer.Write(headers); err != nil {
		return nil, err
	}

	for _, r := range requests {
		contractorName := ""
		contractorCompany := ""
		scheduledDate := ""
		if r.AssignedContractor != nil {
			contractorName = r.AssignedContractor.Name
			contractorCompany = r.AssignedContractor.Company
			scheduledDate = r.AssignedContractor.ScheduledDate
		}

		costStr := ""
		if r.RepairCost != nil {
			costStr = fmt.Sprintf("%.2f", *r.RepairCost)
		}

		aiSummary := ""
		aiRange := ""
		if r.AIDiagnosis != nil {
			aiSummary = r.AIDiagnosis.CategorySummary
			aiRange = r.AIDiagnosis.EstimatedCostRange
		}

		row := []string{
			r.TicketNumber,
			r.PropertyName,
			r.UnitNumber,
			r.TenantName,
			r.TenantPhone,
			r.TenantEmail,
			r.Title,
			string(r.Category),
			string(r.Priority),
			string(r.Status),
			contractorName,
			contractorCompany,
			scheduledDate,
			costStr,
			r.CreatedAt,
			r.ResolvedAt,
			aiSummary,
			aiRange,
		}
		if err := writer.Write(row); err != nil {
			return nil, err
		}
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

func (s *ExportService) ExportTenantsCSV(tenants []models.Tenant) ([]byte, error) {
	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	headers := []string{
		"Resident Name",
		"Property",
		"Unit Number",
		"Phone",
		"Email",
		"Monthly Rent (KSh)",
		"Rent Status",
		"Last M-Pesa Receipt",
		"Lease Start",
		"Lease End",
		"Emergency Contact",
		"Emergency Phone",
	}
	if err := writer.Write(headers); err != nil {
		return nil, err
	}

	for _, t := range tenants {
		emName := ""
		emPhone := ""
		if t.EmergencyContact != nil {
			emName = fmt.Sprintf("%s (%s)", t.EmergencyContact.Name, t.EmergencyContact.Relation)
			emPhone = t.EmergencyContact.Phone
		}

		row := []string{
			t.Name,
			t.PropertyName,
			t.UnitNumber,
			t.Phone,
			t.Email,
			fmt.Sprintf("%.2f", t.RentAmount),
			string(t.RentStatus),
			t.LastMpesaReceipt,
			t.LeaseStart,
			t.LeaseEnd,
			emName,
			emPhone,
		}
		if err := writer.Write(row); err != nil {
			return nil, err
		}
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}
