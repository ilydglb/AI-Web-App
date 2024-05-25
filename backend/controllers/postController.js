import Post from '../models/postModel.js'
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
        })


    } catch (error) {
        console.log(error);
        next(error);
    }

}


// const showPosts = async (req, res, next) => {
//     try {
//          const posts = await Post.find().sort({ createdAt: -1 })
//         //.populate('postedBy', 'name');
//         res.status(201).json(
//             posts
//         )
//     } catch (error) {
//         next(error);
//     }

// }

const showPosts = async (req, res) => {
    const postedBy = req.query.user;
    // console.log("req query",req.query.user)
    // console.log("POSTEDBY ",postedBy)
  //  const catName = req.query.cat;
    try {
      let posts;
      if (postedBy) {
        posts = await Post.find({ postedBy });
      } 
       else {
        posts = await Post.find();
      }
      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json(err);
    }
  }
  



const showSinglePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json({
            post
        })
    } catch (error) {
        next(error);
    }

}

const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;

        // Check if the post exists
        const currentPost = await Post.findById(postId);
        if (!currentPost) {
            res.status(404).json({
                success: false,
                message: "Post not found"
            });
            return;
        }

        // Use findOneAndDelete to remove the post
        await Post.findOneAndDelete({ _id: postId });

        res.status(200).json({
            message: "Post deleted"
        });
    } catch (error) {
        next(error);
    }
};



const updatePost = async (req, res, next) => {
 try{
      const postId = req.params.id; // Access postId from route parameters
  
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
        post.image= req.body.image || post.image;

        const updatedPost = await post.save();
  
        res.json({
          title: updatedPost.title, // Use updatedPost instead of updatePost
          content: updatedPost.content,
        });
   
    } catch (error) {
      next(error);
    }
  };


  

//   exports.addComment = async (req, res, next) => {
//     const { comment } = req.body;
//     try {
//         const postComment = await Post.findByIdAndUpdate(req.params.id, {
//             $push: { comments: { text: comment, postedBy: req.user._id } }
//         },
//             { new: true }
//         );
//         const post = await Post.findById(postComment._id).populate('comments.postedBy', 'name email');
//         res.status(200).json({
//             success: true,
//             post
//         })

//     } catch (error) {
//         next(error);
//     }

// }


// //add like
// exports.addLike = async (req, res, next) => {

//     try {
//         const post = await Post.findByIdAndUpdate(req.params.id, {
//             $addToSet: { likes: req.user._id }
//         },
//             { new: true }
//         );
//         const posts = await Post.find().sort({ createdAt: -1 }).populate('postedBy', 'name');
//         main.io.emit('add-like', posts);

//         res.status(200).json({
//             success: true,
//             post,
//             posts
//         })

//     } catch (error) {
//         next(error);
//     }

// }


// //remove like
// exports.removeLike = async (req, res, next) => {

//     try {
//         const post = await Post.findByIdAndUpdate(req.params.id, {
//             $pull: { likes: req.user._id }
//         },
//             { new: true }
//         );

//         const posts = await Post.find().sort({ createdAt: -1 }).populate('postedBy', 'name');
//         main.io.emit('remove-like', posts);

//         res.status(200).json({
//             success: true,
//             post
//         })

//     } catch (error) {
//         next(error);
//     }
// }

export { createPost, showPosts, showSinglePost, deletePost, updatePost};
