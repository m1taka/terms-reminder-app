'use client';

import { useState, useEffect } from 'react';

interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  reminderDate: string;
  type: string;
  documentId?: string;
  status: string;
  extractedContext?: string;
  createdAt: string;
}

interface Document {
  id: string;
  filename: string;
}

export default function RemindersSection() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    dueDate: '',
    reminderDate: '',
    type: 'manual',
    documentId: ''
  });

  const reminderTypes = ['manual', 'deadline', 'court', 'filing', 'meeting'];
  const statusTypes = ['active', 'dismissed', 'all'];

  useEffect(() => {
    fetchReminders();
    fetchDocuments();
  }, [filterType, filterStatus]);

  const fetchReminders = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const response = await fetch(`http://localhost:5000/api/reminders?${params}`);
      const data = await response.json();
      setReminders(data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/documents');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReminder),
      });

      if (response.ok) {
        fetchReminders();
        setShowReminderForm(false);
        setNewReminder({
          title: '',
          description: '',
          dueDate: '',
          reminderDate: '',
          type: 'manual',
          documentId: ''
        });
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  const handleDismissReminder = async (reminderId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reminders/${reminderId}/dismiss`, {
        method: 'PUT',
      });

      if (response.ok) {
        fetchReminders();
      }
    } catch (error) {
      console.error('Error dismissing reminder:', error);
    }
  };

  const handleSnoozeReminder = async (reminderId: string, days: number) => {
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + days);
    const snoozeUntil = snoozeDate.toISOString().split('T')[0];

    try {
      const response = await fetch(`http://localhost:5000/api/reminders/${reminderId}/snooze`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ snoozeUntil }),
      });

      if (response.ok) {
        fetchReminders();
      }
    } catch (error) {
      console.error('Error snoozing reminder:', error);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/reminders/${reminderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchReminders();
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      deadline: 'bg-red-100 text-red-800 border-red-200',
      court: 'bg-purple-100 text-purple-800 border-purple-200',
      filing: 'bg-orange-100 text-orange-800 border-orange-200',
      meeting: 'bg-blue-100 text-blue-800 border-blue-200',
      manual: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type as keyof typeof colors] || colors.manual;
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

  const isOverdue = (reminderDate: string) => {
    return new Date(reminderDate) < new Date();
  };

  const isToday = (reminderDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    return reminderDate === today;
  };

  const getUrgencyClass = (reminder: Reminder) => {
    if (reminder.status === 'dismissed') return 'opacity-60';
    if (isOverdue(reminder.reminderDate)) return 'border-l-4 border-l-red-500 bg-red-50';
    if (isToday(reminder.reminderDate)) return 'border-l-4 border-l-yellow-500 bg-yellow-50';
    return '';
  };

  const getDocumentName = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    return doc ? doc.filename : 'Unknown Document';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Reminders & Deadlines</h2>
          <button
            onClick={() => setShowReminderForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Manual Reminder
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {reminderTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusTypes.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          {reminders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No reminders found. Upload documents with dates or create manual reminders.
            </div>
          ) : (
            reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`border border-gray-200 rounded-lg p-4 transition-all ${getUrgencyClass(reminder)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getTypeIcon(reminder.type)}</span>
                      <h4 className="font-medium text-gray-900">{reminder.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getTypeColor(reminder.type)}`}>
                        {reminder.type}
                      </span>
                      {isOverdue(reminder.reminderDate) && (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 border border-red-200">
                          Overdue
                        </span>
                      )}
                      {isToday(reminder.reminderDate) && (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200">
                          Today
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
                    
                    <div className="text-sm text-gray-500 space-y-1">
                      <div>
                        <strong>Due:</strong> {new Date(reminder.dueDate).toLocaleDateString()} | 
                        <strong> Remind:</strong> {new Date(reminder.reminderDate).toLocaleDateString()}
                      </div>
                      {reminder.documentId && (
                        <div>
                          <strong>Document:</strong> {getDocumentName(reminder.documentId)}
                        </div>
                      )}
                      {reminder.extractedContext && (
                        <div>
                          <strong>Context:</strong> "{reminder.extractedContext}"
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {reminder.status === 'active' && (
                    <div className="flex space-x-2 ml-4">
                      <div className="relative">
                        <button
                          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                          onClick={() => {
                            const dropdown = document.getElementById(`snooze-${reminder.id}`);
                            dropdown?.classList.toggle('hidden');
                          }}
                        >
                          Snooze
                        </button>
                        <div
                          id={`snooze-${reminder.id}`}
                          className="hidden absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                        >
                          <button
                            onClick={() => handleSnoozeReminder(reminder.id, 1)}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            1 day
                          </button>
                          <button
                            onClick={() => handleSnoozeReminder(reminder.id, 3)}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            3 days
                          </button>
                          <button
                            onClick={() => handleSnoozeReminder(reminder.id, 7)}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            1 week
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDismissReminder(reminder.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Manual Reminder Form Modal */}
      {showReminderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Manual Reminder</h3>
            <form onSubmit={handleCreateReminder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={newReminder.dueDate}
                  onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Date</label>
                <input
                  type="date"
                  required
                  value={newReminder.reminderDate}
                  onChange={(e) => setNewReminder({ ...newReminder, reminderDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newReminder.type}
                  onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {reminderTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Document (Optional)</label>
                <select
                  value={newReminder.documentId}
                  onChange={(e) => setNewReminder({ ...newReminder, documentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No document</option>
                  {documents.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.filename}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Reminder
                </button>
                <button
                  type="button"
                  onClick={() => setShowReminderForm(false)}
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
