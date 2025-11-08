import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/lib/models/Event';
import { googleCalendarService } from '@/lib/services/googleCalendar';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const filter: any = {};

    if (date) {
      const queryDate = new Date(date);
      const nextDay = new Date(queryDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: queryDate, $lt: nextDay };
    } else if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 1);
      filter.date = { $gte: startDate, $lt: endDate };
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year) + 1, 0, 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    if (type) filter.type = type;
    if (status) filter.status = status;

    const events = await Event.find(filter)
      .populate('documentId')
      .sort({ date: 1, time: 1 })
      .lean();

    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const event = new Event(body);
    await event.save();

    // Sync with Google Calendar
    if (googleCalendarService.configured) {
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
        
        const calendarEventId = await googleCalendarService.createEvent(reminderData);
        if (calendarEventId) {
          event.googleCalendarEventId = calendarEventId;
          await event.save();
          console.log('✓ Created Google Calendar event:', calendarEventId);
        }
      } catch (calendarError: any) {
        console.error('Google Calendar sync error:', calendarError.message);
      }
    }

    return NextResponse.json(
      { message: 'Event created successfully', event },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event', details: error.message },
      { status: 500 }
    );
  }
}
