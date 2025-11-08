import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    return NextResponse.json({ 
      status: 'ok',
      message: 'API is working',
      timestamp: new Date().toISOString(),
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error',
        message: 'API health check failed',
        timestamp: new Date().toISOString(),
        mongodb: 'disconnected',
        error: error.message
      },
      { status: 500 }
    );
  }
}
