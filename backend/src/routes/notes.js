import express from "express";
import multer from "multer";
import Note from "../models/Note.js";
import s3Service from "../services/s3Service.js";
import textractService from "../services/textractService.js";

const router = express.Router();

// Multer 설정 (메모리 스토리지 사용)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 제한
  },
  fileFilter: (req, file, cb) => {
    // 이미지 파일만 허용
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("이미지 파일만 업로드 가능합니다."));
    }
  },
});

/**
 * POST /api/notes/upload
 * 필기노트 이미지 업로드 + OCR 처리
 */
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { title, subject, tags, userId = "test-user" } = req.body;

    // 파일 검증
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "이미지 파일이 필요합니다.",
      });
    }

    // 필수 필드 검증
    if (!title) {
      return res.status(400).json({
        success: false,
        error: "노트 제목이 필요합니다.",
      });
    }

    console.log(`\n📤 노트 업로드 시작: ${title}`);
    console.log(`📁 파일: ${req.file.originalname} (${req.file.size} bytes)`);

    // 1. S3에 이미지 업로드
    console.log("⬆️  S3 업로드 중...");
    const { s3Key, imageUrl } = await s3Service.uploadImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      userId
    );
    console.log("✅ S3 업로드 완료");

    // 2. Textract OCR 처리
    console.log("🔍 OCR 처리 중...");
    const ocrResult = await textractService.extractTextFromImage(req.file.buffer);
    console.log(`✅ OCR 완료 (신뢰도: ${(ocrResult.confidence * 100).toFixed(1)}%)`);
    console.log(`📝 추출된 텍스트 길이: ${ocrResult.text.length} 자`);

    // 3. MongoDB에 노트 저장
    const note = new Note({
      userId,
      title,
      subject,
      content: ocrResult.text,
      imageUrl,
      s3Key,
      metadata: {
        uploadDate: new Date(),
        ocrConfidence: ocrResult.confidence,
        pageCount: 1,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
    });

    await note.save();
    console.log(`✅ 노트 저장 완료 (ID: ${note._id})`);

    // 성공 응답
    res.json({
      success: true,
      data: {
        noteId: note._id,
        title: note.title,
        subject: note.subject,
        extractedText: ocrResult.text,
        textLength: ocrResult.text.length,
        ocrConfidence: ocrResult.confidence,
        imageUrl: note.imageUrl,
        createdAt: note.createdAt,
      },
    });
  } catch (error) {
    console.error("노트 업로드 오류:", error);
    res.status(500).json({
      success: false,
      error: error.message || "노트 업로드 중 오류가 발생했습니다.",
    });
  }
});

/**
 * GET /api/notes
 * 노트 목록 조회
 */
router.get("/", async (req, res) => {
  try {
    const {
      userId = "test-user",
      subject,
      page = 1,
      limit = 10,
    } = req.query;

    const query = { userId };
    if (subject) {
      query.subject = subject;
    }

    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      Note.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("-content -chunks"), // 텍스트 내용 제외 (목록에서는 필요없음)
      Note.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        notes,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("노트 조회 오류:", error);
    res.status(500).json({
      success: false,
      error: "노트 조회 중 오류가 발생했습니다.",
    });
  }
});

/**
 * GET /api/notes/:noteId
 * 특정 노트 상세 조회
 */
router.get("/:noteId", async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: "노트를 찾을 수 없습니다.",
      });
    }

    res.json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error("노트 상세 조회 오류:", error);
    res.status(500).json({
      success: false,
      error: "노트 조회 중 오류가 발생했습니다.",
    });
  }
});

/**
 * DELETE /api/notes/:noteId
 * 노트 삭제
 */
router.delete("/:noteId", async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findByIdAndDelete(noteId);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: "노트를 찾을 수 없습니다.",
      });
    }

    // TODO: S3에서도 이미지 삭제 (선택사항)

    res.json({
      success: true,
      message: "노트가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("노트 삭제 오류:", error);
    res.status(500).json({
      success: false,
      error: "노트 삭제 중 오류가 발생했습니다.",
    });
  }
});

export default router;
