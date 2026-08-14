import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateTaskSchema, updateTaskStatusSchema } from '../validators/task.validator';

const router = Router();

router.use(authenticate);

router.get('/:id', TaskController.getTaskById);
router.patch('/:id', validate(updateTaskSchema), TaskController.updateTask);
router.patch('/:id/status', validate(updateTaskStatusSchema), TaskController.updateTaskStatus);
router.delete('/:id', TaskController.deleteTask);

export default router;
