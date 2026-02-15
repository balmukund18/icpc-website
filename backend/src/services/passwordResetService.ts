import crypto from "crypto";
import bcrypt from "bcrypt";
import prisma from "../models/prismaClient";
import { sendPasswordResetEmail } from "./emailService";

const RESET_TOKEN_EXPIRY_HOURS = 1;

export const requestPasswordReset = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user || !user.password) return;

    // Invalidate any existing tokens for this user
    await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true },
    });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(
        Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
    );

    await prisma.passwordResetToken.create({
        data: { userId: user.id, token: rawToken, expiresAt },
    });

    // Fetch profile name for email
    const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { name: true },
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail(email, profile?.name || "", resetUrl);
};

export const resetPassword = async (token: string, newPassword: string) => {
    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
    });

    if (!resetToken) throw new Error("Invalid or expired reset token");
    if (resetToken.used) throw new Error("This reset link has already been used");
    if (resetToken.expiresAt < new Date())
        throw new Error("This reset link has expired");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
        prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword },
        }),
        prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { used: true },
        }),
    ]);
};
