jest.mock("../../src/services/authService", () => ({
  registerUser: jest.fn(async (email: string) => ({ id: "u-1", email })),
  login: jest.fn(async (email: string) => ({
    token: "t",
    user: { id: "u-1", email },
  })),
  approveUser: jest.fn(async (id: string) => ({ id, approved: true })),
}));

// Mock auth middleware to set a fake user
jest.mock("../../src/middleware/auth", () => ({
  isAuthenticated: (req: any, res: any, next: any) => {
    req.user = { id: "u-1", role: "ADMIN" };
    next();
  },
  isAdmin: (req: any, res: any, next: any) => next(),
}));

import request from "supertest";
import app from "../../src/testApp";

describe("Auth Routes (unit)", () => {
  test("POST /api/auth/register returns 201", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "x@local.com", password: "password" })
      .set("Accept", "application/json");
    expect([201, 200]).toContain(res.status);
    expect(res.body).toBeDefined();
    expect(res.body).toHaveProperty("data");
  });

  test("POST /api/auth/login returns token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "x@local", password: "password" })
      .set("Accept", "application/json");
    expect([200]).toContain(res.status);
    expect(res.body).toHaveProperty("data.token");
  });

  test("POST /api/auth/approve/:id allowed for admin", async () => {
    const res = await request(app).post("/api/auth/approve/u-1");
    expect([200]).toContain(res.status);
    expect(res.body).toHaveProperty("data.id");
  });
});
