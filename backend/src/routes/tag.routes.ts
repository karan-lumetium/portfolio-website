import { Router } from 'express';
import { TagController } from '../controllers/tag.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', TagController.getTags);

// Admin routes
router.post('/', authenticate, requireAdmin, TagController.createTag);

export default router;
