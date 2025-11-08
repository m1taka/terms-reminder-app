import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Reminder } from '@/lib/models/Reminder';
import { googleCalendarService } from '@/lib/services/googleCalendar';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const reminder = await Reminder.findById(id).populate('documentId').lean();
    
    if (!reminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(reminder);
  } catch (error) {
    console.error('Error fetching reminder:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminder' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();

    // Clean up empty string fields
    const updateData = { ...body };
    if (updateData.documentId === '' || updateData.documentId === null) {
      delete updateData.documentId;
    }
    if (updateData.assignedTo === '') delete updateData.assignedTo;
    if (updateData.relatedCase === '') delete updateData.relatedCase;
    if (updateData.contractParty1 === '') delete updateData.contractParty1;
    if (updateData.contractParty2 === '') delete updateData.contractParty2;
    if (updateData.extractedContext === '') delete updateData.extractedContext;

    const reminder = await Reminder.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('documentId');

    if (!reminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }

    // Update Google Calendar event if it exists
    if (googleCalendarService.configured && reminder.googleCalendarEventId) {
      googleCalendarService.updateEvent(reminder.googleCalendarEventId, reminder.toObject())
        .catch(err => console.error('Failed to update calendar event:', err));
    }

    return NextResponse.json({ message: 'Reminder updated successfully', reminder });
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const reminder = await Reminder.findById(id);

    if (!reminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }

    // Delete Google Calendar event if it exists
    if (googleCalendarService.configured && reminder.googleCalendarEventId) {
      googleCalendarService.deleteEvent(reminder.googleCalendarEventId)
        .catch(err => console.error('Failed to delete calendar event:', err));
    }

    await Reminder.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}
