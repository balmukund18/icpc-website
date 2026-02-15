import prisma from '../models/prismaClient';
import { validateHandles } from '../utils/handleValidator';
import { validateProfileFields } from '../utils/profileFieldValidator';

export const upsertProfile = async (userId: string, payload: any, isAdmin: boolean = false) => {
  const existing = await prisma.profile.findUnique({ where: { userId } });

  // Validate handles for duplicates
  if (payload.handles) {
    const handleErrors = await validateHandles(payload.handles, userId);
    if (handleErrors.length > 0) {
      throw new Error(handleErrors.join('; '));
    }
  }

  // Validate profile fields (contact, linkedIn) for duplicates
  const profileErrors = await validateProfileFields(
    { contact: payload.contact, linkedIn: payload.linkedIn },
    userId
  );
  if (profileErrors.length > 0) {
    throw new Error(profileErrors.join('; '));
  }

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
  
  // Validate handles for duplicates
  const validationErrors = await validateHandles(handles, userId);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join('; '));
  }
  
  return prisma.profile.update({
    where: { id: profile.id },
    data: { handles },
  });
};
