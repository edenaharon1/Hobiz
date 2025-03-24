import express from "express";
const router = express.Router();
import multer from "multer";
import path from "path";
import fs from "fs";

const DEFAULT_DOMAIN = "http://localhost:3000"; // Define your default domain here

const base = process.env.DOMAIN_BASE
  ? process.env.DOMAIN_BASE.endsWith('/')
    ? process.env.DOMAIN_BASE
    : `${process.env.DOMAIN_BASE}/`
  : DEFAULT_DOMAIN;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../../uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

router.post('/', upload.single("file"), (req, res) => {
    if (!req.file) {
        res.status(400).send({ error: "No file uploaded." });
        return; // Important: return here to prevent further execution
    }

    const relativePath = path.posix.join("uploads", req.file.filename);
    const imageUrl = base + relativePath;

    fs.access(req.file.path, fs.constants.F_OK, (err) => {
        if (err) {
            console.error("File not found after upload:", err);
            res.status(500).send({ error: "File upload failed." });
            return; // Important: return here to prevent further execution
        }

        console.log("Uploaded file URL:", imageUrl);
        res.status(200).send({ url: imageUrl });
    });
});

export = router;