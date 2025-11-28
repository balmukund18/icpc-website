import request from "supertest";
import app from "../../src/testApp";

describe("Health endpoint", () => {
  test("GET /api/health returns 200", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "OK");
  });
});
