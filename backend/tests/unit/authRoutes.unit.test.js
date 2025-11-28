"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock("../../src/services/authService", () => ({
    registerUser: jest.fn(async (email) => ({ id: "u-1", email })),
    login: jest.fn(async (email) => ({
        token: "t",
        user: { id: "u-1", email },
    })),
    approveUser: jest.fn(async (id) => ({ id, approved: true })),
}));
// Mock auth middleware to set a fake user
jest.mock("../../src/middleware/auth", () => ({
    isAuthenticated: (req, res, next) => {
        req.user = { id: "u-1", role: "ADMIN" };
        next();
    },
    isAdmin: (req, res, next) => next(),
}));
const supertest_1 = __importDefault(require("supertest"));
const testApp_1 = __importDefault(require("../../src/testApp"));
describe("Auth Routes (unit)", () => {
    test("POST /api/auth/register returns 201", async () => {
        const res = await (0, supertest_1.default)(testApp_1.default)
            .post("/api/auth/register")
            .send({ email: "x@local.com", password: "password" })
            .set("Accept", "application/json");
        expect([201, 200]).toContain(res.status);
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty("data");
    });
    test("POST /api/auth/login returns token", async () => {
        const res = await (0, supertest_1.default)(testApp_1.default)
            .post("/api/auth/login")
            .send({ email: "x@local", password: "password" })
            .set("Accept", "application/json");
        expect([200]).toContain(res.status);
        expect(res.body).toHaveProperty("data.token");
    });
    test("POST /api/auth/approve/:id allowed for admin", async () => {
        const res = await (0, supertest_1.default)(testApp_1.default).post("/api/auth/approve/u-1");
        expect([200]).toContain(res.status);
        expect(res.body).toHaveProperty("data.id");
    });
});
//# sourceMappingURL=authRoutes.unit.test.js.map