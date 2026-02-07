import mongoose from "mongoose";

export const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  profileViews: {
    type: Number,
    default: 0
  },
  linkClicks: {
    type: Map,
    of: Number,
    default: new Map()
  },
  dailyViews: [{
    date: {
      type: Date,
      required: true
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  dailyClicks: [{
    date: {
      type: Date,
      required: true
    },
    linkType: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  recentActivity: [{
    type: {
      type: String,
      enum: ['profile_view', 'link_click'],
      required: true
    },
    linkType: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }],
  rank: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
analyticsSchema.index({ userId: 1, 'dailyViews.date': -1 });
analyticsSchema.index({ userId: 1, 'recentActivity.timestamp': -1 });

export default analyticsSchema;
