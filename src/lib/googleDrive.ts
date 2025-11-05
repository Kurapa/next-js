// src/lib/googleDrive.ts

export interface DriveImage {
  id: string;
  name: string;
  thumbnailLink: string;
  webContentLink: string;
  createdTime: string;
  mimeType: string;
  size: string;
}

export interface DriveFolder {
  id: string;
  name: string;
}

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

/**
 * Google Drive API Service using Service Account JSON
 * Place your service.json file in the project root or specify path
 */

const FOLDER_ID = process.env.NEXT_PUBLIC_DRONE_FOLDER_ID;

// Import service account JSON
// You can import it directly or load it dynamically
let serviceAccount: ServiceAccount | null = null;

/**
 * Load service account credentials
 */
async function loadServiceAccount(): Promise<ServiceAccount> {
  if (serviceAccount) {
    return serviceAccount;
  }

  try {
    // Option 1: Direct import (if service.json is in your project)
    // Uncomment and adjust path as needed:
    // serviceAccount = require('../../service.json');
    
    // Option 2: Fetch from API route (recommended for Next.js)
    const response = await fetch('/api/service-account');
    if (!response.ok) {
      throw new Error('Failed to load service account');
    }
    serviceAccount = await response.json();
    
    return serviceAccount as any;
  } catch (error) {
    console.error('Error loading service account:', error);
    throw new Error('Service account not configured');
  }
}

/**
 * Generate JWT token for service account authentication
 */
async function getAccessToken(): Promise<string> {
  const account = await loadServiceAccount();

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: account.client_email,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  // Import the private key
  const encoder = new TextEncoder();
  const privateKeyPem = account.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  const binaryKey = Uint8Array.from(atob(privateKeyPem), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  // Create JWT
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedClaim = btoa(JSON.stringify(claim)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${encodedHeader}.${encodedClaim}`;

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${unsignedToken}.${encodedSignature}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

/**
 * Fetch images from Google Drive folder
 */
export async function fetchDroneImages(folderId?: string): Promise<DriveImage[]> {
  try {
    const targetFolderId = folderId || FOLDER_ID;
    
    if (!targetFolderId) {
      console.error('Google Drive folder ID not configured');
      return [];
    }

    // Get access token
    const accessToken = await getAccessToken();

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${targetFolderId}'+in+parents+and+mimeType+contains+'image/'&fields=files(id,name,thumbnailLink,webContentLink,createdTime,mimeType,size)&orderBy=createdTime desc`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch images from Google Drive: ${error}`);
    }

    console.log(`Fetched images from folder: ${targetFolderId}`);

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error fetching drone images:', error);
    return [];
  }
}

/**
 * Get direct download link for an image
 */
export function getDirectDownloadLink(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Get preview link for an image
 */
export function getPreviewLink(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: string): string {
  const size = parseInt(bytes);
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
  return (size / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Mock function for development (when API is not set up)
 */
export function getMockDroneImages(): DriveImage[] {
  return [
    {
      id: '1',
      name: 'drone_field_north_001.jpg',
      thumbnailLink: 'https://via.placeholder.com/400x300/22c55e/ffffff?text=Field+North',
      webContentLink: '#',
      createdTime: new Date().toISOString(),
      mimeType: 'image/jpeg',
      size: '2457600',
    },
    {
      id: '2',
      name: 'drone_field_south_002.jpg',
      thumbnailLink: 'https://via.placeholder.com/400x300/15803d/ffffff?text=Field+South',
      webContentLink: '#',
      createdTime: new Date(Date.now() - 3600000).toISOString(),
      mimeType: 'image/jpeg',
      size: '3145728',
    },
    {
      id: '3',
      name: 'drone_field_east_003.jpg',
      thumbnailLink: 'https://via.placeholder.com/400x300/16a34a/ffffff?text=Field+East',
      webContentLink: '#',
      createdTime: new Date(Date.now() - 7200000).toISOString(),
      mimeType: 'image/jpeg',
      size: '2883584',
    },
  ];
}