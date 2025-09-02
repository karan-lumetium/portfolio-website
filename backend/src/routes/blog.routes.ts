import { Router } from 'express';
import { BlogController } from '../controllers/blog.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/posts', BlogController.getPosts);
router.get('/posts/:slug', BlogController.getPost);

// Admin routes
router.post('/posts', authenticate, requireAdmin, BlogController.createPost);
router.put('/posts/:id', authenticate, requireAdmin, BlogController.updatePost);
router.delete('/posts/:id', authenticate, requireAdmin, BlogController.deletePost);

export default router;
