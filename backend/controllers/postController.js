import Post from '../models/postModel.js';
import mongoose from 'mongoose';
import {categorizeContent,summarizeContent} from '../utils/connctAI.js';

const createPost = async (req, res, next) => {
    const { title, content, image, reviewPost } = req.body; //kullanicidan alinanlar

    try {
        const post = await Post.create({
            title,
            content,
            postedBy: req.user.username,
            image,
            reviewPost,

            ratings:[],
            averageRating:0,
            comments:[],

            category: await categorizeContent(content),
            spam:false,
            tags:[],
            summary:await summarizeContent(content),
            review:false
        });
        res.status(201).json({
            success: true,
            post
        });

        
    } catch (error) {
        console.log(error);
        next(error);
    }
};

const showPosts = async (req, res) => {
    const postedBy = req.query.user;
    try {
        let posts;
        if (postedBy) {
            posts = await Post.find({ postedBy });
        } else {
            posts = await Post.find();
        }
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
};

const showSinglePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json({
            post
        });
    } catch (error) {
        next(error);
    }
};

const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const currentPost = await Post.findById(postId);
        if (!currentPost) {
            res.status(404).json({
                success: false,
                message: "Post not found"
            });
            return;
        }
        await Post.findOneAndDelete({ _id: postId });
        res.status(200).json({
            message: "Post deleted"
        });
    } catch (error) {
        next(error);
    }
};

const updatePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const currentPost = await Post.findById(postId);
        if (!currentPost) {
            res.status(404).json({
                success: false,
                message: "Post not found"
            });
            return;
        }
        const post = await Post.findById(postId);
        post.title = req.body.title || post.title;
        post.content = req.body.content || post.content;
        post.categories = req.body.categories || post.categories;
        post.image = req.body.image || post.image;
        const updatedPost = await post.save();
        res.json({
            title: updatedPost.title,
            content: updatedPost.content,
        });
    } catch (error) {
        next(error);
    }
};

const ratePost = async (req, res, next) => {
    try {
        console.log("Received request body:", req.body); // Log entire request body
        const { postId, rating } = req.body;

        console.log("Extracted postId:", postId);
        console.log("Extracted rating:", rating);

        // Check if postId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        // Validate the rating value
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Find the post by ID
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Find existing rating by user
        const existingRating = post.ratings.find(r => r.userId.equals(req.user._id));
        if (existingRating) {
            existingRating.rating = rating;
        } else {
            post.ratings.push({ userId: req.user._id, rating });
        }

        // Calculate and update the average rating
        post.averageRating = post.calculateAverageRating();
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        console.error("Error in ratePost:", error);
        next(error);
    }
};

const commentOnPost = async (req, res, next) => {
    try {
        const { postId, comment } = req.body;

        // Check if postId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        // Find the post by ID
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Add the comment to the post
        post.comments.push({ userId: req.user._id, comment });
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        console.error("Error in commentOnPost:", error);
        next(error);
    }
};


export { createPost, showPosts, showSinglePost, deletePost, updatePost, ratePost, commentOnPost };
