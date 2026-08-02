const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  meetingTitle: {
    type: String,
    required: true,
    trim: true,
  },
  scheduledAt: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  records: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      status: {
        type: String,
        enum: ['present', 'absent', 'pending'],
        default: 'pending',
      },
      markedAt: {
        type: Date,
        default: null,
      },
    },
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Attendance', attendanceSchema);
