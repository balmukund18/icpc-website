import { Request, Response } from 'express';
import * as blogService from '../services/blogService';
import { success, fail } from '../utils/response';

// =====================
// PUBLIC BLOG CONTROLLERS
// =====================

/**
 * GET /blogs - List approved blogs with pagination and tag filter
 */
export const listApproved = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const tag = req.query.tag as string | undefined;

    const result = await blogService.getApprovedBlogs(page, limit, tag || null);
    success(res, result);
  } catch (err: any) {
    fail(res, err.message);
  }
};

/**
 * GET /blogs/tags - Get all available tags
 */
export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await blogService.getAllTags();
    success(res, tags);
  } catch (err: any) {
    fail(res, err.message);
  }
};

/**
 * GET /blogs/:id - Get single blog by ID
 */
export const getById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';
    
    const blog = await blogService.getBlogById(id, userId, isAdmin);
    success(res, blog);
  } catch (err: any) {
    if (err.message === 'Blog not found') {
      fail(res, err.message, 404);
    } else {
      fail(res, err.message);
    }
  }
};

// =====================
// USER BLOG CONTROLLERS
// =====================

/**
 * GET /blogs/my - Get current user's blogs
 */
export const getMyBlogs = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const blogs = await blogService.getMyBlogs(userId);
    success(res, blogs);
  } catch (err: any) {
    fail(res, err.message);
  }
};

/**
 * POST /blogs - Create a new blog
 */
export const create = async (req: any, res: Response) => {
  try {
    const authorId = req.user.id;
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return fail(res, 'Title and content are required', 400);
    }

    const blog = await blogService.createBlog(authorId, {
      title,
      content,
      tags: tags || [],
    });

    success(res, blog, 201);
  } catch (err: any) {
    fail(res, err.message);
  }
};

/**
 * PUT /blogs/:id - Update a blog
 */
export const update = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, content, tags } = req.body;

    const blog = await blogService.updateBlog(id, userId, {
      title,
      content,
      tags,
    });

    success(res, blog);
  } catch (err: any) {
    if (err.message === 'Blog not found') {
      fail(res, err.message, 404);
    } else if (err.message.includes('Not authorized') || err.message.includes('Cannot edit')) {
      fail(res, err.message, 403);
    } else {
      fail(res, err.message);
    }
  }
};

/**
 * DELETE /blogs/:id - Delete a blog
 */
export const remove = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    await blogService.deleteBlog(id, userId, isAdmin);
    success(res, { message: 'Blog deleted successfully' });
  } catch (err: any) {
    if (err.message === 'Blog not found') {
      fail(res, err.message, 404);
    } else if (err.message.includes('Not authorized')) {
      fail(res, err.message, 403);
    } else {
      fail(res, err.message);
    }
  }
};

// =====================
// COMMENT CONTROLLERS
// =====================

/**
 * POST /blogs/:id/comments - Add a comment
 */
export const addComment = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content) {
      return fail(res, 'Comment content is required', 400);
    }

    const comment = await blogService.addComment(id, userId, content);
    success(res, comment, 201);
  } catch (err: any) {
    if (err.message === 'Blog not found') {
      fail(res, err.message, 404);
    } else if (err.message.includes('Cannot comment')) {
      fail(res, err.message, 403);
    } else {
      fail(res, err.message);
    }
  }
};

/**
 * PUT /blogs/:id/comments/:commentId - Edit a comment
 */
export const editComment = async (req: any, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content) {
      return fail(res, 'Comment content is required', 400);
    }

    const comment = await blogService.editComment(commentId, userId, content);
    success(res, comment);
  } catch (err: any) {
    if (err.message === 'Comment not found') {
      fail(res, err.message, 404);
    } else if (err.message.includes('Not authorized')) {
      fail(res, err.message, 403);
    } else {
      fail(res, err.message);
    }
  }
};

/**
 * DELETE /blogs/:id/comments/:commentId - Delete a comment
 */
export const deleteComment = async (req: any, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    await blogService.deleteComment(commentId, userId, isAdmin);
    success(res, { message: 'Comment deleted successfully' });
  } catch (err: any) {
    if (err.message === 'Comment not found') {
      fail(res, err.message, 404);
    } else if (err.message.includes('Not authorized')) {
      fail(res, err.message, 403);
    } else {
      fail(res, err.message);
    }
  }
};

// =====================
// ADMIN CONTROLLERS
// =====================

/**
 * GET /blogs/pending - List pending blogs for admin review
 */
export const listPending = async (req: Request, res: Response) => {
  try {
    const blogs = await blogService.getPendingBlogs();
    success(res, blogs);
  } catch (err: any) {
    fail(res, err.message);
  }
};

/**
 * POST /blogs/:id/approve - Approve a blog
 */
export const approve = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const blog = await blogService.approveBlog(id);
    success(res, blog);
  } catch (err: any) {
    if (err.message === 'Blog not found') {
      fail(res, err.message, 404);
    } else {
      fail(res, err.message);
    }
  }
};

/**
 * POST /blogs/:id/reject - Reject a blog
 */
export const reject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const blog = await blogService.rejectBlog(id, reason);
    success(res, blog);
  } catch (err: any) {
    if (err.message === 'Blog not found') {
      fail(res, err.message, 404);
    } else {
      fail(res, err.message);
    }
  }
};
