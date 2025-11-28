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
jest.mock("../../src/models/prismaClient", () => ({
    __esModule: true,
    default: {
        user: {
            create: jest.fn(async (data) => ({ id: "u-1", ...data.data })),
            findUnique: jest.fn(async (args) => {
                if (args.where.email === "exists@local")
                    return {
                        id: "u-2",
                        email: "exists@local",
                        password: "$2b$10$abc",
                        approved: true,
                    };
                return null;
            }),
            update: jest.fn(async (args) => ({
                id: args.where.id,
                ...args.data,
            })),
        },
    },
}));
const authService = __importStar(require("../../src/services/authService"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
describe("AuthService (unit - mocked prisma)", () => {
    beforeAll(() => {
        bcrypt_1.default.hash.mockResolvedValue("hashedpw");
        bcrypt_1.default.compare.mockResolvedValue(true);
        jsonwebtoken_1.default.sign.mockReturnValue("jwt-token");
    });
    test("registerUser calls prisma.create and returns user", async () => {
        const u = await authService.registerUser("new@local", "password");
        expect(u).toBeDefined();
        expect(u.email).toBe("new@local");
    });
    test("login throws on missing user", async () => {
        await expect(authService.login("nope@local", "x")).rejects.toThrow();
    });
    test("login returns token for existing user", async () => {
        // findUnique mocked to return user for 'exists@local'
        const res = await authService.login("exists@local", "password");
        expect(res).toBeDefined();
        expect(res.token).toBe("jwt-token");
    });
});
//# sourceMappingURL=authService.unit.test.js.map