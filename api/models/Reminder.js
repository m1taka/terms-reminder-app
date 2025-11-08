const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  dueDate: {
    type: Date,
    required: true
  },
  reminderDate: {
    type: Date,
    required: true
  },
  termStartDate: {
    type: Date
  },
  termEndDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['legal', 'administrative', 'client', 'court', 'deadline', 'meeting'],
    required: true
  },
  assignedTo: {
    type: String
  },
  relatedCase: {
    type: String
  },
  contractParty1: {
    type: String
  },
  contractParty2: {
    type: String
  },
  type: {
    type: String,
    enum: ['manual', 'deadline', 'court', 'filing', 'meeting'],
    default: 'manual'
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  status: {
    type: String,
    enum: ['active', 'dismissed', 'completed', 'snoozed'],
    default: 'active'
  },
  extractedContext: {
    type: String
  },
  snoozeUntil: {
    type: Date
  },
  googleCalendarEventId: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reminderSchema.index({ dueDate: 1 });
reminderSchema.index({ reminderDate: 1 });
reminderSchema.index({ status: 1 });
reminderSchema.index({ priority: 1 });
reminderSchema.index({ type: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
