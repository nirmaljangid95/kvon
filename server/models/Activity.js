const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  action: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
activitySchema.index({ projectId: 1, createdAt: -1 });
activitySchema.index({ issueId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
