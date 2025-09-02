import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', CategoryController.getCategories);

// Admin routes
router.post('/', authenticate, requireAdmin, CategoryController.createCategory);

export default router;
