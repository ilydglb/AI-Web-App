import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '30s'} 
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '15d'}
      );
  
  res.cookie('jwt', refreshToken, { httpOnly: true });

 return accessToken;
};

export default generateToken;  