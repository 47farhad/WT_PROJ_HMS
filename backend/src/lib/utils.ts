import jwt from "jsonwebtoken"

export const generateToken = (userID: any, res: any) => {
    const token = jwt.sign({userID}, process.env.JWT_SECRET!, {
        expiresIn: "1d"
    });

    res.cookie("jwt", token, {
        maxAge: 1 * 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true,
        secure: true, 
        sameSite: "none", 
    });
}