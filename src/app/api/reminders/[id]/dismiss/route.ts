import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Reminder } from '@/lib/models/Reminder';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const reminder = await Reminder.findByIdAndUpdate(
      id,
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
  } catch (error) {
    console.error('Error dismissing reminder:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss reminder' },
      { status: 500 }
    );
  }
}
