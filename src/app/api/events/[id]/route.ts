import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/lib/models/Event';
import { googleCalendarService } from '@/lib/services/googleCalendar';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const event = await Event.findById(params.id).populate('documentId').lean();
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error: any) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();

    const event = await Event.findByIdAndUpdate(
      params.id,
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
        const dateTime = `${new Date(event.date).toISOString().split('T')[0]}T${event.time}:00`;
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
      } catch (calendarError: any) {
        console.error('Google Calendar update error:', calendarError.message);
      }
    }

    return NextResponse.json({ message: 'Event updated successfully', event });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const event = await Event.findById(params.id);

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
      } catch (calendarError: any) {
        console.error('Google Calendar delete error:', calendarError.message);
      }
    }

    await Event.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event', details: error.message },
      { status: 500 }
    );
  }
}
