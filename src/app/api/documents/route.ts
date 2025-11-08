import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Document } from '@/lib/models/Document';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    const filter: any = {};
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const documents = await Document.find(filter).sort({ uploadDate: -1 }).lean();
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directory already exists
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.name);
    const filename = uniqueSuffix + ext;
    const filepath = path.join(uploadsDir, filename);

    // Write file to disk
    await writeFile(filepath, buffer);

    // Parse tags if they come as string
    let tags: string[] = [];
    const tagsInput = formData.get('tags');
    if (typeof tagsInput === 'string') {
      try {
        tags = JSON.parse(tagsInput);
      } catch {
        tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    const documentData = {
      filename: filename,
      originalName: file.name,
      description: formData.get('description') || '',
      category: formData.get('category') || 'other',
      tags: tags,
      size: file.size,
      mimetype: file.type,
      extractedDates: []
    };

    const document = new Document(documentData);
    await document.save();

    return NextResponse.json(
      { message: 'Document uploaded successfully', document },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

