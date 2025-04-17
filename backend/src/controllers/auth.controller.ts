import bcrypt from "bcryptjs"

import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req: any, res: any) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be atleast 8 characters" });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User(
            {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hashedPassword
            }
        )

        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                userType: newUser.userType
            });
        }
        else {
            return res.status(400).json({ message: "Invalid data given" })
        }
    }
    catch (error) {
        console.log("Error in controller: signup");
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req: any, res: any) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePic: user.profilePic,
            userType: user.userType
        });
    }
    catch (error) {
        console.log("Error in controller: login");
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = async (req: any, res: any) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully!" });
    }
    catch (error) {
        console.log("Error in controller: logout");
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = (req: any, res: any) => {
    try {
        res.status(200).json(req.user);
    } catch (error: any) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req: any, res: any) => {
    try {
        const { profilePic } = req.body;
        const userID = req.user._id;

        if (!profilePic) {
            res.status(400).json({ message: "No Profile Picture Provided" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updatedUser = User.findByIdAndUpdate(userID, { profilePic: uploadResponse.secure_url }, { new: true })

        res.status(200).json(updatedUser);
    }
    catch (error: any) {
        console.log("Error in updateProfile controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};