"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const testApp_1 = __importDefault(require("../src/testApp"));
describe('Health', () => {
    it('returns 200', async () => {
        const res = await (0, supertest_1.default)(testApp_1.default).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('OK');
    });
});
//# sourceMappingURL=health.test.js.map