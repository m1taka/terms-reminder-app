import mongoose, { Schema, Model } from 'mongoose';

export interface IReminder {
  _id?: string;
  title: string;
  description?: string;
  dueDate: Date;
  reminderDate: Date;
  termStartDate?: Date;
  termEndDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'legal' | 'administrative' | 'client' | 'court' | 'deadline' | 'meeting';
  assignedTo?: string;
  relatedCase?: string;
  contractParty1?: string;
  contractParty2?: string;
  type: 'manual' | 'deadline' | 'court' | 'filing' | 'meeting';
  documentId?: mongoose.Types.ObjectId;
  status: 'active' | 'dismissed' | 'completed' | 'snoozed';
  extractedContext?: string;
  snoozeUntil?: Date;
  googleCalendarEventId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const reminderSchema = new Schema<IReminder>({
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
    type: Schema.Types.ObjectId,
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

export const Reminder: Model<IReminder> = mongoose.models.Reminder || mongoose.model<IReminder>('Reminder', reminderSchema);
