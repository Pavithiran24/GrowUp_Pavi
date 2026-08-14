import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateProfileSchema, updateUserRoleSchema, createUserSchema } from '../validators/user.validator';

const router = Router();

router.use(authenticate);

router.get('/profile', UserController.getProfile);
router.patch('/profile', validate(updateProfileSchema), UserController.updateProfile);
router.get('/', UserController.getAllUsers);

router.post('/', authorize(['ADMIN']), validate(createUserSchema), UserController.createUser);
router.get('/:id', authorize(['ADMIN']), UserController.getUserById);
router.patch('/:id', authorize(['ADMIN']), validate(updateUserRoleSchema), UserController.updateUserRole);
router.delete('/:id', authorize(['ADMIN']), UserController.deleteUser);

export default router;
