import prisma from '../models/prismaClient';
import { sendAnnouncementEmail } from './emailService';

// Create a new announcement
export const createAnnouncement = async (data: {
  title: string;
  content: string;
  pinned?: boolean;
}) => {
  const announcement = await prisma.announcement.create({
    data: {
      title: data.title,
      content: data.content,
      pinned: data.pinned ?? false,
    },
  });

  // Send email notification to all users (fire-and-forget)
  prisma.user
    .findMany({
      select: { email: true },
    })
    .then((users) => {
      const emails = users.map((u) => u.email);
      if (emails.length > 0) {
        sendAnnouncementEmail(emails, data.title, data.content);
      }
    })
    .catch((err) => console.error("[Announcement Email Error]:", err));

  return announcement;
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
