import { GoogleGenAI, Type } from '@google/genai';
import { AIDiagnosis, IssueCategory } from '../types';

// Check for client-side API key if available
const getApiKey = (): string | undefined => {
  return (
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY)
  );
};

export async function analyzeMaintenanceDamage(
  title: string,
  description: string,
  category: IssueCategory | string,
  photosBase64: string[]
): Promise<AIDiagnosis> {
  // 1. Try Go backend proxy first
  try {
    const res = await fetch('/api/ai/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        category,
        photos: photosBase64.slice(0, 3)
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.categorySummary) {
        return data as AIDiagnosis;
      }
    }
  } catch {
    // Backend not reached or offline; proceed to direct SDK or fallback
  }

  // 2. Try direct Google GenAI SDK if API key is present in client
  const apiKey = getApiKey();
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const parts: any[] = [
        {
          text: `You are an expert residential property maintenance inspector and diagnostic AI for residential management in Kenya (Nairobi area).
Analyze the following maintenance breakage report from a tenant:

Issue Category: ${category}
Issue Title: ${title}
Tenant Description: ${description}

Inspect all attached damage photos and the tenant description. Provide realistic cost estimates in Kenyan Shillings (KSh.). Return a structured diagnosis, severity assessment, urgent tenant safety tips, and recommended fundi/contractor trade.`
        }
      ];

      for (const photo of photosBase64.slice(0, 3)) {
        const cleanBase64 = photo.replace(/^data:image\/\w+;base64,/, '');
        if (cleanBase64) {
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          });
        }
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: parts,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              categorySummary: { type: Type.STRING },
              severityAssessment: { type: Type.STRING },
              estimatedCostRange: { type: Type.STRING }, // e.g. "KSh. 2,500 - KSh. 5,000"
              recommendedAction: { type: Type.STRING },
              urgentSafetyTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedTrade: { type: Type.STRING } // e.g. "Licensed Plumber / Nairobi Fundi"
            },
            required: [
              'categorySummary',
              'severityAssessment',
              'estimatedCostRange',
              'recommendedAction',
              'suggestedTrade'
            ]
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed.categorySummary) {
          return parsed as AIDiagnosis;
        }
      }
    } catch (err) {
      console.warn('Direct Gemini SDK call failed, falling back to local engine:', err);
    }
  }

  // 3. Smart local heuristic diagnostic engine in Kenyan context
  return generateLocalDiagnosis(category, title, description);
}

function generateLocalDiagnosis(
  category: string,
  title: string,
  description: string
): AIDiagnosis {
  const text = `${title} ${description}`.toLowerCase();

  if (category.includes('Plumb') || text.includes('leak') || text.includes('water') || text.includes('pipe') || text.includes('sink')) {
    const isEmergency = text.includes('burst') || text.includes('flood') || text.includes('severe');
    return {
      categorySummary: 'Plumbing Supply / Drainage Line Gasket Anomaly',
      severityAssessment: isEmergency
        ? 'Emergency: Active water leakage risks floor seepage and cabinet damage.'
        : 'Moderate: Progressive moisture risk. Schedule inspection within 24 hours.',
      estimatedCostRange: 'KSh. 2,500 - KSh. 5,500 (Gasket replacement & thread sealing)',
      recommendedAction: 'Inspect angle valves and P-trap coupling. Apply PTFE thread sealant and replace washers.',
      urgentSafetyTips: [
        'Turn off the water shutoff stopcock under the sink',
        'Place a collection basin underneath the joint'
      ],
      suggestedTrade: 'Licensed Plumber / Nairobi Fundi'
    };
  }

  if (category.includes('Electr') || text.includes('spark') || text.includes('outlet') || text.includes('power') || text.includes('shower')) {
    return {
      categorySummary: 'Electrical Circuit / Heating Element Tripping Anomaly',
      severityAssessment: 'Emergency: High electrical shock or MCB breaker short-circuit hazard.',
      estimatedCostRange: 'KSh. 2,000 - KSh. 4,500 (Element replacement or circuit check)',
      recommendedAction: 'Isolate double-pole breaker on the consumer unit. Test element resistance with multimeter.',
      urgentSafetyTips: [
        'Keep the DP wall switch turned OFF until technician arrives',
        'Do not touch electrical switches with wet hands'
      ],
      suggestedTrade: 'Certified Electrician / Nairobi Fundi'
    };
  }

  if (category.includes('Lock') || text.includes('door') || text.includes('window') || text.includes('latch')) {
    return {
      categorySummary: 'Aluminium Slider Rail & Door Security Latch Defect',
      severityAssessment: 'High: Entryway or balcony perimeter security compromise.',
      estimatedCostRange: 'KSh. 2,500 - KSh. 6,000 (Tandem roller replacement & lock realignment)',
      recommendedAction: 'Replace bottom rollers and align strike plate on door jamb.',
      urgentSafetyTips: [
        'Use secondary safety lock bar while awaiting repairs'
      ],
      suggestedTrade: 'Aluminium Fabricator / Locksmith'
    };
  }

  if (category.includes('HVAC') || text.includes('ac') || text.includes('heat') || text.includes('cold') || text.includes('solar')) {
    return {
      categorySummary: 'Solar / Electric Water Heating Element Fault',
      severityAssessment: 'Moderate: Intermittent hot water supply.',
      estimatedCostRange: 'KSh. 3,500 - KSh. 7,500 (Thermostat recalibration or element replacement)',
      recommendedAction: 'Check solar backup controller and verify thermostat resistance.',
      urgentSafetyTips: [
        'Turn off main water heater isolator switch if abnormal humming occurs'
      ],
      suggestedTrade: 'Solar & Water Heating Specialist'
    };
  }

  return {
    categorySummary: 'Residential Fixture & Hardware Maintenance',
    severityAssessment: 'Low-to-Medium: Standard maintenance required.',
    estimatedCostRange: 'KSh. 1,500 - KSh. 4,000 (Hardware replacement & labor)',
    recommendedAction: 'Dispatch caretaker or handyman to inspect site dimensions.',
    urgentSafetyTips: [
      'Exercise caution around damaged area'
    ],
    suggestedTrade: 'Estate Caretaker / Handyman'
  };
}
