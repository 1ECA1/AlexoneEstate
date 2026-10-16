import multer from "multer";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per image
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error("Only JPG, PNG, and WebP images are allowed.");
      error.statusCode = 400;
      return cb(error);
    }

    cb(null, true);
  },
});

export default uploadImages;