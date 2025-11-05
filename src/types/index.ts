// src/types/index.ts

import { Timestamp } from 'firebase/firestore';

/**
 * User Profile (extends Firebase User)
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: 'farmer' | 'buyer' | 'admin';
  location?: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  farmDetails?: {
    farmName: string;
    farmSize: number; // in acres
    farmType: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Authentication Form Data
 */
export interface AuthFormData {
  name?: string;
  email: string;
  password: string;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination
 */
export interface PaginationParams {
  page: number;
  limit: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Filter options for lists
 */
export interface FilterOptions {
  search?: string;
  status?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Dashboard Stats
 */
export interface DashboardStats {
  totalCrops: number;
  activeFields: number;
  totalRevenue: number;
  pendingTasks: number;
  recentActivities: number;
}

/**
 * Weather Data
 */
export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  uvIndex: number;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  rainChance: number;
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: Timestamp;
}