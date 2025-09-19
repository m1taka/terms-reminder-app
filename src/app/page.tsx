'use client';

import { useState } from 'react';
import Navigation from './components/Navigation';
import DocumentsSection from './components/DocumentsSection';
import CalendarSection from './components/CalendarSection';
import AIAssistant from './components/AIAssistant';
import RemindersSection from './components/RemindersSection';

export default function Home() {
  const [activeSection, setActiveSection] = useState('documents');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'documents':
        return <DocumentsSection />;
      case 'calendar':
        return <CalendarSection />;
      case 'reminders':
        return <RemindersSection />;
      case 'ai':
        return <AIAssistant />;
      default:
        return <DocumentsSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="container mx-auto px-4 py-8">
        {renderActiveSection()}
      </main>
    </div>
  );
}
