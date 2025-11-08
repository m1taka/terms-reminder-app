import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/lib/models/Event';
import { googleCalendarService } from '@/lib/services/googleCalendar';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const event = await Event.findById(id).populate('documentId').lean();
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
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

    const event = await Event.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('documentId');

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Sync with Google Calendar
    if (googleCalendarService.configured && event.googleCalendarEventId) {
      try {
        const reminderData = {
          title: event.title,
          description: event.description || `Event Type: ${event.type}\nLocation: ${event.location || 'N/A'}`,
          dueDate: event.date,
          reminderDate: event.date,
          priority: (event.type === 'deadline' || event.type === 'court' ? 'high' : 'medium') as any,
          category: event.type as any,
          type: event.type as any,
        };
        
        await googleCalendarService.updateEvent(event.googleCalendarEventId, reminderData);
        console.log('✓ Updated Google Calendar event:', event.googleCalendarEventId);
      } catch (calendarError) {
        console.error('Google Calendar update error:', calendarError);
      }
    }

    return NextResponse.json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
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

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Delete from Google Calendar if synced
    if (googleCalendarService.configured && event.googleCalendarEventId) {
      try {
        await googleCalendarService.deleteEvent(event.googleCalendarEventId);
        console.log('✓ Deleted Google Calendar event:', event.googleCalendarEventId);
      } catch (calendarError) {
        console.error('Google Calendar delete error:', calendarError);
      }
    }

    await Event.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
