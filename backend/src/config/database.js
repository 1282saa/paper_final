import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/learning-notes";

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB 연결 성공");
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB 연결 실패:", error.message);
    process.exit(1);
  }
};

// MongoDB 연결 이벤트 리스너
mongoose.connection.on("error", (err) => {
  console.error("MongoDB 오류:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB 연결 해제됨");
});

export default connectDB;
