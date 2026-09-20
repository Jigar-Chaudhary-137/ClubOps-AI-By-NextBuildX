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
    },
    // Stage: Scanned Image-Only PDF & Document OCR Metadata
    isOcrProcessed: {
      type: Boolean,
      default: false,
      index: true
    },
    ocrEngine: {
      type: String,
      default: null
    },
    // Stage 6: RAG Knowledge Base & Chunk Embeddings
    chunks: [
      {
        chunkIndex: {
          type: Number,
          required: true
        },
        text: {
          type: String,
          required: true
        },
        embedding: {
          type: [Number],
          default: []
        },
        pageNumber: {
          type: Number,
          default: null
        },
        tokenCount: {
          type: Number,
          default: 0
        },
        startOffset: {
          type: Number,
          default: 0
        },
        endOffset: {
          type: Number,
          default: 0
        }
      }
    ],
    ingestionStatus: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'processed', 'failed'],
        message: '{VALUE} is not a valid ingestion status'
      },
      default: 'pending',
      index: true
    },
    ingestionError: {
      type: String,
      default: null
    },
    extractedCharacterCount: {
      type: Number,
      default: 0
    },
    chunkCount: {
      type: Number,
      default: 0
    },
    embeddingModel: {
      type: String,
      default: null
    },
    embeddingVersion: {
      type: String,
      default: '1.0'
    },
    processedAt: {
      type: Date,
      default: null
    },
    sourceFileName: {
      type: String,
      default: null
    },
    mimeType: {
      type: String,
      default: null
    },
    fileSize: {
      type: Number,
      default: 0
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

// Multi-tenant compound index for fast RAG candidate retrieval
documentSchema.index({ club: 1, isKnowledgeBase: 1, ingestionStatus: 1 });
documentSchema.index({ club: 1, event: 1, isKnowledgeBase: 1, ingestionStatus: 1 });
documentSchema.index({ club: 1, isOcrProcessed: 1 });

const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);

module.exports = Document;
