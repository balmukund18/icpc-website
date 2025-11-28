"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const verifier_1 = require("../src/utils/verifier");
describe('Verifier stubs', () => {
    it('detects leetcode links', async () => {
        expect(await (0, verifier_1.verifyLeetCode)('https://leetcode.com/problems/1')).toBe(true);
    });
    it('detects codeforces links', async () => {
        expect(await (0, verifier_1.verifyCodeforces)('https://codeforces.com/problemset/problem/1/1')).toBe(true);
    });
    it('returns false for non-matching links', async () => {
        expect(await (0, verifier_1.verifyLeetCode)('https://example.com')).toBe(false);
        expect(await (0, verifier_1.verifyCodeforces)('https://example.com')).toBe(false);
    });
});
//# sourceMappingURL=verifier.test.js.map