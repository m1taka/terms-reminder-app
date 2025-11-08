import mongoose, { Schema, Model } from 'mongoose';

export interface IEvent {
  _id?: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  type: 'meeting' | 'deadline' | 'court' | 'consultation' | 'reminder';
  documentId?: mongoose.Types.ObjectId;
  location?: string;
  attendees?: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  googleCalendarEventId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const eventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['meeting', 'deadline', 'court', 'consultation', 'reminder'],
    default: 'meeting'
  },
  documentId: {
    type: Schema.Types.ObjectId,
    ref: 'Document'
  },
  location: {
    type: String,
    default: ''
  },
  attendees: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  googleCalendarEventId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
eventSchema.index({ date: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ status: 1 });

export const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);
