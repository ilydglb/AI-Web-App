import express from 'express';
const router = express.Router();
import { createPost, showPosts, showSinglePost, deletePost, updatePost, ratePost, commentOnPost} from '../controllers/postController.js';
import { verifyJWT, isOwnerOrAdmin } from '../middleware/auth.js';

router.post('/create', verifyJWT, createPost);
router.post('/rate', verifyJWT, ratePost); 
router.post('/comment', verifyJWT, commentOnPost); 
router.get('', showPosts).get('/:id', showSinglePost);
router.delete('/:id', verifyJWT, isOwnerOrAdmin, deletePost).put('/:id', verifyJWT, isOwnerOrAdmin, updatePost);

export default router;
