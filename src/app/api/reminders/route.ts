import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Reminder } from '@/lib/models/Reminder';
import { googleCalendarService } from '@/lib/services/googleCalendar';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');

    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;

    const reminders = await Reminder.find(filter)
      .populate('documentId')
      .sort({ dueDate: 1 })
      .lean();

    return NextResponse.json(reminders);
  } catch (error: any) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Clean up empty string fields that should be undefined for ObjectId references
    const reminderData = { ...body };
    if (reminderData.documentId === '' || reminderData.documentId === null) {
      delete reminderData.documentId;
    }
    if (reminderData.assignedTo === '') delete reminderData.assignedTo;
    if (reminderData.relatedCase === '') delete reminderData.relatedCase;
    if (reminderData.contractParty1 === '') delete reminderData.contractParty1;
    if (reminderData.contractParty2 === '') delete reminderData.contractParty2;
    if (reminderData.extractedContext === '') delete reminderData.extractedContext;

    const reminder = new Reminder(reminderData);
    await reminder.save();

    // Create Google Calendar event asynchronously (don't block response)
    if (googleCalendarService.configured) {
      googleCalendarService.createEvent(reminder.toObject())
        .then(eventId => {
          if (eventId) {
            reminder.googleCalendarEventId = eventId;
            return reminder.save();
          }
        })
        .catch(err => console.error('Failed to create calendar event:', err));
    }

    return NextResponse.json(
      { message: 'Reminder created successfully', reminder },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder', details: error.message },
      { status: 500 }
    );
  }
}
