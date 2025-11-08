'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  fetchEvents,
  createEvent,
  deleteEvent
} from '../../redux/slices/eventsSlice';
import { fetchReminders } from '../../redux/slices/remindersSlice';

export default function CalendarSection() {
  const dispatch = useAppDispatch();
  const { events, loading, error } = useAppSelector(state => state.events);
  const { reminders } = useAppSelector(state => state.reminders);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'meeting' as 'meeting' | 'deadline' | 'court' | 'consultation' | 'reminder'
  });

  const eventTypes: ('meeting' | 'deadline' | 'court' | 'consultation' | 'reminder')[] = ['meeting', 'deadline', 'court', 'consultation', 'reminder'];

  useEffect(() => {
    const month = (currentMonth.getMonth() + 1).toString();
    const year = currentMonth.getFullYear().toString();
    dispatch(fetchEvents({ month, year }));
    dispatch(fetchReminders());
  }, [currentMonth, dispatch]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventData = {
        ...newEvent,
        location: '',
        attendees: [],
        status: 'scheduled' as const
      };
      await dispatch(createEvent(eventData)).unwrap();
      setShowEventForm(false);
      setNewEvent({ title: '', description: '', date: '', time: '', type: 'meeting' as const });
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await dispatch(deleteEvent(eventId)).unwrap();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const getRemindersForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return reminders.filter(reminder => {
      if (!reminder.dueDate) return false;
      const reminderDate = new Date(reminder.dueDate).toISOString().split('T')[0];
      return reminderDate === dateStr;
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      meeting: 'bg-blue-100 text-blue-800',
      deadline: 'bg-red-100 text-red-800',
      court: 'bg-purple-100 text-purple-800',
      consultation: 'bg-green-100 text-green-800',
      reminder: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || colors.meeting;
  };

  const getReminderPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-orange-100 text-orange-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading calendar</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Calendar & Scheduling</h2>
          <button
            onClick={() => {
              setNewEvent({ ...newEvent, date: selectedDate });
              setShowEventForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Event
          </button>
        </div>

        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            ←
          </button>
          <h3 className="text-lg font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
          {getDaysInMonth(currentMonth).map((date, index) => {
            const dateEvents = getEventsForDate(date);
            const dateReminders = getRemindersForDate(date);
            const totalItems = dateEvents.length + dateReminders.length;
            return (
              <div
                key={index}
                className={`min-h-[80px] p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  isToday(date) ? 'bg-blue-50 border-blue-300' : ''
                } ${!isCurrentMonth(date) ? 'text-gray-400 bg-gray-50' : ''}`}
                onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
              >
                <div className="text-sm">{date.getDate()}</div>
                <div className="space-y-1">
                  {dateEvents.slice(0, 1).map(event => (
                    <div
                      key={event._id}
                      className={`text-xs px-1 py-0.5 rounded truncate ${getEventTypeColor(event.type)}`}
                      title={`Event: ${event.title}`}
                    >
                      📅 {event.title}
                    </div>
                  ))}
                  {dateReminders.slice(0, totalItems < 2 ? 1 : 0).map(reminder => (
                    <div
                      key={reminder._id}
                      className={`text-xs px-1 py-0.5 rounded truncate ${getReminderPriorityColor(reminder.priority)}`}
                      title={`Reminder: ${reminder.title}`}
                    >
                      🔔 {reminder.title}
                    </div>
                  ))}
                  {totalItems > 2 && (
                    <div className="text-xs text-gray-500">+{totalItems - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Events and Reminders for Selected Date */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">
            Events & Reminders for {new Date(selectedDate).toLocaleDateString()}
          </h4>
          <div className="space-y-4">
            {/* Events Section */}
            {getEventsForDate(new Date(selectedDate)).length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">📅 Events</h5>
                <div className="space-y-2">
                  {getEventsForDate(new Date(selectedDate)).map(event => (
                    <div key={event._id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium text-gray-900">{event.title}</h5>
                            <span className={`px-2 py-1 rounded-full text-xs ${getEventTypeColor(event.type)}`}>
                              {event.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          <p className="text-sm text-gray-500 mt-1">🕒 {event.time}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reminders Section */}
            {getRemindersForDate(new Date(selectedDate)).length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">🔔 Reminders</h5>
                <div className="space-y-2">
                  {getRemindersForDate(new Date(selectedDate)).map(reminder => (
                    <div key={reminder._id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium text-gray-900">{reminder.title}</h5>
                            <span className={`px-2 py-1 rounded-full text-xs ${getReminderPriorityColor(reminder.priority)}`}>
                              {reminder.priority}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              reminder.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                              reminder.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {reminder.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                          {reminder.dueDate && (
                            <p className="text-sm text-gray-500 mt-1">
                              ⏰ Due: {new Date(reminder.dueDate).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No items message */}
            {getEventsForDate(new Date(selectedDate)).length === 0 && 
             getRemindersForDate(new Date(selectedDate)).length === 0 && (
              <p className="text-gray-500 text-sm">No events or reminders scheduled for this date.</p>
            )}
          </div>
        </div>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Event</h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as 'meeting' | 'deadline' | 'court' | 'consultation' | 'reminder' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
