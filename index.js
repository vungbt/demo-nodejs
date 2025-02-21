const multer = require("multer");
const express = require("express");
const bodyParser = require("body-parser");
const router = require("./routes");
const path = require("path");
const fs = require("fs");

// ✅ Auto-create 'uploads/' if it doesn't exist
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDir); // Use the ensured directory
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    callback(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// ✅ Multer Setup
const upload = multer({
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // ✅ Set limit to 100MB
});

const app = express();
const PORT = 3003;

// Middleware
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));
app.use("/uploads", express.static("uploads")); // Serve uploaded files

// Routes
app.use("/api", router);

// ✅ Upload Route
app.post("/api/upload", upload.single("file"), (req, res) => {
  console.log("req===>", req);
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({
    message: "File uploaded successfully",
    filePath: `/uploads/${req.file.filename}`,
  });
});

app.get("/api/files", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ message: "Error reading uploads" });

    const fileUrls = files.map(
      (file) => `${req.protocol}://${req.get("host")}/uploads/${file}`
    );
    res.json(fileUrls);
  });
});

// Start Server
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
