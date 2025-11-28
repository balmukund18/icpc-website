"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const testApp_1 = __importDefault(require("../../src/testApp"));
// Integration test template for auth flows.
// These tests will be skipped if `DATABASE_URL_TEST` is not set in environment.
const TEST_DB = process.env.DATABASE_URL_TEST;
describe('Auth integration (template)', () => {
    if (!TEST_DB) {
        it('skips integration tests when DATABASE_URL_TEST not configured', () => {
            expect(true).toBe(true);
        });
        return;
    }
    it('register -> login flow', async () => {
        const email = `testuser+${Date.now()}@example.com`;
        const password = 'testpass123';
        const agent = (0, supertest_1.default)(testApp_1.default);
        const reg = await agent.post('/api/auth/register').send({ email, password });
        expect([201, 200]).toContain(reg.status);
        // In this system admin approval is required; seed script should create an admin to approve.
        // For full integration, create user via prisma directly or approve manually.
    });
});
//# sourceMappingURL=auth.int.test.js.map