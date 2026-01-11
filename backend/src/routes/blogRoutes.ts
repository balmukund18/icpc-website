import { Router } from 'express';
import * as ctrl from '../controllers/blogController';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate';

const router = Router();

// =====================
// VALIDATION SCHEMAS
// =====================

const createBlogValidation = [
  body('title')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be at most 200 characters'),
  body('content')
    .isString()
    .notEmpty()
    .withMessage('Content is required'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Each tag must be a non-empty string'),
];

const updateBlogValidation = [
  param('id').isString().notEmpty().withMessage('Blog ID is required'),
  body('title')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title must be at most 200 characters'),
  body('content')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Content cannot be empty'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Each tag must be a non-empty string'),
];

const commentValidation = [
  param('id').isString().notEmpty().withMessage('Blog ID is required'),
  body('content')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 2000 })
    .withMessage('Comment must be at most 2000 characters'),
];

const editCommentValidation = [
  param('id').isString().notEmpty().withMessage('Blog ID is required'),
  param('commentId').isString().notEmpty().withMessage('Comment ID is required'),
  body('content')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 2000 })
    .withMessage('Comment must be at most 2000 characters'),
];

const rejectBlogValidation = [
  param('id').isString().notEmpty().withMessage('Blog ID is required'),
  body('reason')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Rejection reason must be at most 1000 characters'),
];

// =====================
// PUBLIC ROUTES (Auth Required)
// =====================

// GET /blogs - List approved blogs (paginated, tag filter)
router.get('/', isAuthenticated, ctrl.listApproved);

// GET /blogs/tags - Get all available tags
router.get('/tags', isAuthenticated, ctrl.getTags);

// GET /blogs/my - Get current user's blogs (must be before /:id to avoid conflict)
router.get('/my', isAuthenticated, ctrl.getMyBlogs);

// GET /blogs/pending - List pending blogs (Admin only, must be before /:id)
router.get('/pending', isAuthenticated, isAdmin, ctrl.listPending);

// GET /blogs/:id - Get single blog by ID
router.get('/:id', isAuthenticated, ctrl.getById);

// =====================
// USER BLOG ROUTES (Auth Required)
// =====================

// POST /blogs - Create a new blog
router.post('/', isAuthenticated, createBlogValidation, validate, ctrl.create);

// PUT /blogs/:id - Update a blog (author only, non-approved blogs)
router.put('/:id', isAuthenticated, updateBlogValidation, validate, ctrl.update);

// DELETE /blogs/:id - Delete a blog (author or admin)
router.delete('/:id', isAuthenticated, ctrl.remove);

// =====================
// COMMENT ROUTES (Auth Required)
// =====================

// POST /blogs/:id/comments - Add a comment to a blog
router.post('/:id/comments', isAuthenticated, commentValidation, validate, ctrl.addComment);

// PUT /blogs/:id/comments/:commentId - Edit a comment (owner only)
router.put('/:id/comments/:commentId', isAuthenticated, editCommentValidation, validate, ctrl.editComment);

// DELETE /blogs/:id/comments/:commentId - Delete a comment (owner or admin)
router.delete('/:id/comments/:commentId', isAuthenticated, ctrl.deleteComment);

// =====================
// ADMIN ROUTES
// =====================

// POST /blogs/:id/approve - Approve a blog
router.post('/:id/approve', isAuthenticated, isAdmin, ctrl.approve);

// POST /blogs/:id/reject - Reject a blog with optional reason
router.post('/:id/reject', isAuthenticated, isAdmin, rejectBlogValidation, validate, ctrl.reject);

export default router;
