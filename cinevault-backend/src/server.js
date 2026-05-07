require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const mongoose   = require("mongoose");
const morgan     = require("morgan");
const helmet     = require("helmet");
const path       = require("path");
const connectDB  = require("./config/db");
const { connectRedis } = require("./config/redis");

// Swagger
const swaggerUi   = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Routes
const authRoutes    = require("./routes/auth");
const filmRoutes    = require("./routes/films");
const rentalRoutes  = require("./routes/rentals");
const memberRoutes  = require("./routes/members");
const catalogRoutes = require("./routes/catalog");
const reviewRoutes  = require("./routes/reviews");

const FilmTitle    = require("./models/FilmTitle");
const seedDatabase = require("./seed");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware (must be registered before routes) ──────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true, limit: "8mb" }));

// ── Swagger UI ─────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "CineVault API Docs",
  customCss: ".swagger-ui .topbar { background-color: #0D0D0D; }",
}));

// ── Health check ───────────────────────────────────────────────
app.get("/", (req, res) =>
  res.status(200).json({
    message: "CineVault API is running!",
    version: "1.0.0",
    docs: `http://localhost:${PORT}/api-docs`,
  })
);

// ── Static uploads ─────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── API Routes ─────────────────────────────────────────────────
app.use("/api/auth",    authRoutes);
app.use("/api/films",   filmRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api",         catalogRoutes);

// ── 404 handler ────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// ── Global error handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// ── Start server ───────────────────────────────────────────────
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();
    await mongoose.connection.asPromise();
    console.log("MongoDB connected");

    // 2. Seed database if empty
    const filmsCount = await FilmTitle.countDocuments();
    if (filmsCount === 0) {
      console.log("Database empty. Running seed...");
      await seedDatabase();
      console.log("Seeding complete");
    }

    // 3. Connect to Redis (optional — app works without it)
    try {
      await connectRedis();
      console.log("Redis connected");
    } catch (redisErr) {
      console.warn("Redis unavailable, continuing without cache:", redisErr.message);
    }

    // 4. Start listening
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API Docs:  http://localhost:${PORT}/api-docs`);
    });

  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;