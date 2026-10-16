// Runs when no route matched the request
export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

// Runs whenever an error is passed along with next(error)
export const errorHandler = (err, req, res, next) => {
  let statusCode =
    err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message;

  // Mongoose validation: show just the readable messages
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((fieldError) => fieldError.message)
      .join(". ");
  }

  // Multer upload limits: these are the user's mistake, not a server fault
  if (err.name === "MulterError") {
    statusCode = 400;

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Each image must be 5 MB or smaller.";
    } else if (
      err.code === "LIMIT_FILE_COUNT" ||
      err.code === "LIMIT_UNEXPECTED_FILE"
    ) {
      message = "You can upload up to 10 images at a time.";
    }
  }

  res.status(statusCode).json({ success: false, message });
};