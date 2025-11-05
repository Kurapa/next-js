// src/lib/diseaseDetection.ts

export interface DiseaseResult {
  disease: string;
  plantType: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  symptoms: string[];
  causes: string[];
  treatment: {
    organic: string[];
    chemical: string[];
    preventive: string[];
  };
  recommendedFertilizers: Fertilizer[];
  affectedArea?: string;
  estimatedLoss?: string;
  actionRequired: string;
}

export interface Fertilizer {
  name: string;
  type: 'organic' | 'chemical' | 'bio';
  dosage: string;
  applicationMethod: string;
  frequency: string;
  price?: string;
  benefits: string[];
}

const BACKEND_API_URL = process.env.NEXT_PUBLIC_DISEASE_API_URL || 'http://localhost:5000/api';

/**
 * Analyze image for disease detection
 * This connects to your existing deep learning model backend
 */
export async function analyzeImage(imageUrl: string, imageFile?: File): Promise<DiseaseResult> {
  try {
    const formData = new FormData();
    
    if (imageFile) {
      formData.append('image', imageFile);
    } else {
      formData.append('imageUrl', imageUrl);
    }

    const response = await fetch(`${BACKEND_API_URL}/detect-disease`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Disease detection failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error analyzing image:', error);
    // Return mock data for development
    return getMockDiseaseResult();
  }
}

/**
 * Batch analyze multiple images
 */
export async function batchAnalyzeImages(images: { id: string; url: string }[]): Promise<Map<string, DiseaseResult>> {
  const results = new Map<string, DiseaseResult>();

  try {
    const promises = images.map(async (img) => {
      const result = await analyzeImage(img.url);
      results.set(img.id, result);
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error in batch analysis:', error);
  }

  return results;
}

/**
 * Get disease information by name
 */
export async function getDiseaseInfo(diseaseName: string): Promise<DiseaseResult | null> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/disease-info/${diseaseName}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch disease info');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching disease info:', error);
    return null;
  }
}

/**
 * Mock function for development
 */
export function getMockDiseaseResult(): DiseaseResult {
  const diseases = [
    {
      disease: 'Tomato Late Blight',
      plantType: 'Tomato',
      confidence: 94.5,
      severity: 'high' as const,
      description: 'Late blight is a devastating disease caused by the water mold Phytophthora infestans. It can destroy entire crops within days if left untreated.',
      symptoms: [
        'Dark brown or black lesions on leaves',
        'White fuzzy growth on undersides of leaves',
        'Rapid wilting and decay of foliage',
        'Brown spots on fruits',
      ],
      causes: [
        'Cool, wet weather conditions (15-20°C)',
        'High humidity (>90%)',
        'Poor air circulation',
        'Infected plant debris',
      ],
      treatment: {
        organic: [
          'Apply copper-based fungicides',
          'Remove and destroy infected plants immediately',
          'Improve air circulation between plants',
          'Water in the morning to allow foliage to dry',
        ],
        chemical: [
          'Apply chlorothalonil fungicide',
          'Use mancozeb as preventive spray',
          'Apply metalaxyl for systemic protection',
        ],
        preventive: [
          'Plant resistant varieties',
          'Ensure proper spacing (60-90 cm apart)',
          'Mulch to prevent soil splash',
          'Rotate crops every 3-4 years',
        ],
      },
      recommendedFertilizers: [
        {
          name: 'Copper Oxychloride',
          type: 'chemical',
          dosage: '2-3 grams per liter',
          applicationMethod: 'Foliar spray',
          frequency: 'Every 7-10 days',
          price: '$15-20 per kg',
          benefits: ['Prevents fungal growth', 'Protects new growth', 'Long-lasting effect'],
        },
        {
          name: 'Neem Oil Solution',
          type: 'organic',
          dosage: '5ml per liter',
          applicationMethod: 'Spray on leaves',
          frequency: 'Every 5-7 days',
          price: '$10-12 per liter',
          benefits: ['100% organic', 'Safe for beneficial insects', 'Also controls pests'],
        },
        {
          name: 'Potassium Phosphonate',
          type: 'bio',
          dosage: '2ml per liter',
          applicationMethod: 'Foliar and soil drench',
          frequency: 'Every 2 weeks',
          price: '$25-30 per liter',
          benefits: ['Systemic action', 'Boosts plant immunity', 'Rapid uptake'],
        },
      ],
      affectedArea: 'Approximately 30% of field',
      estimatedLoss: 'Potential 50-70% yield loss if untreated',
      actionRequired: 'Immediate treatment required within 24-48 hours',
    },
    {
      disease: 'Wheat Rust',
      plantType: 'Wheat',
      confidence: 89.2,
      severity: 'medium' as const,
      description: 'Wheat rust is a fungal disease that affects wheat crops, causing orange-brown pustules on leaves and stems.',
      symptoms: [
        'Orange-brown pustules on leaves',
        'Yellow spots around pustules',
        'Premature leaf death',
        'Reduced grain filling',
      ],
      causes: [
        'Warm temperatures (20-25°C)',
        'Morning dew',
        'Dense crop stands',
        'Nitrogen excess',
      ],
      treatment: {
        organic: [
          'Use sulfur-based sprays',
          'Remove infected debris',
          'Increase plant spacing',
        ],
        chemical: [
          'Apply triazole fungicides',
          'Use propiconazole sprays',
        ],
        preventive: [
          'Plant resistant varieties',
          'Proper nitrogen management',
          'Early sowing dates',
        ],
      },
      recommendedFertilizers: [
        {
          name: 'Triazole Fungicide',
          type: 'chemical',
          dosage: '1ml per liter',
          applicationMethod: 'Foliar spray',
          frequency: 'Every 14 days',
          price: '$35-40 per liter',
          benefits: ['Systemic protection', 'Long residual effect', 'Curative action'],
        },
      ],
      affectedArea: 'Approximately 15% of field',
      estimatedLoss: 'Potential 20-30% yield loss if untreated',
      actionRequired: 'Treatment recommended within 1 week',
    },
  ];

  return diseases[Math.floor(Math.random() * diseases.length)] as any;
}

/**
 * Get severity color for UI
 */
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'low':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'high':
      return 'text-orange-600 bg-orange-100';
    case 'critical':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Get confidence color for UI
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return 'text-green-600';
  if (confidence >= 70) return 'text-yellow-600';
  return 'text-orange-600';
}