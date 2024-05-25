import jwt from "jsonwebtoken";
import User from "../models/userModel.js";


 const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader) {  //if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    return res.status(401).json({ error: 'Unauthorized: Missing Authorization Header' });
  }

  const token = authHeader.split(' ')[1];
 
  jwt.verify(token, process.env.JWT_SECRET,async (err, decoded) => {

        try{  req.user = await User.findById(decoded.userId).select('-password')}catch(err){console.log(err)}
     
    if (err) {
      console.error(err); 
      return res.json({ error: 'Forbidden: Invalid Token',expired:'true' });
    }
    next();
  });
};

import Post from "../models/postModel.js";


const isTheUserOrAdmin = async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });;

    if (req.user.username !== user.username && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You must be the user or an admin' });
    }
    next();
  } catch (error) {

    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const isOwnerOrAdmin = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the user is the owner or an admin
    if (req.user.username !== post.postedBy && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You must be the owner or an admin' });
    }

    // If the user is the owner or an admin, proceed to the next middleware or route handler
    next();
  } catch (error) {

    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export {verifyJWT, isOwnerOrAdmin, isTheUserOrAdmin};