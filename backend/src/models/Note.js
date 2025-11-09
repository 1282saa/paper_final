import mongoose from "mongoose";

const NoteChunkSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  vectorId: {
    type: String,
    index: true,
  },
  startIndex: Number,
  endIndex: Number,
});

const NoteSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    s3Key: {
      type: String,
    },
    chunks: [NoteChunkSchema],
    metadata: {
      uploadDate: {
        type: Date,
        default: Date.now,
      },
      ocrConfidence: {
        type: Number,
        min: 0,
        max: 1,
      },
      pageCount: {
        type: Number,
        default: 1,
      },
      fileSize: Number,
      mimeType: String,
    },
    tags: [String],
    isIndexed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 인덱스 설정
NoteSchema.index({ userId: 1, createdAt: -1 });
NoteSchema.index({ subject: 1, createdAt: -1 });
NoteSchema.index({ tags: 1 });
NoteSchema.index({ "metadata.uploadDate": -1 });

export default mongoose.model("Note", NoteSchema);
