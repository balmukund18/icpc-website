import prisma from '../models/prismaClient';
import { BlogStatus } from '@prisma/client';

// Predefined tags for blogs
export const PREDEFINED_TAGS = [
  // DSA Topics
  'Arrays',
  'Strings',
  'Linked Lists',
  'Stacks',
  'Queues',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Greedy',
  'Backtracking',
  'Binary Search',
  'Sorting',
  'Hashing',
  'Recursion',
  'Bit Manipulation',
  // CP Platforms
  'Codeforces',
  'LeetCode',
  'CodeChef',
  'AtCoder',
  // ICPC Related
  'ICPC',
  'Regional',
  'Problem Solving',
  'Contest Strategy',
  // General
  'Tutorial',
  'Experience',
  'Tips & Tricks',
  'Interview Prep',
  'Beginner Friendly',
];

// Author include for consistent responses
const authorInclude = {
  author: {
    select: {
      id: true,
      email: true,
      role: true,
      profile: {
        select: {
          name: true,
        },
      },
    },
  },
};

// Comment include with user info
const commentsInclude = {
  comments: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          profile: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
};

// =====================
// TRANSFORM HELPERS
// =====================

/**
 * Transform author data to flatten profile.name to name
 */
const transformAuthor = (author: any) => ({
  id: author.id,
  email: author.email,
  role: author.role,
  name: author.profile?.name || author.email.split('@')[0],
});

/**
 * Transform comment user data
 */
const transformCommentUser = (user: any) => ({
  id: user.id,
  email: user.email,
  name: user.profile?.name || user.email.split('@')[0],
});

/**
 * Transform blog response to match frontend expectations
 */
const transformBlogResponse = (blog: any) => ({
  ...blog,
  author: transformAuthor(blog.author),
  comments: blog.comments?.map((comment: any) => ({
    ...comment,
    user: transformCommentUser(comment.user),
  })) || [],
});

// =====================
// PUBLIC BLOG METHODS
// =====================

/**
 * Get all approved blogs with pagination and optional tag filter
 */
export const getApprovedBlogs = async (
  page: number = 1,
  limit: number = 10,
  tag?: string | null
) => {
  const skip = (page - 1) * limit;
  
  const where: any = {
    status: BlogStatus.APPROVED,
  };
  
  if (tag) {
    where.tags = {
      has: tag,
    };
  }

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      include: {
        ...authorInclude,
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.blog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    blogs: blogs.map(transformBlogResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: skip + blogs.length < total,
    },
  };
};

/**
 * Get a single blog by ID
 * - If approved: anyone can view
 * - If not approved: only author or admin can view
 */
export const getBlogById = async (id: string, userId?: string, isAdmin: boolean = false) => {
  const blog = await prisma.blog.findUnique({
    where: { id },
    include: {
      ...authorInclude,
      ...commentsInclude,
      _count: {
        select: { comments: true },
      },
    },
  });

  if (!blog) {
    throw new Error('Blog not found');
  }

  // If not approved, only author or admin can view
  if (blog.status !== BlogStatus.APPROVED && blog.authorId !== userId && !isAdmin) {
    throw new Error('Blog not found');
  }

  return transformBlogResponse(blog);
};

/**
 * Get all unique tags (predefined + custom used tags)
 */
export const getAllTags = async () => {
  const blogs = await prisma.blog.findMany({
    where: { status: BlogStatus.APPROVED },
    select: { tags: true },
  });

  // Collect all unique tags from blogs
  const usedTags = new Set<string>();
  blogs.forEach((blog) => {
    blog.tags.forEach((tag) => usedTags.add(tag));
  });

  // Merge predefined with used tags, remove duplicates
  const allTags = [...new Set([...PREDEFINED_TAGS, ...usedTags])];
  
  return {
    predefined: PREDEFINED_TAGS,
    all: allTags.sort(),
  };
};

// =====================
// USER BLOG METHODS
// =====================

/**
 * Get current user's blogs (all statuses)
 */
export const getMyBlogs = async (userId: string) => {
  const blogs = await prisma.blog.findMany({
    where: { authorId: userId },
    include: {
      ...authorInclude,
      _count: {
        select: { comments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return blogs.map(transformBlogResponse);
};

/**
 * Create a new blog (status: PENDING)
 */
export const createBlog = async (
  authorId: string,
  data: { title: string; content: string; tags: string[] }
) => {
  const blog = await prisma.blog.create({
    data: {
      authorId,
      title: data.title,
      content: data.content,
      tags: data.tags,
      status: BlogStatus.PENDING,
    },
    include: authorInclude,
  });
  return transformBlogResponse(blog);
};

/**
 * Update a blog (only if PENDING or REJECTED, author only)
 * If REJECTED, resets to PENDING for re-review
 */
export const updateBlog = async (
  id: string,
  userId: string,
  data: { title?: string; content?: string; tags?: string[] }
) => {
  const existingBlog = await prisma.blog.findUnique({
    where: { id },
  });

  if (!existingBlog) {
    throw new Error('Blog not found');
  }

  if (existingBlog.authorId !== userId) {
    throw new Error('Not authorized to edit this blog');
  }

  if (existingBlog.status === BlogStatus.APPROVED) {
    throw new Error('Cannot edit an approved blog');
  }

  // If rejected, resubmitting resets to pending
  const newStatus = existingBlog.status === BlogStatus.REJECTED ? BlogStatus.PENDING : existingBlog.status;

  const blog = await prisma.blog.update({
    where: { id },
    data: {
      ...data,
      status: newStatus,
      rejectionReason: newStatus === BlogStatus.PENDING ? null : existingBlog.rejectionReason,
    },
    include: authorInclude,
  });
  return transformBlogResponse(blog);
};

/**
 * Delete a blog (author or admin)
 */
export const deleteBlog = async (id: string, userId: string, isAdmin: boolean) => {
  const blog = await prisma.blog.findUnique({
    where: { id },
  });

  if (!blog) {
    throw new Error('Blog not found');
  }

  if (blog.authorId !== userId && !isAdmin) {
    throw new Error('Not authorized to delete this blog');
  }

  return prisma.blog.delete({
    where: { id },
  });
};

// =====================
// COMMENT METHODS
// =====================

/**
 * Add a comment to an approved blog
 */
export const addComment = async (blogId: string, userId: string, content: string) => {
  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
  });

  if (!blog) {
    throw new Error('Blog not found');
  }

  if (blog.status !== BlogStatus.APPROVED) {
    throw new Error('Cannot comment on unapproved blogs');
  }

  const comment = await prisma.comment.create({
    data: {
      blogId,
      userId,
      content,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          profile: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
  
  return {
    ...comment,
    user: transformCommentUser(comment.user),
  };
};

/**
 * Edit a comment (own comment only, sets isEdited: true)
 */
export const editComment = async (
  commentId: string,
  userId: string,
  content: string
) => {
  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!existingComment) {
    throw new Error('Comment not found');
  }

  if (existingComment.userId !== userId) {
    throw new Error('Not authorized to edit this comment');
  }

  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: {
      content,
      isEdited: true,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          profile: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return {
    ...comment,
    user: transformCommentUser(comment.user),
  };
};

/**
 * Delete a comment (own comment or admin)
 */
export const deleteComment = async (
  commentId: string,
  userId: string,
  isAdmin: boolean
) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  if (comment.userId !== userId && !isAdmin) {
    throw new Error('Not authorized to delete this comment');
  }

  return prisma.comment.delete({
    where: { id: commentId },
  });
};

// =====================
// ADMIN METHODS
// =====================

/**
 * Get all pending blogs for admin review
 */
export const getPendingBlogs = async () => {
  const blogs = await prisma.blog.findMany({
    where: { status: BlogStatus.PENDING },
    include: authorInclude,
    orderBy: { createdAt: 'asc' }, // Oldest first for fair review
  });
  return blogs.map(transformBlogResponse);
};

/**
 * Approve a blog
 */
export const approveBlog = async (id: string) => {
  const existingBlog = await prisma.blog.findUnique({
    where: { id },
  });

  if (!existingBlog) {
    throw new Error('Blog not found');
  }

  const blog = await prisma.blog.update({
    where: { id },
    data: {
      status: BlogStatus.APPROVED,
      rejectionReason: null,
    },
    include: authorInclude,
  });
  return transformBlogResponse(blog);
};

/**
 * Reject a blog with optional reason
 */
export const rejectBlog = async (id: string, reason?: string) => {
  const existingBlog = await prisma.blog.findUnique({
    where: { id },
  });

  if (!existingBlog) {
    throw new Error('Blog not found');
  }

  const blog = await prisma.blog.update({
    where: { id },
    data: {
      status: BlogStatus.REJECTED,
      rejectionReason: reason || null,
    },
    include: authorInclude,
  });
  return transformBlogResponse(blog);
};
