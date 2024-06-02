import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    username: { type: String, required: true }, // Add username field for rating
    rating: { type: Number, required: true }
});
const commentSchema = new mongoose.Schema({
    username: { type: String, required: true }, // Add username field for rating
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
        spam:{type:String}, //0-1
        tags: { type: String, default: null },
        summary: { type: String, default: '' },
        reviewPost: { type: Boolean, default: false },
        review: { type:String }, //0-1
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
