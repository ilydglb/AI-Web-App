import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

  const registerUser = asyncHandler(async(req, res) => {
    const { username, email, password } = req.body;

    
    const userExists = await User.findOne({ email });
  
    if (userExists) {
      res.status(400)
      throw new Error('User already exists');
    }

    const userNameTaken = await User.findOne({ username });

    if (userNameTaken) {
      res.status(400)
      throw new Error('Username is taken');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password,salt)
  
  try{
    const user = await User.create({
      username,
      email,
      hashedPassword,
    });
  
  
       // generateToken(res, user._id)
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        //token:generateToken(user._id) 
      });
      //console.log(res.data)
    } catch{
      res.status(400);
      throw new Error('Invalid user data');
    }
  });

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
   // generateToken(res, user._id);


    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role:user.role,
      profilePic:user.profilePic,
      accessToken: generateToken(res, user._id)
    });

    
    // res.cookie('yourCookieName', 'cookieValue', { httpOnly: true });
    // res.status(200).json({message:'Cookie sent!'});

  } else {
    res.status(401);
    throw new Error('Geçersiz email ya da şifre.');
  }
}); //login
  

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async(req, res) => {

  req.headers.authorization ='';
  req.headers.Authorization ='';
  
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' })  //204-successful and no content to display
})

const getUsers = asyncHandler(async(req, res) => {
 
  try {
    const  users = await User.find();
    
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// @access  Private
const getUserProfile = asyncHandler(async(req, res) => {
 
  try{
    const id = req.user._id;
    res.status(200).json({
      user:`${id}`
     //_id: user._id,
    });
  }catch(err){
    res.status(404);
   // throw new Error('User not found');
  }
});



// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const originalUsername = user.username;

    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.profilePic = req.body.profilePic || user.profilePic;
    user.password = req.body.password || user.password;


    const updatedUser = await user.save();

    if (originalUsername !== updatedUser.username) {
      // Update the username in user's posts
      await Post.updateMany({ postedBy: updatedUser.username });
    }

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


import Post from '../models/postModel.js';
const deleteUser = asyncHandler(async(req,res)=>{
 
  const username = req.params.username;
  //const userId=req.user._id;

  //delete user's posts
  await Post.deleteMany({ postedBy: username });

  // Then delete the user
  const user = await User.findOne({ username });;

  if (user) {
    await user.deleteOne();
    res.json({ message: 'User and associated posts deleted successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});



const followUser = asyncHandler(async (req, res) => {
  const { usernameToFollow } = req.body;

  if (!usernameToFollow) {
    return res.status(400).json({ error: 'Username to follow is required' });
  }

  const userToFollow = await User.findOne({ username: usernameToFollow });

  if (!userToFollow) {
    res.status(404);
    throw new Error('User not found');
  }

  const user = req.user;

  if (userToFollow.followers.includes(user.username)) {
    res.status(400);
    throw new Error('You already follow this user');
  }

  userToFollow.followers.push(user.username);
  user.following.push(userToFollow.username);

  await userToFollow.save();
  await user.save();

  res.status(200).json({ message: 'User followed successfully' });
});

// @desc    Unfollow a user
// @route   POST /api/users/unfollow
// @access  Private
const unfollowUser = asyncHandler(async (req, res) => {
  const { usernameToUnfollow } = req.body;

  if (!usernameToUnfollow) {
    return res.status(400).json({ error: 'Username to unfollow is required' });
  }

  const userToUnfollow = await User.findOne({ username: usernameToUnfollow });

  if (!userToUnfollow) {
    res.status(404);
    throw new Error('User not found');
  }

  const user = req.user;

  if (!userToUnfollow.followers.includes(user.username)) {
    res.status(400);
    throw new Error('You do not follow this user');
  }

  userToUnfollow.followers = userToUnfollow.followers.filter(
    (username) => username !== user.username
  );
  user.following = user.following.filter(
    (username) => username !== userToUnfollow.username
  );

  await userToUnfollow.save();
  await user.save();

  res.status(200).json({ message: 'User unfollowed successfully' });
});


export { authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
  deleteUser,
  getUsers,
  followUser, 
  unfollowUser};