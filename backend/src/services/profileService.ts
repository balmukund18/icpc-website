import prisma from '../models/prismaClient';

export const upsertProfile = async (userId: string, payload: any, isAdmin: boolean = false) => {
  const existing = await prisma.profile.findUnique({ where: { userId } });

  // Lock LeetCode handle: once set, only admin can change it
  if (existing && !isAdmin && payload.handles) {
    const existingHandles = (existing.handles as Record<string, string>) || {};
    if (existingHandles.leetcode) {
      // Preserve the existing leetcode handle, ignore what user sent
      payload.handles = { ...payload.handles, leetcode: existingHandles.leetcode };
    }
  }

  if (existing) {
    return prisma.profile.update({ where: { id: existing.id }, data: payload });
  }
  return prisma.profile.create({ data: { ...payload, userId } });
};

export const getProfile = async (userId: string) => {
  return prisma.profile.findUnique({ where: { userId } });
};

// Admin-only: update any user's CP handles
export const adminUpdateUserHandles = async (userId: string, handles: Record<string, string>) => {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    throw new Error("User profile not found");
  }
  return prisma.profile.update({
    where: { id: profile.id },
    data: { handles },
  });
};
