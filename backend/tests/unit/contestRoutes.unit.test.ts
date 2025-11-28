jest.mock("../../src/services/contestService", () => ({
  createContest: jest.fn(async (data: any) => ({ id: "c-1", ...data })),
  addProblem: jest.fn(async (id: string, p: any) => ({ id, problems: [p] })),
  getContestSubmissions: jest.fn(async (id: string) => []),
  getUserSubmissions: jest.fn(async (id: string) => []),
  getSubmissionById: jest.fn(async (id: string) => ({
    id,
    userId: "u-1",
    status: "PENDING",
  })),
}));

jest.mock("../../src/middleware/auth", () => ({
  isAuthenticated: (req: any, res: any, next: any) => {
    req.user = { id: "u-1", role: "ADMIN" };
    next();
  },
  isAdmin: (req: any, res: any, next: any) => next(),
}));

import request from "supertest";
import app from "../../src/testApp";

describe("Contest Routes (unit)", () => {
  test("POST /api/contests (admin) creates contest", async () => {
    const res = await request(app).post("/api/contests").send({ title: "T" });
    expect([201]).toContain(res.status);
    expect(res.body).toHaveProperty("data.id");
  });

  test("POST /api/contests/:id/problems adds problem", async () => {
    const res = await request(app)
      .post("/api/contests/c-1/problems")
      .send({ name: "P" });
    expect([200]).toContain(res.status);
  });

  test("GET /api/contests/submissions/:submissionId returns submission for owner/admin", async () => {
    const res = await request(app).get("/api/contests/submissions/s-1");
    expect([200]).toContain(res.status);
    expect(res.body).toHaveProperty("data.id");
  });
});
