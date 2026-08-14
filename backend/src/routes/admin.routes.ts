import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard/stats', AdminController.getDashboardStats);
router.get('/admin/audit-logs', authorize(['ADMIN']), AdminController.getAuditLogs);

export default router;
