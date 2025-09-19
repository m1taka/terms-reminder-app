'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  fetchReminders,
  createReminder,
  dismissReminder,
  snoozeReminder,
  deleteReminder,
  setFilters,
  type Reminder
} from '../../redux/slices/remindersSlice';
import { fetchDocuments } from '../../redux/slices/documentsSlice';

export default function RemindersSection() {
  const dispatch = useAppDispatch();
  const { reminders, loading, error, filters } = useAppSelector(state => state.reminders);
  const { documents } = useAppSelector(state => state.documents);
  
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    dueDate: '',
    reminderDate: '',
    termStartDate: '',
    termEndDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'legal' as 'legal' | 'administrative' | 'client' | 'court' | 'deadline' | 'meeting',
    assignedTo: '',
    relatedCase: '',
    contractParty1: '',
    contractParty2: '',
    type: 'manual' as 'manual' | 'deadline' | 'court' | 'filing' | 'meeting',
    documentId: '',
    status: 'active' as 'active' | 'dismissed' | 'completed' | 'snoozed'
  });

  const reminderTypes = ['manual', 'deadline', 'court', 'filing', 'meeting'];
  const statusTypes = ['active', 'dismissed', 'all'];
  const priorityTypes = ['low', 'medium', 'high', 'urgent'];
  const categoryTypes = ['legal', 'administrative', 'client', 'court', 'deadline', 'meeting'];

  useEffect(() => {
    dispatch(fetchReminders(filters));
    dispatch(fetchDocuments());
  }, [dispatch, filters]);

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createReminder(newReminder)).unwrap();
      setShowReminderForm(false);
      setNewReminder({
        title: '',
        description: '',
        dueDate: '',
        reminderDate: '',
        termStartDate: '',
        termEndDate: '',
        priority: 'medium',
        category: 'legal',
        assignedTo: '',
        relatedCase: '',
        contractParty1: '',
        contractParty2: '',
        type: 'manual',
        documentId: '',
        status: 'active'
      });
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  const handleDismissReminder = async (reminderId: string) => {
    try {
      await dispatch(dismissReminder(reminderId)).unwrap();
    } catch (error) {
      console.error('Error dismissing reminder:', error);
    }
  };

  const handleSnoozeReminder = async (reminderId: string, days: number) => {
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + days);
    const snoozeUntil = snoozeDate.toISOString().split('T')[0];

    try {
      await dispatch(snoozeReminder({ id: reminderId, snoozeUntil })).unwrap();
    } catch (error) {
      console.error('Error snoozing reminder:', error);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      await dispatch(deleteReminder(reminderId)).unwrap();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const handleFilterChange = (filterName: string, value: string) => {
    dispatch(setFilters({ [filterName]: value }));
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
    return reminderDate.split('T')[0] === today;
  };

  const getUrgencyClass = (reminder: Reminder) => {
    if (reminder.status === 'dismissed') return 'opacity-60';
    if (isOverdue(reminder.reminderDate)) return 'border-l-4 border-l-red-500 bg-red-50';
    if (isToday(reminder.reminderDate)) return 'border-l-4 border-l-yellow-500 bg-yellow-50';
    return '';
  };

  const getDocumentName = (documentId: string) => {
    const doc = documents.find(d => d._id === documentId);
    return doc ? doc.originalName : 'Unknown Document';
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
            <h3 className="text-sm font-medium text-red-800">Error loading reminders</h3>
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
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
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
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusTypes.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              {priorityTypes.map(priority => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          {reminders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No reminders found. Create manual reminders or upload documents with dates.
            </div>
          ) : (
            reminders.map((reminder) => (
              <div
                key={reminder._id}
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
                      {reminder.termStartDate && reminder.termEndDate && (
                        <div>
                          <strong>Term Period:</strong> {new Date(reminder.termStartDate).toLocaleDateString()} - {new Date(reminder.termEndDate).toLocaleDateString()}
                        </div>
                      )}
                      <div>
                        <strong>Priority:</strong> 
                        <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                          reminder.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          reminder.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          reminder.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {reminder.priority}
                        </span>
                        {reminder.category && (
                          <>
                            <strong className="ml-3">Category:</strong> 
                            <span className="ml-1 px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                              {reminder.category}
                            </span>
                          </>
                        )}
                      </div>
                      {reminder.assignedTo && (
                        <div>
                          <strong>Assigned to:</strong> {reminder.assignedTo}
                        </div>
                      )}
                      {reminder.relatedCase && (
                        <div>
                          <strong>Related Case:</strong> {reminder.relatedCase}
                        </div>
                      )}
                      {(reminder.contractParty1 || reminder.contractParty2) && (
                        <div>
                          <strong>Contract Parties:</strong> 
                          {reminder.contractParty1 && <span className="ml-1">{reminder.contractParty1}</span>}
                          {reminder.contractParty1 && reminder.contractParty2 && <span className="mx-1">↔</span>}
                          {reminder.contractParty2 && <span>{reminder.contractParty2}</span>}
                        </div>
                      )}
                      {reminder.documentId && (
                        <div>
                          <strong>Document:</strong> {getDocumentName(reminder.documentId)}
                        </div>
                      )}
                      {reminder.extractedContext && (
                        <div>
                          <strong>Context:</strong> &quot;{reminder.extractedContext}&quot;
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
                            const dropdown = document.getElementById(`snooze-${reminder._id}`);
                            dropdown?.classList.toggle('hidden');
                          }}
                        >
                          Snooze
                        </button>
                        <div
                          id={`snooze-${reminder._id}`}
                          className="hidden absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                        >
                          <button
                            onClick={() => handleSnoozeReminder(reminder._id, 1)}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            1 day
                          </button>
                          <button
                            onClick={() => handleSnoozeReminder(reminder._id, 3)}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            3 days
                          </button>
                          <button
                            onClick={() => handleSnoozeReminder(reminder._id, 7)}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            1 week
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDismissReminder(reminder._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleDeleteReminder(reminder._id)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term Start Date (Optional)</label>
                  <input
                    type="date"
                    value={newReminder.termStartDate}
                    onChange={(e) => setNewReminder({ ...newReminder, termStartDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term End Date (Optional)</label>
                  <input
                    type="date"
                    value={newReminder.termEndDate}
                    onChange={(e) => setNewReminder({ ...newReminder, termEndDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newReminder.priority}
                    onChange={(e) => setNewReminder({ ...newReminder, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {priorityTypes.map(priority => (
                      <option key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newReminder.category}
                    onChange={(e) => setNewReminder({ ...newReminder, category: e.target.value as 'legal' | 'administrative' | 'client' | 'court' | 'deadline' | 'meeting' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categoryTypes.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To (Optional)</label>
                <input
                  type="text"
                  value={newReminder.assignedTo}
                  onChange={(e) => setNewReminder({ ...newReminder, assignedTo: e.target.value })}
                  placeholder="e.g., John Doe, Legal Team"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Case (Optional)</label>
                <input
                  type="text"
                  value={newReminder.relatedCase}
                  onChange={(e) => setNewReminder({ ...newReminder, relatedCase: e.target.value })}
                  placeholder="e.g., Case #2024-001, Smith vs. ABC Corp"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Party 1 (Optional)</label>
                  <input
                    type="text"
                    value={newReminder.contractParty1}
                    onChange={(e) => setNewReminder({ ...newReminder, contractParty1: e.target.value })}
                    placeholder="e.g., ABC Corporation, John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Party 2 (Optional)</label>
                  <input
                    type="text"
                    value={newReminder.contractParty2}
                    onChange={(e) => setNewReminder({ ...newReminder, contractParty2: e.target.value })}
                    placeholder="e.g., XYZ Ltd, Jane Smith"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newReminder.type}
                  onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value as 'manual' | 'deadline' | 'court' | 'filing' | 'meeting' })}
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
                    <option key={doc._id} value={doc._id}>
                      {doc.originalName}
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
