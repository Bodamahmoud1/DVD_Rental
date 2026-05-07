require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/server");
const Member = require("../src/models/Member");

let token = "";
let memberId = "";

// A tiny 1x1 transparent GIF base64 for testing
const base64Image = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Member.deleteMany({ email: "image_test@cinevault.com" });

  // Register a user to get a token
  const res = await request(app).post("/api/auth/register").send({
    memberName: "Image Tester",
    email: "image_test@cinevault.com",
    password: "Password123!"
  });
  token = res.body.token;
  memberId = res.body.member._id;
});

afterAll(async () => {
  await Member.deleteMany({ email: "image_test@cinevault.com" });
  await mongoose.connection.close();
});

describe("Image Processing Endpoint", () => {
  test("PUT /api/members/profile/picture — should process base64 image and return 200", async () => {
    const res = await request(app)
      .put("/api/members/profile/picture")
      .set("Authorization", `Bearer ${token}`)
      .send({ image: base64Image });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Profile picture updated");
    expect(res.body).toHaveProperty("profilePic");
    expect(res.body.profilePic.startsWith("data:image/jpeg;base64,")).toBe(true);
  });

  test("PUT /api/members/profile/picture — missing image should return 400", async () => {
    const res = await request(app)
      .put("/api/members/profile/picture")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("No image data provided");
  });
});
