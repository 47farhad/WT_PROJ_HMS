import Appointment from "../models/appointment.model.js"
import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getSocketID, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req: any, res: any) => {
    try {
        const reqUser = req.user;
        const reqUserID = reqUser._id;
        const userType = reqUser.userType;

        // Pagination parameters
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        // Base match conditions
        let matchConditions: any[] = [{ _id: { $ne: reqUserID } }];

        // Role-specific filters
        if (userType === 'Patient') {
            // Patients can only see Doctors they have confirmed appointments with
            const doctorIds = await Appointment.distinct('doctorId', {
                patientId: reqUserID,
                status: 'confirmed'
            });

            matchConditions.push({
                $and: [
                    { _id: { $in: doctorIds } },
                    { userType: 'Doctor' }
                ]
            });
        }
        else if (userType === 'Doctor') {
            // Doctors can see:
            // 1. Admins
            // 2. Patients they have confirmed appointments with
            const patientIds = await Appointment.distinct('patientId', {
                doctorId: reqUserID,
                status: 'confirmed'
            });

            matchConditions.push({
                $or: [
                    { userType: 'Admin' },
                    {
                        $and: [
                            { _id: { $in: patientIds } },
                            { userType: 'Patient' }
                        ]
                    }
                ]
            });
        }
        else if (userType === 'Admin') {
            // Admins can see other Admins and Doctors
            matchConditions.push({
                $or: [
                    { userType: 'Admin' },
                    { userType: 'Doctor' }
                ]
            });
        }

        const result = await User.aggregate([
            { $match: { $and: matchConditions } },
            // Rest of the aggregation pipeline remains the same...
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
            { $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    lastMessageTime: {
                        $ifNull: ["$lastMessage.createdAt", new Date(0)]
                    }
                }
            },
            { $sort: { "lastMessageTime": -1 } },
            { $skip: skip },
            { $limit: limit },
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

        const totalUsers = await User.countDocuments({ $and: matchConditions });
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
        const reqUser = req.user;
        const reqUserID = reqUser._id;
        const userType = reqUser.userType;

        const chatUser = await User.findById(chatUserID);
        if (!chatUser) {
            return res.status(404).json({ message: "User not found" });
        }

        let hasPermission: any = false;

        if (userType === 'Patient') {
            hasPermission = chatUser.userType === 'Doctor' &&
                await Appointment.exists({
                    doctorId: chatUserID,
                    patientId: reqUserID,
                    status: 'confirmed'
                });
        }
        else if (userType === 'Doctor') {
            hasPermission = chatUser.userType === 'Admin' ||
                (chatUser.userType === 'Patient' &&
                    await Appointment.exists({
                        doctorId: reqUserID,
                        patientId: chatUserID,
                        status: 'confirmed'
                    }));
        }
        else if (userType === 'Admin') {
            hasPermission = ['Admin', 'Doctor'].includes(chatUser.userType);
        }

        if (!hasPermission) {
            return res.status(403).json({ message: "You don't have permission to access this chat" });
        }

        // Rest of the function remains the same...
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        const messages = await Message.find({
            $or: [
                { senderId: reqUserID, receiverId: chatUserID },
                { senderId: chatUserID, receiverId: reqUserID }
            ]
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const reversedMessages = [...messages].reverse();
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
    } catch (error: any) {
        console.log("Error in getMessages controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const sendMessage = async (req: any, res: any) => {
    try {
        const { text, image } = req.body;
        const { id: receiverID } = req.params;
        const reqUser = req.user;
        const reqUserID = reqUser._id;
        const userType = reqUser.userType;

        const receiver = await User.findById(receiverID);
        if (!receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        let hasPermission: any = false;

        if (userType === 'Patient') {
            hasPermission = receiver.userType === 'Doctor' &&
                await Appointment.exists({
                    doctorId: receiverID,
                    patientId: reqUserID,
                    status: 'confirmed'
                });
        }
        else if (userType === 'Doctor') {
            hasPermission = receiver.userType === 'Admin' ||
                (receiver.userType === 'Patient' &&
                    await Appointment.exists({
                        doctorId: reqUserID,
                        patientId: receiverID,
                        status: 'confirmed'
                    }));
        }
        else if (userType === 'Admin') {
            hasPermission = ['Admin', 'Doctor'].includes(receiver.userType);
        }

        if (!hasPermission) {
            return res.status(403).json({ message: "You don't have permission to message this user" });
        }

        // Rest of the function remains the same...
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
        if (receiverSocketID) {
            io.to(receiverSocketID).emit("newMessage", newMessage);
        }

        res.status(200).json(newMessage);
    } catch (error: any) {
        console.log("Error in sendMessage controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};