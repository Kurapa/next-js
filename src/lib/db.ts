// src/lib/db.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';

// Generic CRUD operations for any collection

/**
 * Create a new document in a collection
 */
export async function createDocument<T>(
  collectionName: string,
  data: T
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Read a single document by ID
 */
export async function getDocument<T>(
  collectionName: string,
  documentId: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Read all documents from a collection
 */
export async function getAllDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Update a document
 */
export async function updateDocument<T>(
  collectionName: string,
  documentId: string,
  data: Partial<T>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Get documents with filters
 */
export async function getFilteredDocuments<T>(
  collectionName: string,
  filters: { field: string; operator: any; value: any }[]
): Promise<T[]> {
  try {
    const constraints = filters.map((filter) =>
      where(filter.field, filter.operator, filter.value)
    );

    return await getAllDocuments<T>(collectionName, constraints);
  } catch (error) {
    console.error(`Error getting filtered documents from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Get user-specific documents
 */
export async function getUserDocuments<T>(
  collectionName: string,
  userId: string
): Promise<T[]> {
  try {
    const q = query(
      collection(db, collectionName),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
    
    // Sort by createdAt in memory instead of in query
    return documents.sort((a: any, b: any) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.toMillis() - a.createdAt.toMillis();
    });
  } catch (error) {
    console.error(`Error getting user documents from ${collectionName}:`, error);
    throw error;
  }
}

// Specific collection helpers

/**
 * Crops Collection
 */
export interface Crop {
  id?: string;
  userId: string;
  name: string;
  type: string;
  fieldName: string;
  plantingDate: Timestamp;
  expectedHarvestDate: Timestamp;
  status: 'planted' | 'growing' | 'harvesting' | 'harvested';
  area: number; // in acres
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const cropService = {
  create: (data: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'>) =>
    createDocument<Crop>('crops', data),
  getById: (id: string) => getDocument<Crop>('crops', id),
  getAll: () => getAllDocuments<Crop>('crops'),
  getUserCrops: (userId: string) => getUserDocuments<Crop>('crops', userId),
  update: (id: string, data: Partial<Crop>) => updateDocument<Crop>('crops', id, data),
  delete: (id: string) => deleteDocument('crops', id),
};

/**
 * Tasks Collection
 */
export interface Task {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  fieldName: string;
  dueDate: Timestamp;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const taskService = {
  create: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) =>
    createDocument<Task>('tasks', data),
  getById: (id: string) => getDocument<Task>('tasks', id),
  getAll: () => getAllDocuments<Task>('tasks'),
  getUserTasks: (userId: string) => getUserDocuments<Task>('tasks', userId),
  update: (id: string, data: Partial<Task>) => updateDocument<Task>('tasks', id, data),
  delete: (id: string) => deleteDocument('tasks', id),
};

/**
 * Fields Collection
 */
export interface Field {
  id?: string;
  userId: string;
  name: string;
  area: number; // in acres
  soilType?: string;
  currentCrop?: string;
  status: 'active' | 'fallow' | 'preparing';
  location?: {
    lat: number;
    lng: number;
  };
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const fieldService = {
  create: (data: Omit<Field, 'id' | 'createdAt' | 'updatedAt'>) =>
    createDocument<Field>('fields', data),
  getById: (id: string) => getDocument<Field>('fields', id),
  getAll: () => getAllDocuments<Field>('fields'),
  getUserFields: (userId: string) => getUserDocuments<Field>('fields', userId),
  update: (id: string, data: Partial<Field>) => updateDocument<Field>('fields', id, data),
  delete: (id: string) => deleteDocument('fields', id),
};

/**
 * Activities Collection (for tracking farm activities)
 */
export interface Activity {
  id?: string;
  userId: string;
  type: 'watering' | 'fertilizing' | 'pesticide' | 'harvest' | 'planting' | 'other';
  fieldName: string;
  cropName?: string;
  description: string;
  date: Timestamp;
  cost?: number;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const activityService = {
  create: (data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) =>
    createDocument<Activity>('activities', data),
  getById: (id: string) => getDocument<Activity>('activities', id),
  getAll: () => getAllDocuments<Activity>('activities'),
  getUserActivities: (userId: string) => getUserDocuments<Activity>('activities', userId),
  update: (id: string, data: Partial<Activity>) =>
    updateDocument<Activity>('activities', id, data),
  delete: (id: string) => deleteDocument('activities', id),
};

/**
 * Products Collection (for marketplace)
 */
export interface Product {
  id?: string;
  userId: string;
  sellerName: string;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  imageUrl?: string;
  status: 'available' | 'sold' | 'reserved';
  location: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const productService = {
  create: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
    createDocument<Product>('products', data),
  getById: (id: string) => getDocument<Product>('products', id),
  getAll: () => getAllDocuments<Product>('products'),
  getUserProducts: (userId: string) => getUserDocuments<Product>('products', userId),
  getAvailableProducts: () =>
    getFilteredDocuments<Product>('products', [
      { field: 'status', operator: '==', value: 'available' },
    ]),
  update: (id: string, data: Partial<Product>) =>
    updateDocument<Product>('products', id, data),
  delete: (id: string) => deleteDocument('products', id),
};

/**
 * Get time-based greeting
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'Good Evening';
  } else {
    return 'Good Night';
  }
}

/**
 * Get greeting emoji
 */
export function getGreetingEmoji(): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return '🌅';
  } else if (hour >= 12 && hour < 17) {
    return '☀️';
  } else if (hour >= 17 && hour < 21) {
    return '🌆';
  } else {
    return '🌙';
  }
}