import prisma from '../models/prismaClient';

// Create a new announcement
export const createAnnouncement = async (data: {
  title: string;
  content: string;
  pinned?: boolean;
}) => {
  return prisma.announcement.create({
    data: {
      title: data.title,
      content: data.content,
      pinned: data.pinned ?? false,
    },
  });
};

// List all announcements (pinned first, then newest)
export const listAnnouncements = async () => {
  return prisma.announcement.findMany({
    orderBy: [
      { pinned: 'desc' },
      { createdAt: 'desc' },
    ],
  });
};

// Update an announcement
export const updateAnnouncement = async (
  id: string,
  data: {
    title?: string;
    content?: string;
    pinned?: boolean;
  }
) => {
  return prisma.announcement.update({
    where: { id },
    data,
  });
};

// Delete an announcement
export const deleteAnnouncement = async (id: string) => {
  return prisma.announcement.delete({
    where: { id },
  });
};
