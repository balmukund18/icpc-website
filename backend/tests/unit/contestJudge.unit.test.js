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
const axios_mock_adapter_1 = __importDefault(require("axios-mock-adapter"));
const axios_1 = __importDefault(require("axios"));
// Mock the prisma client module
jest.mock("../../src/models/prismaClient", () => {
    return {
        __esModule: true,
        default: {
            contestSubmission: {
                create: jest.fn(async (data) => ({ id: "sub-1", ...data.data })),
                findMany: jest.fn(async () => []),
                update: jest.fn(async (args) => ({
                    id: args.where.id,
                    ...args.data,
                })),
            },
            contest: {
                findUnique: jest.fn(async () => ({ id: "contest-1", results: [] })),
                update: jest.fn(async (args) => ({
                    id: args.where.id,
                    ...args.data,
                })),
            },
            user: {
                findUnique: jest.fn(async () => ({
                    id: "user-1",
                    email: "test@local",
                })),
            },
        },
    };
});
jest.mock("../../src/services/judgeService", () => ({
    submitToJudge0: jest.fn(async () => ({ token: "fake-token" })),
    getJudge0Result: jest.fn(async () => ({
        status: { id: 3, description: "Accepted" },
        stdout: "OK",
    })),
}));
const contestJudge = __importStar(require("../../src/services/contestJudgeService"));
const prismaClient_1 = __importDefault(require("../../src/models/prismaClient"));
describe("ContestJudgeService (unit - mocked prisma & judge)", () => {
    let mock;
    beforeAll(() => {
        mock = new axios_mock_adapter_1.default(axios_1.default);
    });
    afterAll(() => {
        mock.restore();
    });
    test("submitContestCode creates a contestSubmission", async () => {
        const sub = await contestJudge.submitContestCode("contest-1", 0, "user-1", "print(1)", 71);
        expect(sub).toBeDefined();
        expect(prismaClient_1.default.contestSubmission.create.mock.calls.length).toBeGreaterThan(0);
        expect(sub.status).toBe("PENDING");
    });
    test("pollPendingSubmissions updates submission with judge result", async () => {
        // prepare a fake pending return from findMany
        prismaClient_1.default.contestSubmission.findMany.mockResolvedValueOnce([
            {
                id: "sub-1",
                contestId: "contest-1",
                token: "fake-token",
                userId: "user-1",
                problemIdx: 0,
                status: "PENDING",
            },
        ]);
        await contestJudge.pollPendingSubmissions();
        expect(prismaClient_1.default.contestSubmission.update.mock.calls.length).toBeGreaterThan(0);
        expect(prismaClient_1.default.contest.update.mock.calls.length).toBeGreaterThan(0);
    });
});
//# sourceMappingURL=contestJudge.unit.test.js.map