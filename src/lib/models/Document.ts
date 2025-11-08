import mongoose, { Schema, Model } from 'mongoose';

export interface IDocument {
  _id?: string;
  filename: string;
  originalName: string;
  description?: string;
  category: 'contract' | 'legal' | 'administrative' | 'court' | 'other';
  tags?: string[];
  size: number;
  mimetype: string;
  uploadDate?: Date;
  extractedDates?: Array<{
    date: string;
    type: string;
    context: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

const documentSchema = new Schema<IDocument>({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['contract', 'legal', 'administrative', 'court', 'other'],
    default: 'other'
  },
  tags: [{
    type: String
  }],
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  extractedDates: [{
    date: String,
    type: String,
    context: String
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
documentSchema.index({ category: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ uploadDate: -1 });

export const Document: Model<IDocument> = mongoose.models.Document || mongoose.model<IDocument>('Document', documentSchema);
