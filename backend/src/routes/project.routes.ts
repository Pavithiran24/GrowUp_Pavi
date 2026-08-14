import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createProjectSchema, updateProjectSchema, addMemberSchema } from '../validators/project.validator';
import { createTaskSchema } from '../validators/task.validator';

const router = Router();

router.use(authenticate);

router.get('/', ProjectController.getProjects);
router.post('/', validate(createProjectSchema), ProjectController.createProject);
router.get('/:id', ProjectController.getProjectById);
router.patch('/:id', validate(updateProjectSchema), ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);

// Members
router.get('/:id/members', ProjectController.getMembers);
router.post('/:id/members', validate(addMemberSchema), ProjectController.addMember);
router.delete('/:id/members/:userId', ProjectController.removeMember);

// Nested Tasks
router.get('/:projectId/tasks', TaskController.getProjectTasks);
router.post('/:projectId/tasks', validate(createTaskSchema), TaskController.createTask);

export default router;
