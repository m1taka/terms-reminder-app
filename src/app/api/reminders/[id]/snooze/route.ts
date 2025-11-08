import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Reminder } from '@/lib/models/Reminder';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();

    if (!body.snoozeUntil) {
      return NextResponse.json(
        { error: 'snoozeUntil is required' },
        { status: 400 }
      );
    }

    const reminder = await Reminder.findByIdAndUpdate(
      params.id,
      {
        $set: {
          status: 'snoozed',
          snoozeUntil: body.snoozeUntil,
          reminderDate: body.snoozeUntil
        }
      },
      { new: true }
    ).populate('documentId');

    if (!reminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Reminder snoozed successfully', reminder });
  } catch (error: any) {
    console.error('Error snoozing reminder:', error);
    return NextResponse.json(
      { error: 'Failed to snooze reminder', details: error.message },
      { status: 500 }
    );
  }
}
