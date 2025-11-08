const { google } = require('googleapis');

class GoogleCalendarService {
  constructor() {
    this.isConfigured = false;
    this.calendar = null;
    this.initializeCalendar();
  }

  initializeCalendar() {
    try {
      // Check if Google Calendar credentials are provided
      if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        console.warn('Google Calendar not configured. Set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY to enable.');
        return;
      }

      // Create JWT auth client for service account
      const auth = new google.auth.JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      this.calendar = google.calendar({ version: 'v3', auth });
      this.isConfigured = true;
      console.log('✓ Google Calendar API initialized');
    } catch (error) {
      console.error('Failed to initialize Google Calendar:', error.message);
      this.isConfigured = false;
    }
  }

  async createEvent(reminder) {
    if (!this.isConfigured) {
      console.log('Google Calendar not configured, skipping event creation');
      return null;
    }

    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

      // Prepare event details
      const event = {
        summary: `⏰ ${reminder.title}`,
        description: this.formatDescription(reminder),
        start: {
          dateTime: new Date(reminder.dueDate).toISOString(),
          timeZone: process.env.TIMEZONE || 'UTC',
        },
        end: {
          dateTime: new Date(new Date(reminder.dueDate).getTime() + 60 * 60 * 1000).toISOString(), // +1 hour
          timeZone: process.env.TIMEZONE || 'UTC',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: this.calculateReminderMinutes(reminder.reminderDate, reminder.dueDate) },
            { method: 'popup', minutes: 30 },
          ],
        },
        colorId: this.getPriorityColor(reminder.priority),
      };

      // Add location if it's a court or meeting reminder
      if (reminder.type === 'court' || reminder.type === 'meeting') {
        event.location = reminder.relatedCase || 'TBD';
      }

      const response = await this.calendar.events.insert({
        calendarId: calendarId,
        requestBody: event,
      });

      console.log(`✓ Created Google Calendar event: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error.message);
      return null;
    }
  }

  async updateEvent(googleEventId, reminder) {
    if (!this.isConfigured || !googleEventId) {
      return null;
    }

    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

      const event = {
        summary: `⏰ ${reminder.title}`,
        description: this.formatDescription(reminder),
        start: {
          dateTime: new Date(reminder.dueDate).toISOString(),
          timeZone: process.env.TIMEZONE || 'UTC',
        },
        end: {
          dateTime: new Date(new Date(reminder.dueDate).getTime() + 60 * 60 * 1000).toISOString(),
          timeZone: process.env.TIMEZONE || 'UTC',
        },
        colorId: this.getPriorityColor(reminder.priority),
      };

      const response = await this.calendar.events.update({
        calendarId: calendarId,
        eventId: googleEventId,
        requestBody: event,
      });

      console.log(`✓ Updated Google Calendar event: ${googleEventId}`);
      return response.data.id;
    } catch (error) {
      console.error('Error updating Google Calendar event:', error.message);
      return null;
    }
  }

  async deleteEvent(googleEventId) {
    if (!this.isConfigured || !googleEventId) {
      return false;
    }

    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

      await this.calendar.events.delete({
        calendarId: calendarId,
        eventId: googleEventId,
      });

      console.log(`✓ Deleted Google Calendar event: ${googleEventId}`);
      return true;
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error.message);
      return false;
    }
  }

  formatDescription(reminder) {
    let description = reminder.description || '';
    description += `\n\n📋 Category: ${reminder.category}`;
    description += `\n🎯 Priority: ${reminder.priority}`;
    description += `\n📝 Type: ${reminder.type}`;
    
    if (reminder.assignedTo) {
      description += `\n👤 Assigned To: ${reminder.assignedTo}`;
    }
    
    if (reminder.relatedCase) {
      description += `\n📂 Related Case: ${reminder.relatedCase}`;
    }
    
    if (reminder.contractParty1 || reminder.contractParty2) {
      description += `\n🤝 Parties: ${reminder.contractParty1 || ''} - ${reminder.contractParty2 || ''}`;
    }
    
    return description;
  }

  calculateReminderMinutes(reminderDate, dueDate) {
    const reminderTime = new Date(reminderDate).getTime();
    const dueTime = new Date(dueDate).getTime();
    const diffMinutes = Math.floor((dueTime - reminderTime) / (1000 * 60));
    return Math.max(diffMinutes, 0);
  }

  getPriorityColor(priority) {
    // Google Calendar color IDs
    const colors = {
      urgent: '11', // Red
      high: '6',    // Orange
      medium: '5',  // Yellow
      low: '2',     // Green
    };
    return colors[priority] || '1'; // Default blue
  }
}

// Export singleton instance
module.exports = new GoogleCalendarService();
