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
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Reminders & Deadlines</h2>
          <button
            onClick={() => setShowReminderForm(true)}
            className="bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
          >
            + Add Reminder
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
            <div className="text-center py-12 sm:py-8 text-gray-500 text-sm sm:text-base">
              No reminders found. Create manual reminders or upload documents with dates.
            </div>
          ) : (
            reminders.map((reminder) => (
              <div
                key={reminder._id}
                className={`border border-gray-200 rounded-lg p-4 sm:p-4 transition-all ${getUrgencyClass(reminder)}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Header with icon, title, and badges */}
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-xl sm:text-lg flex-shrink-0">{getTypeIcon(reminder.type)}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-base sm:text-base mb-1 break-words">{reminder.title}</h4>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs border ${getTypeColor(reminder.type)}`}>
                            {reminder.type}
                          </span>
                          {isOverdue(reminder.reminderDate) && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800 border border-red-200">
                              Overdue
                            </span>
                          )}
                          {isToday(reminder.reminderDate) && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200">
                              Today
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {reminder.description && (
                      <p className="text-sm text-gray-600 mb-3 break-words">{reminder.description}</p>
                    )}
                    
                    {/* Dates - Mobile optimized */}
                    <div className="text-xs sm:text-sm text-gray-500 space-y-1.5 mb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-semibold">📅 Due:</span>
                        <span>{new Date(reminder.dueDate).toLocaleDateString()}</span>
                        <span className="hidden sm:inline text-gray-300">|</span>
                        <span className="font-semibold">🔔 Remind:</span>
                        <span>{new Date(reminder.reminderDate).toLocaleDateString()}</span>
                      </div>
                      {reminder.termStartDate && reminder.termEndDate && (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="font-semibold">📆 Term:</span>
                          <span className="text-xs">{new Date(reminder.termStartDate).toLocaleDateString()} - {new Date(reminder.termEndDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {/* Priority and Category badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          reminder.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          reminder.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          reminder.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {reminder.priority}
                        </span>
                        {reminder.category && (
                          <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 font-medium">
                            {reminder.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Additional details - Collapsible on mobile */}
                    {(reminder.assignedTo || reminder.relatedCase || reminder.contractParty1 || reminder.contractParty2 || reminder.documentId || reminder.extractedContext) && (
                      <details className="text-xs sm:text-sm text-gray-500 mt-2">
                        <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                          More details
                        </summary>
                        <div className="space-y-1 mt-2 pl-4 border-l-2 border-gray-200">
                          {reminder.assignedTo && (
                            <div>
                              <strong>👤 Assigned to:</strong> {reminder.assignedTo}
                            </div>
                          )}
                          {reminder.relatedCase && (
                            <div>
                              <strong>📂 Related Case:</strong> {reminder.relatedCase}
                            </div>
                          )}
                          {(reminder.contractParty1 || reminder.contractParty2) && (
                            <div>
                              <strong>🤝 Parties:</strong> 
                              {reminder.contractParty1 && <span className="ml-1">{reminder.contractParty1}</span>}
                              {reminder.contractParty1 && reminder.contractParty2 && <span className="mx-1">↔</span>}
                              {reminder.contractParty2 && <span>{reminder.contractParty2}</span>}
                            </div>
                          )}
                          {reminder.documentId && (
                            <div>
                              <strong>📄 Document:</strong> {getDocumentName(reminder.documentId)}
                            </div>
                          )}
                          {reminder.extractedContext && (
                            <div>
                              <strong>💬 Context:</strong> &quot;{reminder.extractedContext}&quot;
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                  
                  {/* Action Buttons - Mobile optimized */}
                  {reminder.status === 'active' && (
                    <div className="flex sm:flex-col lg:flex-row gap-2 w-full sm:w-auto sm:ml-4">
                      <div className="relative flex-1 sm:flex-none">
                        <button
                          className="w-full sm:w-auto bg-yellow-600 text-white px-4 py-2.5 sm:py-2 sm:px-3 rounded text-sm font-medium hover:bg-yellow-700 transition-colors active:bg-yellow-800"
                          onClick={() => {
                            const dropdown = document.getElementById(`snooze-${reminder._id}`);
                            dropdown?.classList.toggle('hidden');
                          }}
                        >
                          😴 Snooze
                        </button>
                        <div
                          id={`snooze-${reminder._id}`}
                          className="hidden absolute left-0 sm:right-0 sm:left-auto mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-full sm:min-w-[120px]"
                        >
                          <button
                            onClick={() => {
                              handleSnoozeReminder(reminder._id, 1);
                              document.getElementById(`snooze-${reminder._id}`)?.classList.add('hidden');
                            }}
                            className="block w-full text-left px-4 py-2.5 sm:py-2 text-sm hover:bg-gray-50 active:bg-gray-100"
                          >
                            1 day
                          </button>
                          <button
                            onClick={() => {
                              handleSnoozeReminder(reminder._id, 3);
                              document.getElementById(`snooze-${reminder._id}`)?.classList.add('hidden');
                            }}
                            className="block w-full text-left px-4 py-2.5 sm:py-2 text-sm hover:bg-gray-50 active:bg-gray-100"
                          >
                            3 days
                          </button>
                          <button
                            onClick={() => {
                              handleSnoozeReminder(reminder._id, 7);
                              document.getElementById(`snooze-${reminder._id}`)?.classList.add('hidden');
                            }}
                            className="block w-full text-left px-4 py-2.5 sm:py-2 text-sm hover:bg-gray-50 active:bg-gray-100"
                          >
                            1 week
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDismissReminder(reminder._id)}
                        className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2.5 sm:py-2 sm:px-3 rounded text-sm font-medium hover:bg-green-700 transition-colors active:bg-green-800"
                      >
                        ✓ Done
                      </button>
                      <button
                        onClick={() => handleDeleteReminder(reminder._id)}
                        className="flex-1 sm:flex-none bg-red-600 text-white px-4 py-2.5 sm:py-2 sm:px-3 rounded text-sm font-medium hover:bg-red-700 transition-colors active:bg-red-800"
                      >
                        🗑️ Delete
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-lg p-4 sm:p-6 w-full sm:max-w-2xl min-h-screen sm:min-h-0 sm:max-h-[90vh] sm:overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-4 sticky top-0 bg-white py-2 sm:py-0 sm:static border-b sm:border-b-0 -mx-4 px-4 sm:mx-0 sm:px-0">
              <h3 className="text-lg sm:text-lg font-bold text-gray-900">Create Reminder</h3>
              <button
                type="button"
                onClick={() => setShowReminderForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl sm:hidden"
              >
                ×
              </button>
            </div>
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
              <div className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-white py-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:py-0 border-t sm:border-t-0 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 sm:py-2 rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium"
                >
                  Create Reminder
                </button>
                <button
                  type="button"
                  onClick={() => setShowReminderForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 sm:py-2 rounded-md hover:bg-gray-400 active:bg-gray-500 transition-colors font-medium"
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
