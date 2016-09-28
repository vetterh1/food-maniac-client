import { Router } from 'express';
import * as UserController from '../controllers/userController';
const router = new Router();

// Get all Users
router.route('/users').get(UserController.getUsers);

// Get one user by cuid
router.route('/users/:cuid').get(UserController.getUser);

// Add a new User
router.route('/users').post(UserController.addUser);

// Delete a user by cuid
router.route('/users/:cuid').delete(UserController.deleteUser);

export default router;
