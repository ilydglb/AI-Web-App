import jwt from "jsonwebtoken";
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

export const handleRefreshToken = (req, res) => {

    const refreshToken = req.cookies.jwt;

    if (refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);  //verify edemezse catche düşer
            const foundUser = User.findById(decoded.userId).select('-password')

            if (!foundUser) return res.sendStatus(403); //Forbidden 
            const accessToken = jwt.sign(
                { "userId": decoded.userId },
                process.env.JWT_SECRET,
                { expiresIn: '30s' }
            );
            res.status(200).json({ accessToken: accessToken, })
        } catch (err) {
            console.log(err)
            res.status(403);
            throw new Error('Not authorized, token failed');
        }
    } 
    else 
    {
        res.status(401);
        console.log("COOKIE KAYIT ETMIYOR")
        throw new Error('Not authorized, no token');
    }

}
