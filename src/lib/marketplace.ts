// src/lib/marketplace.ts

import { collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Product {
  id?: string;
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  productName: string;
  category: 'crops' | 'vegetables' | 'fruits' | 'grains' | 'other';
  quantity: number;
  unit: 'kg' | 'quintal' | 'ton' | 'piece';
  pricePerUnit: number;
  description: string;
  imageUrl?: string;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  status: 'available' | 'sold' | 'reserved';
  qualityGrade?: 'A' | 'B' | 'C';
  harvestDate?: Date;
  organicCertified?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Pesticide {
  id: string;
  name: string;
  brand: string;
  type: 'insecticide' | 'fungicide' | 'herbicide' | 'bactericide';
  targetDisease: string[];
  composition: string;
  dosage: string;
  pricePerUnit: number;
  unit: 'ml' | 'liter' | 'gm' | 'kg';
  packSizes: string[];
  imageUrl?: string;
  description: string;
  safetyPeriod: string; // Days before harvest
  applicationMethod: string[];
  availableLocations: string[]; // Cities where available
  lastUpdated: Date;
}

export interface Fertilizer {
  id: string;
  name: string;
  brand: string;
  type: 'organic' | 'chemical' | 'bio';
  npkRatio?: string; // e.g., "10-26-26"
  composition: string;
  suitableFor: string[]; // Crop types
  pricePerUnit: number;
  unit: 'kg' | 'bag' | 'ton';
  packSizes: string[];
  imageUrl?: string;
  description: string;
  applicationRate: string;
  benefits: string[];
  availableLocations: string[]; // Cities where available
  lastUpdated: Date;
}

// Fetch products for marketplace
export async function getMarketplaceProducts(filters?: {
  category?: string;
  city?: string;
  maxPrice?: number;
}): Promise<Product[]> {
  try {
    let q = query(
      collection(db, 'marketplace'),
      where('status', '==', 'available'),
      orderBy('createdAt', 'desc')
    );

    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }

    const snapshot = await getDocs(q);
    let products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

    // Filter by city (client-side since Firestore has query limitations)
    if (filters?.city) {
      products = products.filter(p => 
        p.location.city.toLowerCase() === filters.city!.toLowerCase()
      );
    }

    if (filters?.maxPrice) {
      products = products.filter(p => p.pricePerUnit <= filters.maxPrice!);
    }

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Add product to marketplace
export async function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'marketplace'), {
      ...product,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

// Fetch pesticides (from Firestore or external source)
export async function getPesticides(disease?: string, location?: string): Promise<Pesticide[]> {
  try {
    const snapshot = await getDocs(collection(db, 'pesticides'));
    let pesticides = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastUpdated: doc.data().lastUpdated?.toDate() || new Date(),
    })) as Pesticide[];

    if (disease) {
      pesticides = pesticides.filter(p => 
        p.targetDisease.some(d => d.toLowerCase().includes(disease.toLowerCase()))
      );
    }

    if (location) {
      pesticides = pesticides.filter(p => 
        p.availableLocations.includes(location)
      );
    }

    return pesticides;
  } catch (error) {
    console.error('Error fetching pesticides:', error);
    return getMockPesticides();
  }
}

// Fetch fertilizers
export async function getFertilizers(cropType?: string, location?: string): Promise<Fertilizer[]> {
  try {
    const snapshot = await getDocs(collection(db, 'fertilizers'));
    let fertilizers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastUpdated: doc.data().lastUpdated?.toDate() || new Date(),
    })) as Fertilizer[];

    if (cropType) {
      fertilizers = fertilizers.filter(f => 
        f.suitableFor.includes(cropType)
      );
    }

    if (location) {
      fertilizers = fertilizers.filter(f => 
        f.availableLocations.includes(location)
      );
    }

    return fertilizers;
  } catch (error) {
    console.error('Error fetching fertilizers:', error);
    return getMockFertilizers();
  }
}

// Mock data for development
export function getMockPesticides(): Pesticide[] {
  return [
    {
      id: '1',
      name: 'Copper Oxychloride',
      brand: 'Bayer CropScience',
      type: 'fungicide',
      targetDisease: ['Late Blight', 'Early Blight', 'Downy Mildew'],
      composition: 'Copper Oxychloride 50% WP',
      dosage: '2-3 grams per liter',
      pricePerUnit: 450,
      unit: 'kg',
      packSizes: ['500g', '1kg', '5kg'],
      imageUrl: 'https://via.placeholder.com/300x200/22c55e/ffffff?text=Copper+Fungicide',
      description: 'Broad-spectrum fungicide effective against various fungal diseases. Safe for most crops.',
      safetyPeriod: '7 days',
      applicationMethod: ['Foliar spray', 'Drenching'],
      availableLocations: ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi'],
      lastUpdated: new Date(),
    },
    {
      id: '2',
      name: 'Imidacloprid 17.8% SL',
      brand: 'Syngenta',
      type: 'insecticide',
      targetDisease: ['Aphids', 'Whiteflies', 'Jassids', 'Thrips'],
      composition: 'Imidacloprid 17.8% SL',
      dosage: '0.5-0.7 ml per liter',
      pricePerUnit: 850,
      unit: 'liter',
      packSizes: ['100ml', '250ml', '500ml', '1L'],
      imageUrl: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Insecticide',
      description: 'Systemic insecticide with contact and stomach action. Long-lasting protection.',
      safetyPeriod: '14 days',
      applicationMethod: ['Foliar spray', 'Soil treatment'],
      availableLocations: ['Hyderabad', 'Chennai', 'Pune'],
      lastUpdated: new Date(),
    },
  ];
}

export function getMockFertilizers(): Fertilizer[] {
  return [
    {
      id: '1',
      name: 'NPK Complex Fertilizer',
      brand: 'IFFCO',
      type: 'chemical',
      npkRatio: '10-26-26',
      composition: 'Nitrogen 10%, Phosphorus 26%, Potassium 26%',
      suitableFor: ['Wheat', 'Rice', 'Cotton', 'Vegetables'],
      pricePerUnit: 650,
      unit: 'bag',
      packSizes: ['50kg bag'],
      imageUrl: 'https://via.placeholder.com/300x200/16a34a/ffffff?text=NPK+Fertilizer',
      description: 'Balanced NPK fertilizer for all stages of crop growth. Improves yield and quality.',
      applicationRate: '100-150 kg per acre',
      benefits: ['Balanced nutrition', 'Improved flowering', 'Better fruit quality', 'Increased yield'],
      availableLocations: ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Pune'],
      lastUpdated: new Date(),
    },
    {
      id: '2',
      name: 'Organic Vermicompost',
      brand: 'EcoFarm',
      type: 'organic',
      composition: '100% Natural vermicompost with earthworm castings',
      suitableFor: ['All crops', 'Vegetables', 'Fruits', 'Flowers'],
      pricePerUnit: 350,
      unit: 'bag',
      packSizes: ['25kg bag', '50kg bag'],
      imageUrl: 'https://via.placeholder.com/300x200/15803d/ffffff?text=Vermicompost',
      description: 'Rich organic fertilizer with beneficial microbes. Improves soil structure and fertility.',
      applicationRate: '200-300 kg per acre',
      benefits: ['100% Organic', 'Improves soil health', 'Slow nutrient release', 'Environment friendly'],
      availableLocations: ['Hyderabad', 'Bangalore', 'Chennai'],
      lastUpdated: new Date(),
    },
  ];
}

// Calculate distance between two locations (simplified)
export function calculateDistance(location1: string, location2: string): number {
  // In real implementation, use Google Maps Distance Matrix API
  // For now, return mock distance
  return Math.random() * 50; // 0-50 km
}