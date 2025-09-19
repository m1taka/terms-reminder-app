'use client';

import { useState, useEffect } from 'react';

interface TodayReminder {
  id: string;
  title: string;
  description: string;
  type: string;
  dueDate: string;
}

export default function ReminderNotifications() {
  const [todayReminders, setTodayReminders] = useState<TodayReminder[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchTodayReminders();
    // Poll for reminders every 5 minutes
    const interval = setInterval(fetchTodayReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTodayReminders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reminders/today');
      const data = await response.json();
      setTodayReminders(data);
    } catch (error) {
      console.error('Error fetching today reminders:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      deadline: '⏰',
      court: '⚖️',
      filing: '📋',
      meeting: '🤝',
      manual: '📝'
    };
    return icons[type as keyof typeof icons] || icons.manual;
  };

  if (todayReminders.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-red-600 hover:text-red-700 transition-colors"
        title="Today's Reminders"
      >
        <span className="text-xl">🔔</span>
        {todayReminders.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {todayReminders.length}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Today's Reminders</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {todayReminders.map((reminder) => (
              <div key={reminder.id} className="p-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-start space-x-2">
                  <span className="text-lg mt-0.5">{getTypeIcon(reminder.type)}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {reminder.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {reminder.description}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Due: {new Date(reminder.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => {
                setShowNotifications(false);
                // This would trigger navigation to reminders section
                window.dispatchEvent(new CustomEvent('navigate-to-reminders'));
              }}
              className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Reminders
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
