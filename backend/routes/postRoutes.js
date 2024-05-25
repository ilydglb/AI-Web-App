import express from 'express';
const router = express.Router();
import { createPost, showPosts, showSinglePost, deletePost, updatePost } from '../controllers/postController.js';
import { verifyJWT, isOwnerOrAdmin } from '../middleware/auth.js';

router.post('/create', verifyJWT, createPost);

router.get('', showPosts).get('/:id', showSinglePost);

router.delete('/:id', verifyJWT, isOwnerOrAdmin , deletePost).put('/:id',verifyJWT,isOwnerOrAdmin, updatePost);

export default router;