import { create } from "zustand";
import * as blogService from "@/lib/blogService";
import type {
  Blog,
  Comment,
  TagsResponse,
  CreateBlogData,
  UpdateBlogData,
} from "@/lib/blogService";

interface BlogState {
  // Blog listing
  blogs: Blog[];
  blogsLoading: boolean;
  blogsError: string | null;
  currentPage: number;
  totalPages: number;
  hasMoreBlogs: boolean;
  selectedTag: string | null;

  // Single blog
  currentBlog: Blog | null;
  currentBlogLoading: boolean;
  currentBlogError: string | null;

  // My blogs
  myBlogs: Blog[];
  myBlogsLoading: boolean;
  myBlogsError: string | null;

  // Pending blogs (admin)
  pendingBlogs: Blog[];
  pendingBlogsLoading: boolean;
  pendingBlogsError: string | null;

  // Tags
  tags: TagsResponse | null;
  tagsLoading: boolean;

  // Actions - Blog listing
  fetchBlogs: (page?: number, tag?: string | null) => Promise<void>;
  loadMoreBlogs: () => Promise<void>;
  setSelectedTag: (tag: string | null) => void;
  resetBlogs: () => void;

  // Actions - Single blog
  fetchBlog: (id: string) => Promise<void>;
  clearCurrentBlog: () => void;

  // Actions - My blogs
  fetchMyBlogs: () => Promise<void>;

  // Actions - CRUD
  createBlog: (data: CreateBlogData) => Promise<Blog>;
  updateBlog: (id: string, data: UpdateBlogData) => Promise<Blog>;
  deleteBlog: (id: string) => Promise<void>;

  // Actions - Comments
  addComment: (blogId: string, content: string) => Promise<Comment>;
  editComment: (
    blogId: string,
    commentId: string,
    content: string
  ) => Promise<Comment>;
  deleteComment: (blogId: string, commentId: string) => Promise<void>;

  // Actions - Admin
  fetchPendingBlogs: () => Promise<void>;
  approveBlog: (id: string) => Promise<void>;
  rejectBlog: (id: string, reason?: string) => Promise<void>;

  // Actions - Tags
  fetchTags: () => Promise<void>;
}

export const useBlogStore = create<BlogState>()((set, get) => ({
  // Initial state - Blog listing
  blogs: [],
  blogsLoading: false,
  blogsError: null,
  currentPage: 1,
  totalPages: 1,
  hasMoreBlogs: false,
  selectedTag: null,

  // Initial state - Single blog
  currentBlog: null,
  currentBlogLoading: false,
  currentBlogError: null,

  // Initial state - My blogs
  myBlogs: [],
  myBlogsLoading: false,
  myBlogsError: null,

  // Initial state - Pending blogs
  pendingBlogs: [],
  pendingBlogsLoading: false,
  pendingBlogsError: null,

  // Initial state - Tags
  tags: null,
  tagsLoading: false,

  // =====================
  // BLOG LISTING ACTIONS
  // =====================

  fetchBlogs: async (page = 1, tag = null) => {
    set({ blogsLoading: true, blogsError: null });
    try {
      const result = await blogService.getApprovedBlogs(
        page,
        10,
        tag || undefined
      );
      set({
        blogs: page === 1 ? result.blogs : [...get().blogs, ...result.blogs],
        currentPage: result.pagination.page,
        totalPages: result.pagination.totalPages,
        hasMoreBlogs: result.pagination.hasMore,
        selectedTag: tag,
        blogsLoading: false,
      });
    } catch (error: any) {
      set({
        blogsError: error.response?.data?.message || "Failed to fetch blogs",
        blogsLoading: false,
      });
    }
  },

  loadMoreBlogs: async () => {
    const { currentPage, hasMoreBlogs, selectedTag, blogsLoading } = get();
    if (!hasMoreBlogs || blogsLoading) return;
    await get().fetchBlogs(currentPage + 1, selectedTag);
  },

  setSelectedTag: (tag) => {
    set({ selectedTag: tag, blogs: [], currentPage: 1 });
    get().fetchBlogs(1, tag);
  },

  resetBlogs: () => {
    set({
      blogs: [],
      currentPage: 1,
      totalPages: 1,
      hasMoreBlogs: false,
      selectedTag: null,
      blogsError: null,
    });
  },

  // =====================
  // SINGLE BLOG ACTIONS
  // =====================

  fetchBlog: async (id) => {
    set({ currentBlogLoading: true, currentBlogError: null });
    try {
      const blog = await blogService.getBlogById(id);
      set({ currentBlog: blog, currentBlogLoading: false });
    } catch (error: any) {
      set({
        currentBlogError:
          error.response?.data?.message || "Failed to fetch blog",
        currentBlogLoading: false,
      });
    }
  },

  clearCurrentBlog: () => {
    set({ currentBlog: null, currentBlogError: null });
  },

  // =====================
  // MY BLOGS ACTIONS
  // =====================

  fetchMyBlogs: async () => {
    set({ myBlogsLoading: true, myBlogsError: null });
    try {
      const blogs = await blogService.getMyBlogs();
      set({ myBlogs: blogs, myBlogsLoading: false });
    } catch (error: any) {
      set({
        myBlogsError:
          error.response?.data?.message || "Failed to fetch your blogs",
        myBlogsLoading: false,
      });
    }
  },

  // =====================
  // CRUD ACTIONS
  // =====================

  createBlog: async (data) => {
    const blog = await blogService.createBlog(data);
    // Add to myBlogs list
    set({ myBlogs: [blog, ...get().myBlogs] });
    return blog;
  },

  updateBlog: async (id, data) => {
    const updatedBlog = await blogService.updateBlog(id, data);
    // Update in myBlogs list
    set({
      myBlogs: get().myBlogs.map((b) => (b.id === id ? updatedBlog : b)),
      currentBlog:
        get().currentBlog?.id === id ? updatedBlog : get().currentBlog,
    });
    return updatedBlog;
  },

  deleteBlog: async (id) => {
    await blogService.deleteBlog(id);
    // Remove from all lists
    set({
      myBlogs: get().myBlogs.filter((b) => b.id !== id),
      blogs: get().blogs.filter((b) => b.id !== id),
      pendingBlogs: get().pendingBlogs.filter((b) => b.id !== id),
      currentBlog: get().currentBlog?.id === id ? null : get().currentBlog,
    });
  },

  // =====================
  // COMMENT ACTIONS
  // =====================

  addComment: async (blogId, content) => {
    const comment = await blogService.addComment(blogId, content);
    // Add comment to current blog if viewing
    if (get().currentBlog?.id === blogId) {
      set({
        currentBlog: {
          ...get().currentBlog!,
          comments: [...get().currentBlog!.comments, comment],
        },
      });
    }
    return comment;
  },

  editComment: async (blogId, commentId, content) => {
    const updatedComment = await blogService.editComment(
      blogId,
      commentId,
      content
    );
    // Update comment in current blog if viewing
    if (get().currentBlog?.id === blogId) {
      set({
        currentBlog: {
          ...get().currentBlog!,
          comments: get().currentBlog!.comments.map((c) =>
            c.id === commentId ? updatedComment : c
          ),
        },
      });
    }
    return updatedComment;
  },

  deleteComment: async (blogId, commentId) => {
    await blogService.deleteComment(blogId, commentId);
    // Remove comment from current blog if viewing
    if (get().currentBlog?.id === blogId) {
      set({
        currentBlog: {
          ...get().currentBlog!,
          comments: get().currentBlog!.comments.filter(
            (c) => c.id !== commentId
          ),
        },
      });
    }
  },

  // =====================
  // ADMIN ACTIONS
  // =====================

  fetchPendingBlogs: async () => {
    set({ pendingBlogsLoading: true, pendingBlogsError: null });
    try {
      const blogs = await blogService.getPendingBlogs();
      set({ pendingBlogs: blogs, pendingBlogsLoading: false });
    } catch (error: any) {
      set({
        pendingBlogsError:
          error.response?.data?.message || "Failed to fetch pending blogs",
        pendingBlogsLoading: false,
      });
    }
  },

  approveBlog: async (id) => {
    await blogService.approveBlog(id);
    // Remove from pending list
    set({
      pendingBlogs: get().pendingBlogs.filter((b) => b.id !== id),
    });
  },

  rejectBlog: async (id, reason) => {
    await blogService.rejectBlog(id, reason);
    // Remove from pending list
    set({
      pendingBlogs: get().pendingBlogs.filter((b) => b.id !== id),
    });
  },

  // =====================
  // TAGS ACTIONS
  // =====================

  fetchTags: async () => {
    set({ tagsLoading: true });
    try {
      const tags = await blogService.getAllTags();
      set({ tags, tagsLoading: false });
    } catch (error) {
      set({ tagsLoading: false });
    }
  },
}));
