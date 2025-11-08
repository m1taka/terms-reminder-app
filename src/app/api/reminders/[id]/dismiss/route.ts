import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Reminder } from '@/lib/models/Reminder';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const reminder = await Reminder.findByIdAndUpdate(
      params.id,
      { $set: { status: 'dismissed' } },
      { new: true }
    ).populate('documentId');

    if (!reminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Reminder dismissed successfully', reminder });
  } catch (error: any) {
    console.error('Error dismissing reminder:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss reminder', details: error.message },
      { status: 500 }
    );
  }
}
