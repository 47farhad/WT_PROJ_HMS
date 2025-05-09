import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req: any, res: any, next: any) => {
    try {
        const token = req.cookies.jwt;
        
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }
        
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }
        
        const user = await User.findById(decoded.userID).select("-password");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        req.user = user;
        
        next();
    } catch (error: any) {
        console.log("Error in protectRoute middleware: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// isAdmin middleware to check if the user is an admin, please be correct allah taala plspls
export const isAdmin = (req: any, res: any, next: any) => {
    try {
        if (!req.user || req.user.userType !== "Admin") {
            return res.status(403).json({ 
                message: "Access denied. Not authorized as admin."
            });
        }
        
        next();
    } catch (error: any) {
        console.log("Error in isAdmin middleware: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};