import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true }
});
const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true }
});


const postSchema = new mongoose.Schema(
    {
        title: { type: String, required: [true, 'title is required'] },
        content: { type: String, required: [true, 'content is required'] },
        postedBy: { type: String, ref: 'User' },
        image: { type: String, default: '' },
        ratings:{ type: [ratingSchema], default: [] },
        comments: { type: [commentSchema], default: [] },
        averageRating: { type: Number, default: 0 },
        category: { type: String, default: null  },
        spam: { type: Boolean, default: false },
        tags: { type: [String], default: [] },
        summary: { type: String, default: '' },
        reviewPost: { type: Boolean, default: false },
        review: { type: String, default: null },
    },
    { timestamps: true }
);

postSchema.methods.calculateAverageRating = function () {
    if (this.ratings.length === 0) return 0;
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / this.ratings.length;
};

const Post = mongoose.model('Post', postSchema);

export default Post;
