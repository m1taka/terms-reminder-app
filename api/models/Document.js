const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Document', documentSchema);
