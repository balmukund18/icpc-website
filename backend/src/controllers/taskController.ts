import { Request, Response } from 'express';
import * as taskService from '../services/taskService';
import { success, fail } from '../utils/response';

// Create a new task (Admin)
export const create = async (req: Request, res: Response) => {
  try {
    const { title, description, points, assignedTo, dueDate, leetcodeSlug } = req.body;
    const task = await taskService.createTask({
      title,
      description: description || '',
      leetcodeSlug: leetcodeSlug || undefined,
      points: points ? parseInt(points, 10) : 0,
      assignedTo: assignedTo || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
    success(res, task, 201);
  } catch (err: any) {
    fail(res, err.message);
  }
};

// Get all tasks (Public/Auth)
export const getAll = async (req: any, res: Response) => {
  try {
    // If user is authenticated, include their submission status
    const userId = req.user?.id;
    const tasks = await taskService.getAllTasks(userId);
    success(res, tasks);
  } catch (err: any) {
    fail(res, err.message);
  }
};

// Get a single task (Auth)
export const getOne = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const task = await taskService.getTaskById(id, userId);
    success(res, task);
  } catch (err: any) {
    fail(res, err.message, 404);
  }
};

// Update a task (Admin)
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, points, assignedTo, dueDate, leetcodeSlug } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (leetcodeSlug !== undefined) updateData.leetcodeSlug = leetcodeSlug;
    if (points !== undefined) updateData.points = parseInt(points, 10);
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await taskService.updateTask(id, updateData);
    success(res, task);
  } catch (err: any) {
    fail(res, err.message);
  }
};

// Delete a task (Admin)
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await taskService.deleteTask(id);
    success(res, { message: 'Task deleted successfully' });
  } catch (err: any) {
    fail(res, err.message);
  }
};

// Assign task to users (Admin)
export const assign = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { userIds } = req.body;

    // Support both single userId (legacy) and userIds array
    const ids = userIds || (req.body.userId ? [req.body.userId] : []);

    const task = await taskService.assignTask(taskId, ids);
    success(res, task);
  } catch (err: any) {
    fail(res, err.message);
  }
};

// Get all submissions for a task (Admin)
export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submissions = await taskService.getTaskSubmissions(id);
    success(res, submissions);
  } catch (err: any) {
    fail(res, err.message);
  }
};

// Submit a solution for a task (Auth)
export const submit = async (req: any, res: Response) => {
  try {
    const { taskId } = req.params;
    const { link } = req.body;

    if (!link) {
      return fail(res, 'Solution link is required', 400);
    }

    const submission = await taskService.submitTask(taskId, req.user.id, link);
    success(res, submission, 201);
  } catch (err: any) {
    fail(res, err.message, 400);
  }
};

// Verify a submission (Admin)
export const verify = async (req: Request, res: Response) => {
  try {
    const { subId } = req.params;
    const { points } = req.body;

    const customPoints = points !== undefined ? parseInt(points, 10) : undefined;
    const submission = await taskService.verifySubmission(subId, customPoints);
    success(res, submission);
  } catch (err: any) {
    fail(res, err.message, 400);
  }
};

// Reject a submission (Admin)
export const reject = async (req: Request, res: Response) => {
  try {
    const { subId } = req.params;
    const submission = await taskService.rejectSubmission(subId);
    success(res, submission);
  } catch (err: any) {
    fail(res, err.message, 400);
  }
};

// Get current user's submissions (Auth)
export const mySubmissions = async (req: any, res: Response) => {
  try {
    const submissions = await taskService.getUserSubmissions(req.user.id);
    success(res, submissions);
  } catch (err: any) {
    fail(res, err.message);
  }
};

// Get current user's total points (Auth)
export const myPoints = async (req: any, res: Response) => {
  try {
    const points = await taskService.getUserPoints(req.user.id);
    success(res, { points });
  } catch (err: any) {
    fail(res, err.message);
  }
};

// Verify a submission via LeetCode (Auth)
export const verifyLeetCode = async (req: any, res: Response) => {
  try {
    const { taskId } = req.params;
    const { leetcodeUsername } = req.body;
    const userId = req.user.id;

    if (!leetcodeUsername) {
      return fail(res, 'LeetCode username is required', 400);
    }

    // Get task to check it has a leetcodeSlug
    const task = await taskService.getTaskById(taskId, userId);
    if (!task.leetcodeSlug) {
      return fail(res, 'This task does not support LeetCode verification', 400);
    }

    // Check if user can submit
    if (!task.canSubmit) {
      return fail(res, 'You cannot submit to this task', 400);
    }

    // Verify via LeetCode API
    const { verifyLeetCodeSubmission } = await import('../services/verificationService');
    const result = await verifyLeetCodeSubmission(
      leetcodeUsername,
      task.leetcodeSlug,
      168 // 7-day window for practice tasks
    );

    if (!result.verified) {
      return fail(res, 'Problem not found in your recent LeetCode submissions. Solve it on LeetCode first.', 400);
    }

    // Auto-create a verified submission
    const link = `https://leetcode.com/problems/${task.leetcodeSlug}/`;
    const submission = await taskService.submitTask(taskId, userId, link);
    // Auto-verify it
    const verified = await taskService.verifySubmission(submission.id);

    success(res, {
      verified: true,
      submission: verified,
      message: 'LeetCode submission verified! Points awarded.',
    }, 201);
  } catch (err: any) {
    fail(res, err.message, 400);
  }
};
