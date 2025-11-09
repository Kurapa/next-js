// src/app/api/import-products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';

interface ExcelRow {
  id?: string;
  name: string;
  brand: string;
  type: string;
  price: number;
  unit: string;
  description: string;
  imageUrl?: string;
  composition?: string;
  locations?: string; // Comma-separated cities
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string; // 'pesticides' or 'fertilizers'

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!category || !['pesticides', 'fertilizers'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be "pesticides" or "fertilizers"' },
        { status: 400 }
      );
    }

    // Read Excel file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Parse Excel
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Processing ${data.length} rows from Excel...`);

    // Import to Firestore
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const row of data) {
      try {
        // Validate required fields
        if (!row.name || !row.price) {
          results.failed++;
          results.errors.push(`Row missing required fields: ${JSON.stringify(row)}`);
          continue;
        }

        // Prepare document data
        const docData: any = {
          name: row.name,
          brand: row.brand || 'Unknown',
          type: row.type || 'general',
          pricePerUnit: parseFloat(row.price.toString()),
          unit: row.unit || 'kg',
          description: row.description || '',
          imageUrl: row.imageUrl || '',
          composition: row.composition || '',
          availableLocations: row.locations 
            ? row.locations.split(',').map((l: string) => l.trim())
            : ['All India'],
          lastUpdated: Timestamp.now(),
        };

        // Category-specific fields
        if (category === 'pesticides') {
          docData.targetDisease = row.targetDisease 
            ? row.targetDisease.split(',').map((d: string) => d.trim())
            : [];
          docData.dosage = row.dosage || '';
          docData.safetyPeriod = row.safetyPeriod || '';
          docData.applicationMethod = row.applicationMethod
            ? row.applicationMethod.split(',').map((m: string) => m.trim())
            : [];
          docData.packSizes = row.packSizes
            ? row.packSizes.split(',').map((s: string) => s.trim())
            : [];
        } else if (category === 'fertilizers') {
          docData.npkRatio = row.npkRatio || '';
          docData.suitableFor = row.suitableFor
            ? row.suitableFor.split(',').map((c: string) => c.trim())
            : [];
          docData.applicationRate = row.applicationRate || '';
          docData.benefits = row.benefits
            ? row.benefits.split(',').map((b: string) => b.trim())
            : [];
          docData.packSizes = row.packSizes
            ? row.packSizes.split(',').map((s: string) => s.trim())
            : [];
        }

        // Use provided ID or generate one
        const docId = row.id || `${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Save to Firestore
        await setDoc(doc(db, category, docId), docData);
        
        results.success++;
        console.log(`Imported: ${row.name}`);
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Error importing ${row.name}: ${error.message}`);
        console.error(`Error importing row:`, error);
      }
    }

    return NextResponse.json({
      message: 'Import completed',
      results,
    });
  } catch (error: any) {
    console.error('Error processing Excel file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process file' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to download template
export async function GET() {
  // Create sample Excel template
  const pesticideTemplate = [
    {
      id: 'pest_001',
      name: 'Copper Oxychloride',
      brand: 'Bayer',
      type: 'fungicide',
      price: 450,
      unit: 'kg',
      description: 'Broad-spectrum fungicide',
      imageUrl: 'https://example.com/image.jpg',
      composition: 'Copper Oxychloride 50% WP',
      targetDisease: 'Late Blight, Early Blight',
      dosage: '2-3 grams per liter',
      safetyPeriod: '7 days',
      applicationMethod: 'Foliar spray, Drenching',
      packSizes: '500g, 1kg, 5kg',
      locations: 'Hyderabad, Bangalore, Mumbai',
    },
  ];

  const fertilizerTemplate = [
    {
      id: 'fert_001',
      name: 'NPK Complex',
      brand: 'IFFCO',
      type: 'chemical',
      price: 650,
      unit: 'bag',
      npkRatio: '10-26-26',
      description: 'Balanced NPK fertilizer',
      imageUrl: 'https://example.com/image.jpg',
      composition: 'N:10%, P:26%, K:26%',
      suitableFor: 'Wheat, Rice, Cotton',
      applicationRate: '100-150 kg per acre',
      benefits: 'Balanced nutrition, Improved yield',
      packSizes: '50kg bag',
      locations: 'Hyderabad, Bangalore, Mumbai',
    },
  ];

  // Create workbook with both templates
  const workbook = XLSX.utils.book_new();
  
  const pesticideSheet = XLSX.utils.json_to_sheet(pesticideTemplate);
  XLSX.utils.book_append_sheet(workbook, pesticideSheet, 'Pesticides Template');
  
  const fertilizerSheet = XLSX.utils.json_to_sheet(fertilizerTemplate);
  XLSX.utils.book_append_sheet(workbook, fertilizerSheet, 'Fertilizers Template');

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

  return new NextResponse(excelBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=marketplace_template.xlsx',
    },
  });
}