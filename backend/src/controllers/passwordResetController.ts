import { Request, Response } from "express";
import * as resetService from "../services/passwordResetService";
import { success, fail } from "../utils/response";

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return fail(res, "Email is required", 400);

        await resetService.requestPasswordReset(email);

        // Always return success to prevent email enumeration
        success(res, {
            message:
                "If an account exists with that email, a password reset link has been sent.",
        });
    } catch (err: any) {
        fail(res, err.message);
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;
        if (!token || !password)
            return fail(res, "Token and password are required", 400);
        if (password.length < 6)
            return fail(res, "Password must be at least 6 characters", 400);

        await resetService.resetPassword(token, password);
        success(res, { message: "Password has been reset successfully." });
    } catch (err: any) {
        fail(res, err.message, 400);
    }
};
