import mongoose from "mongoose";

const QuestionItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["객관식", "주관식", "OX", "단답형"],
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: [String], // 객관식 선택지
  answer: {
    type: String,
    required: true,
  },
  explanation: String,
  difficulty: {
    type: String,
    enum: ["쉬움", "보통", "어려움"],
    default: "보통",
  },
  points: {
    type: Number,
    default: 10,
  },
});

const QuestionSetSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: String,
    subject: String,
    questions: [QuestionItemSchema],
    metadata: {
      totalQuestions: Number,
      difficulty: String,
      estimatedTime: Number, // 예상 소요 시간 (분)
    },
  },
  {
    timestamps: true,
  }
);

// 인덱스 설정
QuestionSetSchema.index({ userId: 1, createdAt: -1 });
QuestionSetSchema.index({ noteId: 1 });

export default mongoose.model("QuestionSet", QuestionSetSchema);
