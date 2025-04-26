import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getSocketID, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req: any, res: any) => {
    try {
        const reqUserID = req.user._id;

        // Pagination parameters
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        // Get paginated users and last messages in a single aggregation
        const result = await User.aggregate([
            // Match all users except current user
            { $match: { _id: { $ne: reqUserID } } },

            // Lookup last message first (before sorting)
            {
                $lookup: {
                    from: "messages",
                    let: { userId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        {
                                            $and: [
                                                { $eq: ["$senderId", reqUserID] },
                                                { $eq: ["$receiverId", "$$userId"] }
                                            ]
                                        },
                                        {
                                            $and: [
                                                { $eq: ["$senderId", "$$userId"] },
                                                { $eq: ["$receiverId", reqUserID] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 }
                    ],
                    as: "lastMessage"
                }
            },

            // Unwind to get single object
            { $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true } },

            // Add a field for sorting (handles null cases)
            {
                $addFields: {
                    lastMessageTime: {
                        $ifNull: ["$lastMessage.createdAt", new Date(0)] // Unix epoch for nulls
                    }
                }
            },

            // Now sort by the last message time
            { $sort: { "lastMessageTime": -1 } },

            // Pagination
            { $skip: skip },
            { $limit: limit },

            // Project final fields
            {
                $project: {
                    firstName: 1,
                    lastName: 1,
                    profilePic: 1,
                    lastMessage: 1,
                    lastOnline: 1,
                    userType: 1
                }
            }
        ]);

        // Get total count for pagination metadata
        const totalUsers = await User.countDocuments({ _id: { $ne: reqUserID } });
        const totalPages = Math.ceil(totalUsers / limit);

        res.status(200).json({
            users: result,
            pagination: {
                currentPage: page,
                totalPages,
                hasMore: page < totalPages,
            }
        });
    } catch (error: any) {
        console.log("Error in getUsersForSidebar controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getMessages = async (req: any, res: any) => {
    try {
        const { id: chatUserID } = req.params;
        const reqUserID = req.user._id;

        // Pagination parameters (with defaults)
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        // Get messages with pagination (sorted newest first in DB)
        const messages = await Message.find({
            $or: [
                { senderId: reqUserID, receiverId: chatUserID },
                { senderId: chatUserID, receiverId: reqUserID }
            ]
        })
            .sort({ createdAt: -1 }) // Newest first in DB
            .skip(skip)
            .limit(limit);

        // Reverse for frontend (oldest first)
        const reversedMessages = [...messages].reverse();

        // Get total count
        const totalMessages = await Message.countDocuments({
            $or: [
                { senderId: reqUserID, receiverId: chatUserID },
                { senderId: chatUserID, receiverId: reqUserID }
            ]
        });

        res.status(200).json({
            messages: reversedMessages,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalMessages / limit),
                hasNextPage: page < Math.ceil(totalMessages / limit),
            }
        });
    }
    catch (error: any) {
        console.log("Error in getMessages controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const sendMessage = async (req: any, res: any) => {
    try {
        const { text, image } = req.body;
        const { id: receiverID } = req.params;
        const reqUserID = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId: reqUserID,
            receiverId: receiverID,
            text: text || null,
            image: imageUrl || null
        });

        await newMessage.save();

        const receiverSocketID = getSocketID(receiverID);
        if(receiverSocketID){
            io.to(receiverSocketID).emit("newMessage", newMessage);
            console.log(newMessage)
        }

        res.status(200).json(newMessage);
    }
    catch (error: any) {
        console.log("Error in sendMessage controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}