"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const axios_mock_adapter_1 = __importDefault(require("axios-mock-adapter"));
const prismaClient_1 = __importDefault(require("../src/models/prismaClient"));
const contestJudge = __importStar(require("../src/services/contestJudgeService"));
// Note: these tests interact with the database defined in backend/.env.
// Ensure the DB is running and migrations have been applied before running tests.
describe("Contest judge flow (unit)", () => {
    const mock = new axios_mock_adapter_1.default(axios_1.default);
    beforeAll(async () => {
        // create a sample contest and user to reference
        await prismaClient_1.default.user.upsert({
            where: { email: "test-user@local" },
            update: {},
            create: { email: "test-user@local", password: "x", approved: true },
        });
        await prismaClient_1.default.contest.createMany({
            data: [{ title: "Test Contest", problems: JSON.stringify([]) }],
            skipDuplicates: true,
        });
    });
    afterAll(async () => {
        // cleanup contest submissions created by tests
        await prismaClient_1.default.contestSubmission.deleteMany({ where: {} });
        await prismaClient_1.default.contest.deleteMany({ where: { title: "Test Contest" } });
        await prismaClient_1.default.user.deleteMany({ where: { email: "test-user@local" } });
        await prismaClient_1.default.$disconnect();
        mock.restore();
    });
    it("creates a contest submission and updates it after judge result", async () => {
        // Mock submitToJudge0 to return a token
        const fakeToken = "fake-token-123";
        mock.onPost(/submissions/).reply(200, { token: fakeToken });
        // Mock get to return a finished result
        const finishedResult = {
            status: { id: 3, description: "Accepted" },
            stdout: "OK",
        };
        mock
            .onGet(new RegExp(`/submissions/${fakeToken}`))
            .reply(200, finishedResult);
        // find test user and contest
        const user = await prismaClient_1.default.user.findUnique({
            where: { email: "test-user@local" },
        });
        const contest = await prismaClient_1.default.contest.findFirst({
            where: { title: "Test Contest" },
        });
        expect(user).toBeTruthy();
        expect(contest).toBeTruthy();
        // Submit
        const submission = await contestJudge.submitContestCode(contest.id, 0, user.id, 'print("hello")', 71);
        expect(submission).toBeDefined();
        expect(submission.status).toBe("PENDING");
        // Call poller (it should pick up the pending submission and update it)
        await contestJudge.pollPendingSubmissions();
        const updated = await prismaClient_1.default.contestSubmission.findUnique({
            where: { id: submission.id },
        });
        expect(updated).toBeDefined();
        expect(updated.status).toBeDefined();
        // result object should have been stored
        expect(updated.result).toBeTruthy();
    }, 20000);
});
//# sourceMappingURL=contestJudge.test.js.map