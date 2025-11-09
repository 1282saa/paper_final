import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoutes from "./routes/chat.js";

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors()); // CORS 활성화
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 파싱

// 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 헬스체크 엔드포인트
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "오늘 한 장 백엔드 서버가 정상 작동중입니다.",
    timestamp: new Date().toISOString(),
  });
});

// API 라우트 등록
app.use("/api/chat", chatRoutes);

// 404 에러 핸들링
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "요청하신 엔드포인트를 찾을 수 없습니다.",
  });
});

// 전역 에러 핸들링
app.use((err, req, res, next) => {
  console.error("서버 오류:", err);
  res.status(500).json({
    success: false,
    error: "서버 내부 오류가 발생했습니다.",
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log(`🚀 오늘 한 장 백엔드 서버 시작`);
  console.log(`📡 포트: ${PORT}`);
  console.log(`🌍 환경: ${process.env.NODE_ENV || "development"}`);
  console.log(`🤖 AWS Region: ${process.env.AWS_REGION || "us-east-1"}`);
  console.log(`⏰ 시작 시간: ${new Date().toISOString()}`);
  console.log("=".repeat(50));
});

// 프로세스 종료 처리
process.on("SIGINT", () => {
  console.log("\n서버를 종료합니다...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n서버를 종료합니다...");
  process.exit(0);
});
