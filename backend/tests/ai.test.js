"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aiService_1 = require("../src/services/aiService");
describe('AI service', () => {
    it('returns placeholder when no API key', async () => {
        const res = await (0, aiService_1.chat)('Hello');
        expect(res).toHaveProperty('reply');
        expect(typeof res.reply).toBe('string');
    });
});
//# sourceMappingURL=ai.test.js.map