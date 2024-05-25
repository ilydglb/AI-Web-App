import express from 'express';
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getUsers
} from '../controllers/userController.js';
import { handleRefreshToken } from '../controllers/refreshTController.js';
import { verifyJWT, isTheUserOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/auth', authUser);
router.get('/refresh', handleRefreshToken);
router.post('/logout', logoutUser);

router.route('/profile')
  .get(verifyJWT, getUserProfile)
  .put(verifyJWT, updateUserProfile)

router.get('/', verifyJWT, getUsers);

router.delete('/:username', verifyJWT, isTheUserOrAdmin, deleteUser);

export default router;