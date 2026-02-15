import prisma from "../models/prismaClient";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in environment");
}

export const registerUser = async (
  email: string,
  password: string,
  role: string = "STUDENT"
) => {
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashed, role: role as any },
  });
  return user;
};



export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,

      createdAt: true,
      profile: {
        select: {
          name: true,
          branch: true,
          year: true,
          contact: true,
          handles: true,
          graduationYear: true,
          company: true,
          position: true,
          location: true,
          bio: true,
          linkedIn: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};





export const updateUserRole = async (userId: string, role: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { role: role as any },
    select: {
      id: true,
      email: true,
      role: true,

    },
  });
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Check if user has a password (OAuth users don't)
  if (!user.password) {
    throw new Error(
      "This account was created with Google OAuth. Please use Google Sign-In to login."
    );
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new Error("Invalid credentials");
  }
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });
  return { token, user };
};

export const deleteUser = async (userId: string, requestingUserId: string) => {
  // Prevent self-deletion
  if (userId === requestingUserId) {
    throw new Error("Cannot delete your own account");
  }

  // Check if target user exists and get their role
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  // Prevent deleting admin users
  if (targetUser.role === "ADMIN") {
    throw new Error("Cannot delete admin users");
  }

  // Delete user (cascades will handle Profile, Submissions, ContestSubmissions, Blogs)
  await prisma.user.delete({
    where: { id: userId },
  });

  return { message: `User ${targetUser.email} deleted successfully` };
};
