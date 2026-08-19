package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"haven-property/backend/internal/models"
)

type AIService struct {
	apiKey     string
	httpClient *http.Client
}

func NewAIService() *AIService {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		apiKey = os.Getenv("VITE_GEMINI_API_KEY")
	}

	return &AIService{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

type geminiPart struct {
	Text       string            `json:"text,omitempty"`
	InlineData *geminiInlineData `json:"inlineData,omitempty"`
}

type geminiInlineData struct {
	MimeType string `json:"mimeType"`
	Data     string `json:"data"`
}

type geminiContent struct {
	Parts []geminiPart `json:"parts"`
}

type geminiGenerationConfig struct {
	ResponseMimeType string `json:"responseMimeType,omitempty"`
}

type geminiRequest struct {
	Contents         []geminiContent        `json:"contents"`
	GenerationConfig geminiGenerationConfig `json:"generationConfig"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

func (s *AIService) DiagnoseBreakage(ctx context.Context, req models.AIDiagnosisRequest) (*models.AIDiagnosis, error) {
	if s.apiKey == "" {
		// Heuristic fallback if no API key is configured
		diagnosis := s.fallbackDiagnosis(req.Category, req.Title, req.Description)
		return &diagnosis, nil
	}

	prompt := fmt.Sprintf(`You are an expert residential maintenance and diagnostics AI for properties in Kenya (Nairobi area).
Analyze the following maintenance breakage report from a tenant in Kenya:

Issue Category: %s
Issue Title: %s
Tenant Description: %s

Attached are photo(s) of the reported damage.
Inspect the visual evidence and tenant narrative. Estimate repair costs realistically in Kenyan Shillings (KSh.).
Return a JSON object ONLY with the following exact structure:
{
  "categorySummary": "concise technical summary of root cause or defect",
  "severityAssessment": "Emergency / High / Moderate / Low with detailed risk to property or tenant safety",
  "estimatedCostRange": "KSh. X,XXX - KSh. Y,YYY (breakdown of parts and fundi labor)",
  "recommendedAction": "clear step-by-step resolution strategy for landlord/caretaker/fundi",
  "urgentSafetyTips": ["Actionable safety tip 1 for resident", "Actionable safety tip 2"],
  "suggestedTrade": "e.g. Licensed Plumber / Nairobi Fundi / Certified Electrician / Glazier"
}
`, req.Category, req.Title, req.Description)

	parts := []geminiPart{
		{Text: prompt},
	}

	// Process image attachments
	for i, photo := range req.Photos {
		if i >= 3 {
			break
		}
		mime, rawData := extractMimeAndBase64(photo)
		if rawData != "" {
			parts = append(parts, geminiPart{
				InlineData: &geminiInlineData{
					MimeType: mime,
					Data:     rawData,
				},
			})
		}
	}

	bodyData, err := json.Marshal(geminiRequest{
		Contents: []geminiContent{
			{Parts: parts},
		},
		GenerationConfig: geminiGenerationConfig{
			ResponseMimeType: "application/json",
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to encode Gemini payload: %w", err)
	}

	endpoint := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=%s", s.apiKey)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(bodyData))
	if err != nil {
		return nil, fmt.Errorf("failed to create HTTP request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	res, err := s.httpClient.Do(httpReq)
	if err != nil {
		fallback := s.fallbackDiagnosis(req.Category, req.Title, req.Description)
		return &fallback, nil
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(res.Body)
		fmt.Printf("[AIService] Gemini API error (%d): %s\n", res.StatusCode, string(respBody))
		fallback := s.fallbackDiagnosis(req.Category, req.Title, req.Description)
		return &fallback, nil
	}

	var geminiResp geminiResponse
	if err := json.NewDecoder(res.Body).Decode(&geminiResp); err != nil {
		fallback := s.fallbackDiagnosis(req.Category, req.Title, req.Description)
		return &fallback, nil
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		fallback := s.fallbackDiagnosis(req.Category, req.Title, req.Description)
		return &fallback, nil
	}

	rawJSON := geminiResp.Candidates[0].Content.Parts[0].Text
	cleanedJSON := cleanJSONString(rawJSON)

	var diagnosis models.AIDiagnosis
	if err := json.Unmarshal([]byte(cleanedJSON), &diagnosis); err != nil {
		fmt.Printf("[AIService] Failed to parse model JSON: %s\n", rawJSON)
		fallback := s.fallbackDiagnosis(req.Category, req.Title, req.Description)
		return &fallback, nil
	}

	return &diagnosis, nil
}

func (s *AIService) fallbackDiagnosis(category, title, description string) models.AIDiagnosis {
	text := strings.ToLower(fmt.Sprintf("%s %s", title, description))

	switch {
	case strings.Contains(category, "Plumb") || strings.Contains(text, "leak") || strings.Contains(text, "water") || strings.Contains(text, "pipe") || strings.Contains(text, "drain"):
		severity := "Moderate: Requires prompt inspection to prevent progressive moisture buildup."
		if strings.Contains(text, "severe") || strings.Contains(text, "burst") || strings.Contains(text, "flood") {
			severity = "Emergency: Risk of cabinet damage and floor water seepage."
		}
		return models.AIDiagnosis{
			CategorySummary:    "Plumbing Supply / Drainage Line Integrity Issue",
			SeverityAssessment: severity,
			EstimatedCostRange: "KSh. 2,500 - KSh. 5,500 (Gasket replacement & pipe sealing)",
			RecommendedAction:  "Inspect supply angle valve and P-trap joint. Replace rubber washers and apply thread tape.",
			UrgentSafetyTips: []string{
				"Turn off under-sink stopcock valve",
				"Place catch basin and remove wooden items from cabinet",
			},
			SuggestedTrade: "Licensed Plumber / Nairobi Fundi",
		}

	case strings.Contains(category, "Electr") || strings.Contains(text, "spark") || strings.Contains(text, "outlet") || strings.Contains(text, "power") || strings.Contains(text, "breaker") || strings.Contains(text, "shower"):
		return models.AIDiagnosis{
			CategorySummary:    "Electrical Circuit / Instant Shower Element Anomaly",
			SeverityAssessment: "Emergency: High electrical shock or breaker short-circuit hazard.",
			EstimatedCostRange: "KSh. 2,000 - KSh. 4,500 (Heating element or MCB breaker replacement)",
			RecommendedAction:  "Turn off double-pole switch on distribution board. Test element resistance.",
			UrgentSafetyTips: []string{
				"Keep shower DP switch turned OFF",
				"Do not touch electrical box with damp hands",
			},
			SuggestedTrade: "Certified Electrician / Nairobi Fundi",
		}

	case strings.Contains(category, "HVAC") || strings.Contains(text, "ac") || strings.Contains(text, "heat") || strings.Contains(text, "cold"):
		return models.AIDiagnosis{
			CategorySummary:    "Ventilation / Water Heater Thermal Fault",
			SeverityAssessment: "Moderate: Tenant hot water or airflow impact.",
			EstimatedCostRange: "KSh. 3,500 - KSh. 7,500 (Thermostat check or heating coil replacement)",
			RecommendedAction:  "Inspect solar/electric water heater thermostat calibration.",
			UrgentSafetyTips: []string{
				"Turn off main heater isolator if smoking or whistling",
			},
			SuggestedTrade: "Solar / Water Heating Specialist",
		}

	case strings.Contains(category, "Appliance") || strings.Contains(text, "fridge") || strings.Contains(text, "refrigerator") || strings.Contains(text, "cooker") || strings.Contains(text, "oven"):
		return models.AIDiagnosis{
			CategorySummary:    "Household Appliance Component / Ignition Fault",
			SeverityAssessment: "Moderate: Impact on tenant daily food preparation.",
			EstimatedCostRange: "KSh. 2,000 - KSh. 5,000 (Thermostat sensor, burner nozzle or seal replacement)",
			RecommendedAction:  "Check gas regulator / power cord and clear burners.",
			UrgentSafetyTips: []string{
				"Turn off gas cylinder valve if gas odor is present",
			},
			SuggestedTrade: "Appliance Technician / Gas Specialist",
		}

	case strings.Contains(category, "Lock") || strings.Contains(text, "door") || strings.Contains(text, "lock") || strings.Contains(text, "key") || strings.Contains(text, "window"):
		return models.AIDiagnosis{
			CategorySummary:    "Aluminium Slider Rail & Door Security Latch Defect",
			SeverityAssessment: "High: Entryway security compromise.",
			EstimatedCostRange: "KSh. 2,500 - KSh. 6,000 (Tandem roller replacement & strike realignment)",
			RecommendedAction:  "Replace lower rollers and lubricate aluminium sliding track.",
			UrgentSafetyTips: []string{
				"Use secondary manual security lock bar while mechanism is serviced",
			},
			SuggestedTrade: "Aluminium Fabricator / Locksmith Fundi",
		}

	default:
		return models.AIDiagnosis{
			CategorySummary:    "Residential Building & Fixture Maintenance",
			SeverityAssessment: "Low-to-Medium: General structural restoration required.",
			EstimatedCostRange: "KSh. 1,500 - KSh. 4,000 (Hardware replacement & labor)",
			RecommendedAction:  "Dispatch estate caretaker or handyman to inspect dimensions.",
			UrgentSafetyTips: []string{
				"Exercise caution around damaged area",
			},
			SuggestedTrade: "Estate Caretaker / Handyman",
		}
	}
}

func extractMimeAndBase64(input string) (string, string) {
	if strings.HasPrefix(input, "data:") {
		parts := strings.SplitN(input, ",", 2)
		if len(parts) == 2 {
			meta := parts[0]
			data := parts[1]

			mime := "image/jpeg"
			if strings.Contains(meta, "image/png") {
				mime = "image/png"
			} else if strings.Contains(meta, "image/webp") {
				mime = "image/webp"
			}
			return mime, data
		}
	}
	return "image/jpeg", ""
}

func cleanJSONString(input string) string {
	input = strings.TrimSpace(input)
	re := regexp.MustCompile("(?s)```(?:json)?(.*?)```")
	matches := re.FindStringSubmatch(input)
	if len(matches) > 1 {
		return strings.TrimSpace(matches[1])
	}
	return input
}
