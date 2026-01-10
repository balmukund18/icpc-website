import { Request, Response } from 'express';
import * as announcementService from '../services/announcementService';
import { success, fail } from '../utils/response';

// Create a new announcement (Admin only)
export const create = async (req: Request, res: Response) => {
  try {
    const { title, content, pinned } = req.body;
    
    if (!title || !content) {
      return fail(res, 'Title and content are required', 400);
    }
    
    const announcement = await announcementService.createAnnouncement({
      title,
      content,
      pinned: pinned ?? false,
    });
    success(res, announcement, 201);
  } catch (err: any) {
    fail(res, err.message);
  }
};

// List all announcements (Public)
export const listAll = async (req: Request, res: Response) => {
  try {
    const announcements = await announcementService.listAnnouncements();
    success(res, announcements);
  } catch (err: any) {
    fail(res, err.message);
  }
};

// Update an announcement (Admin only)
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, pinned } = req.body;
    
    const updateData: { title?: string; content?: string; pinned?: boolean } = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (pinned !== undefined) updateData.pinned = pinned;
    
    const announcement = await announcementService.updateAnnouncement(id, updateData);
    success(res, announcement);
  } catch (err: any) {
    fail(res, err.message, 400);
  }
};

// Delete an announcement (Admin only)
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await announcementService.deleteAnnouncement(id);
    success(res, { message: 'Announcement deleted successfully' });
  } catch (err: any) {
    fail(res, err.message, 400);
  }
};
