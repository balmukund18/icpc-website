"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTestEnv = loadTestEnv;
exports.createPrismaForTest = createPrismaForTest;
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
// This file is a helper to prepare the test DB connection.
// It is not executed automatically. Use it in your integration tests to connect to DATABASE_URL_TEST.
function loadTestEnv() {
    dotenv_1.default.config({ path: '.env.test' });
}
function createPrismaForTest() {
    const prisma = new client_1.PrismaClient();
    return prisma;
}
// Instructions:
// 1. Copy `.env.test.example` to `.env.test` and update DATABASE_URL_TEST.
// 2. Run migrations against the test DB: `npx prisma migrate deploy --schema=./prisma/schema.prisma`
// 3. Run tests: `npm test`
//# sourceMappingURL=setup.js.map