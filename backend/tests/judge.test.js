"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const axios_mock_adapter_1 = __importDefault(require("axios-mock-adapter"));
const judgeService_1 = require("../src/services/judgeService");
describe("Judge0 service", () => {
    const mock = new axios_mock_adapter_1.default(axios_1.default);
    afterEach(() => mock.reset());
    it("submits code and returns token", async () => {
        mock.onPost(/submissions/).reply(201, { token: "abc123" });
        const res = await (0, judgeService_1.submitToJudge0)("print(1)", 71);
        expect(res).toHaveProperty("token");
        expect(res.token).toBe("abc123");
    });
    it("fetches result for token", async () => {
        mock
            .onGet(/submissions\/abc123/)
            .reply(200, { status: { description: "Accepted" }, stdout: "1" });
        const r = await (0, judgeService_1.getJudge0Result)("abc123");
        expect(r).toHaveProperty("status");
        expect(r.status.description).toBe("Accepted");
    });
});
//# sourceMappingURL=judge.test.js.map