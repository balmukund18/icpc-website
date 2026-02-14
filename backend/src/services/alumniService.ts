import prisma from '../models/prismaClient';
import bcrypt from 'bcrypt';

// Register a new alumni (requires admin approval)
export const registerAlumni = async (email: string, payload: any) => {
  const hashed = await bcrypt.hash(payload.password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: 'ALUMNI',
      approved: false  // Require admin approval
    }
  });
  return user;
};

// List all approved alumni with their full profiles (for the alumni directory)
export const listAlumni = async () => {
  return prisma.user.findMany({
    where: { role: 'ALUMNI', approved: true },
    select: {
      id: true,
      email: true,
      createdAt: true,
      profile: {
        select: {
          name: true,
          branch: true,
          contact: true,
          handles: true,
          graduationYear: true,
          company: true,
          position: true,
          location: true,
          bio: true,
          linkedIn: true,
        }
      }
    }
  });
};
