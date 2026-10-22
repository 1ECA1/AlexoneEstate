// import express from "express";
// import cors from "cors";
// import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
// import propertyRoutes from "./routes/propertyRoutes.js";
// import authRoutes from "./routes/authRoutes.js";
// import uploadRoutes from "./routes/uploadRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import favoriteRoutes from "./routes/favoriteRoutes.js";
// import inquiryRoutes from "./routes/inquiryRoutes.js";

// import agentRoutes from "./routes/agentRoutes.js";
// import aiRoutes from "./routes/aiRoutes.js";

// const app = express();

// app.use(cors({ origin: process.env.CLIENT_URL }));
// app.use(express.json());

// app.get("/api/health", (req, res) => {
//   res.json({ success: true, message: "API is running" });
// });

// app.use("/api/favorites", favoriteRoutes);
// app.use("/api/properties", propertyRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/uploads", uploadRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/inquiries", inquiryRoutes);

// app.use("/api/ai", aiRoutes);

// app.use("/api/agents", agentRoutes);


// app.use(notFound);
// app.use(errorHandler);

// export default app;





import express from "express";
import cors from "cors";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header, such as server-to-server requests.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked this origin: ${origin}`));
    },
  }),
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

app.use("/api/favorites", favoriteRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/agents", agentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
