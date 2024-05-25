import mongoose from 'mongoose';
//import { Schema, Types } from 'mongoose';

const postSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "title is required"],
        },
        content: {
            type: String,
            required: [true, "content is required"],
        },
        postedBy: {
            type: String,
            ref: "User",
        },
        categories: 
           {
            type:Array,
           // required:[true, "Lütfen kategori seçin"],
           },
        
        image: {
            type: String,
            default: "",
        },
        // likes: [{ type: mongoose.Types.ObjectId, ref: "User" }],
        // comments: [
        //     {
        //         text: String,
        //         created: { type: Date, default: Date.now },
        //         postedBy: {
        //             type: mongoose.Types.ObjectId,
        //             ref: "User",
        //         },
        //     },
        // ],
    },
    { timestamps: true }
);
const Post = mongoose.model('Post', postSchema);

export default Post;