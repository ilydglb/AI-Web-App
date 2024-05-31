import Post from '../models/postModel.js';
import mongoose from 'mongoose';

const createPost = async (req, res, next) => {
    const { title, content, postedBy, image, categories, likes, comments } = req.body;

    try {


        const post = await Post.create({
            title,
            content,
            postedBy: req.user.username,
            categories,
            image,

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
        const numericRating = parseInt(rating);
        if (numericRating < 1 || numericRating > 5 || isNaN(numericRating)) {
            return res.status(400).json({ message: 'Rating must be a numeric value between 1 and 5' });
        }

        // Find the post by ID
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the user has already rated this post
        const existingRatingIndex = post.ratings.findIndex(r => r.username === req.user.username);

        if (existingRatingIndex !== -1) {
            // User has already rated the post, update their rating
            post.ratings[existingRatingIndex].rating = numericRating;
        } else {
            // User has not rated the post yet, add a new rating
            post.ratings.push({ username: req.user.username, rating: numericRating });
        }

        // Calculate and update average rating
        post.averageRating = post.calculateAverageRating();
        post.averageRating = Math.round(post.averageRating * 10) / 10; // Round to 1 decimal place
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
        post.comments.push({username: req.user.username, comment });
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        console.error("Error in commentOnPost:", error);
        next(error);
    }
};


export { createPost, showPosts, showSinglePost, deletePost, updatePost, ratePost, commentOnPost };
