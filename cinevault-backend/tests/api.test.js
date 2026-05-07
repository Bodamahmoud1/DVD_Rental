require("dotenv").config();
const request  = require("supertest");
const mongoose = require("mongoose");
const app      = require("../src/server");
const Member   = require("../src/models/Member");

let token    = "";
let memberId = "";
let filmId   = "";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Member.deleteMany({ email: "test@cinevault.com" });
});

afterAll(async () => {
  await Member.deleteMany({ email: "test@cinevault.com" });
  await mongoose.connection.close();
});

// ── AUTH ──────────────────────────────────────────────────────
describe("Auth Endpoints", () => {
  test("POST /api/auth/register — should register a new member", async () => {
    const res = await request(app).post("/api/auth/register").send({
      memberName: "Test User", email: "test@cinevault.com",
      password: "Test1234!", phone: "0100000000",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.member).toHaveProperty("email", "test@cinevault.com");
    expect(res.body.member).toHaveProperty("balance");
    expect(typeof res.body.member.balance).toBe("number");
    token    = res.body.token;
    memberId = res.body.member._id;
  });

  test("POST /api/auth/register — duplicate email should return 409", async () => {
    const res = await request(app).post("/api/auth/register").send({
      memberName: "Test User", email: "test@cinevault.com", password: "Test1234!",
    });
    expect(res.statusCode).toBe(409);
  });

  test("POST /api/auth/login — should login and return token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@cinevault.com", password: "Test1234!",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  test("POST /api/auth/login — wrong password should return 401", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@cinevault.com", password: "wrongpass",
    });
    expect(res.statusCode).toBe(401);
  });

  test("GET /api/auth/me — should return current user", async () => {
    const res = await request(app).get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("email", "test@cinevault.com");
  });

  test("GET /api/auth/me — no token should return 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });
});

// ── FILMS ─────────────────────────────────────────────────────
describe("Films Endpoints", () => {
  test("GET /api/films — should return list of films", async () => {
    const res = await request(app).get("/api/films");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("films");
    expect(Array.isArray(res.body.films)).toBe(true);
    if (res.body.films.length > 0) filmId = res.body.films[0]._id;
  });

  test("GET /api/films?title=inception — should filter by title", async () => {
    const res = await request(app).get("/api/films?title=inception");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("films");
  });

  test("GET /api/films?page=1&limit=5 — should paginate", async () => {
    const res = await request(app).get("/api/films?page=1&limit=5");
    expect(res.statusCode).toBe(200);
    expect(res.body.films.length).toBeLessThanOrEqual(5);
  });

  test("GET /api/films/:id — should return film details", async () => {
    if (!filmId) return;
    const res = await request(app).get(`/api/films/${filmId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("filmTitle");
  });

  test("GET /api/films/invalid-id — should return 500", async () => {
    const res = await request(app).get("/api/films/invalid-id");
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

// ── MEMBERS ───────────────────────────────────────────────────
describe("Members Endpoints", () => {
  test("GET /api/members/profile — should return member profile", async () => {
    const res = await request(app).get("/api/members/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("memberName");
  });

  test("PUT /api/members/profile — should update profile", async () => {
    const res = await request(app).put("/api/members/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ memberName: "Updated Name", phone: "0111111111" });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Profile updated");
  });

  test("GET /api/members/profile — no auth should return 401", async () => {
    const res = await request(app).get("/api/members/profile");
    expect(res.statusCode).toBe(401);
  });
});

// ── RENTALS ───────────────────────────────────────────────────
describe("Rentals Endpoints", () => {
  test("GET /api/rentals/my — should return member rentals", async () => {
    const res = await request(app).get("/api/rentals/my")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("rentals");
  });

  test("GET /api/rentals/my — no auth should return 401", async () => {
    const res = await request(app).get("/api/rentals/my");
    expect(res.statusCode).toBe(401);
  });

  test("POST /api/rentals — no auth should return 401", async () => {
    const res = await request(app).post("/api/rentals")
      .send({ filmId: filmId });
    expect(res.statusCode).toBe(401);
  });
});

// ── CATALOG ───────────────────────────────────────────────────
describe("Catalog Endpoints", () => {
  test("GET /api/categories — should return categories", async () => {
    const res = await request(app).get("/api/categories");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("categories");
    expect(Array.isArray(res.body.categories)).toBe(true);
  });

  test("GET /api/actors — should return actors", async () => {
    const res = await request(app).get("/api/actors");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("actors");
    expect(Array.isArray(res.body.actors)).toBe(true);
  });

  test("GET /api/actors?name=Tom — should search actors", async () => {
    const res = await request(app).get("/api/actors?name=Tom");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("actors");
  });
});

// ── HEALTH CHECK ──────────────────────────────────────────────
describe("Health Check", () => {
  test("GET / — should return API running message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });
});
