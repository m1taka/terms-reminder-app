import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Reminder } from '@/lib/models/Reminder';

export async function GET() {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reminders = await Reminder.find({
      reminderDate: { $gte: today, $lt: tomorrow },
      status: 'active'
    }).populate('documentId').sort({ reminderDate: 1 }).lean();

    return NextResponse.json(reminders);
  } catch (error: any) {
    console.error('Error fetching today\'s reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today\'s reminders', details: error.message },
      { status: 500 }
    );
  }
}
