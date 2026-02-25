import api from "./axios";

// =====================
// TYPES
// =====================

export type BlogStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Author {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Comment {
  id: string;
  blogId: string;
  userId: string;
  content: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  tags: string[];
  status: BlogStatus;
  rejectionReason: string | null;
  authorId: string;
  author: Author;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number; likes: number };
}

export interface BlogListResponse {
  blogs: Blog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface TagsResponse {
  predefined: string[];
  custom: string[];
  all: string[];
}

export interface CreateBlogData {
  title: string;
  content: string;
  tags?: string[];
}

export interface UpdateBlogData {
  title?: string;
  content?: string;
  tags?: string[];
}

// =====================
// PUBLIC BLOG API
// =====================

/**
 * Get approved blogs with pagination and optional tag filter
 */
export async function getApprovedBlogs(
  page: number = 1,
  limit: number = 10,
  tag?: string
): Promise<BlogListResponse> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (tag) params.append("tag", tag);

  const response = await api.get(`/blogs?${params.toString()}`);
  return response.data.data || response.data;
}

/**
 * Get all available tags (predefined + custom)
 */
export async function getAllTags(): Promise<TagsResponse> {
  const response = await api.get("/blogs/tags");
  return response.data.data || response.data;
}

/**
 * Get a single blog by ID
 */
export async function getBlogById(id: string): Promise<Blog> {
  const response = await api.get(`/blogs/${id}`);
  return response.data.data || response.data;
}

// =====================
// USER BLOG API
// =====================

/**
 * Get current user's blogs (all statuses)
 */
export async function getMyBlogs(): Promise<Blog[]> {
  const response = await api.get("/blogs/my");
  return response.data.data || response.data;
}

/**
 * Create a new blog
 */
export async function createBlog(data: CreateBlogData): Promise<Blog> {
  const response = await api.post("/blogs", data);
  return response.data.data || response.data;
}

/**
 * Update a blog (only pending/rejected blogs can be updated)
 */
export async function updateBlog(
  id: string,
  data: UpdateBlogData
): Promise<Blog> {
  const response = await api.put(`/blogs/${id}`, data);
  return response.data.data || response.data;
}

/**
 * Delete a blog
 */
export async function deleteBlog(id: string): Promise<void> {
  await api.delete(`/blogs/${id}`);
}

// =====================
// COMMENT API
// =====================

/**
 * Add a comment to a blog
 */
export async function addComment(
  blogId: string,
  content: string
): Promise<Comment> {
  const response = await api.post(`/blogs/${blogId}/comments`, { content });
  return response.data.data || response.data;
}

/**
 * Edit a comment
 */
export async function editComment(
  blogId: string,
  commentId: string,
  content: string
): Promise<Comment> {
  const response = await api.put(`/blogs/${blogId}/comments/${commentId}`, {
    content,
  });
  return response.data.data || response.data;
}

/**
 * Delete a comment
 */
export async function deleteComment(
  blogId: string,
  commentId: string
): Promise<void> {
  await api.delete(`/blogs/${blogId}/comments/${commentId}`);
}

// =====================
// ADMIN API
// =====================

/**
 * Get pending blogs for admin review
 */
export async function getPendingBlogs(): Promise<Blog[]> {
  const response = await api.get("/blogs/pending");
  return response.data.data || response.data;
}

/**
 * Approve a blog
 */
export async function approveBlog(id: string): Promise<Blog> {
  const response = await api.post(`/blogs/${id}/approve`);
  return response.data.data || response.data;
}

/**
 * Reject a blog with optional reason
 */
export async function rejectBlog(id: string, reason?: string): Promise<Blog> {
  const response = await api.post(`/blogs/${id}/reject`, { reason });
  return response.data.data || response.data;
}

// =====================
// UPVOTE API
// =====================

/**
 * Toggle like on a blog (like/unlike)
 */
export async function toggleBlogLike(blogId: string): Promise<{ liked: boolean; count: number; userHasLiked: boolean }> {
  const response = await api.post(`/blogs/${blogId}/like`);
  return response.data.data || response.data;
}

/**
 * Get like status for a blog
 */
export async function getBlogLikeStatus(blogId: string): Promise<{ count: number; userHasLiked: boolean }> {
  const response = await api.get(`/blogs/${blogId}/like-status`);
  return response.data.data || response.data;
}
