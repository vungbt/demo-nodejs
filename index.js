const multer = require("multer");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = 3003;
const SECRET_KEY = "your_secret_key"; // 🔐 Change this to a strong secret

app.use(
  cors({
    origin: "*", // Replace with your React app URL
  })
);

// ✅ Auto-create 'uploads/' if it doesn't exist
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDir);
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    callback(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// ✅ Multer Setup
const upload = multer({
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
});

// Middleware
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));
app.use("/uploads", express.static("uploads")); // Serve uploaded files

// ✅ Upload Route
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Generate Signed URL (valid for 5 mins)
  const token = jwt.sign(
    { fileName: req.file.filename, exp: Math.floor(Date.now() / 1000) + 300 },
    SECRET_KEY
  );

  const videoUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/video?token=${token}`;

  res.json({
    message: "File uploaded successfully",
    videoUrl,
  });
});

// ✅ Get List of Files
app.get("/api/files", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ message: "Error reading uploads" });

    const fileUrls = files.map((file) => {
      const token = jwt.sign(
        { fileName: file, exp: Math.floor(Date.now() / 1000) + 300 },
        SECRET_KEY
      );
      return `${req.protocol}://${req.get("host")}/api/video?token=${token}`;
    });

    res.json(fileUrls);
  });
});

app.get("/api/stream", (req, res) => {
  const filePath = path.join(__dirname, "uploads/1740124300395-765220060.mp4");

  fs.stat(filePath, (err, stats) => {
    if (err) {
      return res.status(404).send("File not found");
    }

    const range = req.headers.range;
    if (!range) {
      return res.status(400).send("Requires Range header");
    }

    const CHUNK_SIZE = 10 ** 6; // 1MB per chunk
    const videoSize = stats.size;

    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    const contentLength = end - start + 1;

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);

    const videoStream = fs.createReadStream(filePath, { start, end });
    videoStream.pipe(res);
  });
});

// Start Server
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
