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
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <span className="text-xl sm:text-2xl">📋</span>
            <h1 className="text-base sm:text-xl font-bold text-gray-900">
              <span className="hidden sm:inline">Terms Reminder</span>
              <span className="sm:hidden">Terms</span>
            </h1>
          </div>
          
          {/* Navigation Items */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Nav Buttons */}
            <div className="flex space-x-0.5 sm:space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center space-x-1 sm:space-x-2 ${
                    activeSection === item.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                >
                  <span className="text-base sm:text-lg">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>
            
            {/* Notifications */}
            <div className="flex-shrink-0">
              <ReminderNotifications />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile bottom nav alternative - uncomment if you prefer bottom navigation */}
      {/* <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 ${
                activeSection === item.id
                  ? 'text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div> */}
    </nav>
  );
}
