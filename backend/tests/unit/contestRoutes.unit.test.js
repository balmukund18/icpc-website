"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock("../../src/services/contestService", () => ({
    createContest: jest.fn(async (data) => ({ id: "c-1", ...data })),
    addProblem: jest.fn(async (id, p) => ({ id, problems: [p] })),
    getContestSubmissions: jest.fn(async (id) => []),
    getUserSubmissions: jest.fn(async (id) => []),
    getSubmissionById: jest.fn(async (id) => ({
        id,
        userId: "u-1",
        status: "PENDING",
    })),
}));
jest.mock("../../src/middleware/auth", () => ({
    isAuthenticated: (req, res, next) => {
        req.user = { id: "u-1", role: "ADMIN" };
        next();
    },
    isAdmin: (req, res, next) => next(),
}));
const supertest_1 = __importDefault(require("supertest"));
const testApp_1 = __importDefault(require("../../src/testApp"));
describe("Contest Routes (unit)", () => {
    test("POST /api/contests (admin) creates contest", async () => {
        const res = await (0, supertest_1.default)(testApp_1.default).post("/api/contests").send({ title: "T" });
        expect([201]).toContain(res.status);
        expect(res.body).toHaveProperty("data.id");
    });
    test("POST /api/contests/:id/problems adds problem", async () => {
        const res = await (0, supertest_1.default)(testApp_1.default)
            .post("/api/contests/c-1/problems")
            .send({ name: "P" });
        expect([200]).toContain(res.status);
    });
    test("GET /api/contests/submissions/:submissionId returns submission for owner/admin", async () => {
        const res = await (0, supertest_1.default)(testApp_1.default).get("/api/contests/submissions/s-1");
        expect([200]).toContain(res.status);
        expect(res.body).toHaveProperty("data.id");
    });
});
//# sourceMappingURL=contestRoutes.unit.test.js.map