'use client';

import { useEffect } from 'react';
import ReminderNotifications from './ReminderNotifications';

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function Navigation({ activeSection, setActiveSection }: NavigationProps) {
  const navItems = [
    { id: 'reminders', label: 'Reminders', icon: '⏰' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'ai', label: 'AI Assistant', icon: '🤖' }
  ];

  useEffect(() => {
    const handleNavigateToReminders = () => {
      setActiveSection('reminders');
    };

    window.addEventListener('navigate-to-reminders', handleNavigateToReminders);
    return () => window.removeEventListener('navigate-to-reminders', handleNavigateToReminders);
  }, [setActiveSection]);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📋</span>
            <h1 className="text-xl font-bold text-gray-900">Terms Reminder</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    activeSection === item.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            
            <ReminderNotifications />
          </div>
        </div>
      </div>
    </nav>
  );
}
