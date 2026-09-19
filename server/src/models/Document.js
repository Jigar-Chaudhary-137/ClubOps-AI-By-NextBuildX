const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [200, 'Document title cannot exceed 200 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    fileUrl: {
      type: String,
      default: ''
    },
    fileType: {
      type: String,
      enum: {
        values: ['pdf', 'doc', 'docx', 'txt', 'image', 'other'],
        message: '{VALUE} is not a valid document type'
      },
      default: 'other'
    },
    category: {
      type: String,
      enum: {
        values: ['guidelines', 'report', 'rules', 'sponsorship', 'budget', 'minutes', 'general', 'other'],
        message: '{VALUE} is not a valid document category'
      },
      default: 'general',
      index: true
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: [true, 'Associated club is required'],
      index: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
      index: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isKnowledgeBase: {
      type: Boolean,
      default: false,
      index: true
    },
    contentSummary: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);

module.exports = Document;
