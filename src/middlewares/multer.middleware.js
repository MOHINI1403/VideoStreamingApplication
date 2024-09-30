/*import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
// Initalise Multer with Storage Options:
export const upload = multer({ storage: storage });
*/
import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure the destination folder exists or create it dynamically
const tempDir = "./public/temp";

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir); // Use the dynamically checked/created folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix); // Create unique file name
  },
});

// Initialize Multer with Storage Options:
export const upload = multer({ storage: storage });