import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req: any, res: any) => {
    try {
        const reqUserID = req.user._id;

        // Get all users except the logged-in user
        const filteredUsers = await User.find({ _id: { $ne: reqUserID } }).select("-password");

        // Get the last message for each conversation
        const usersWithLastMessage = await Promise.all(
            filteredUsers.map(async (user) => {
                const lastMessage = await Message.findOne({
                    $or: [
                        { senderId: reqUserID, receiverId: user._id },
                        { senderId: user._id, receiverId: reqUserID }
                    ]
                }).sort({ createdAt: -1 }).limit(1);

                return {
                    ...user.toObject(),
                    lastMessage: lastMessage || null
                };
            })
        );

        res.status(200).json(usersWithLastMessage);
    } catch (error: any) {
        console.log("Error in getUsersForSidebar controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getMessages = async (req: any, res: any) => {
    try {
        const { id: chatUserID } = req.params;
        const reqUserID = req.user._id;

        // update this query to get only last 50 or whatever messages, dont want to get all in a single request
        const messages = await Message.find({
            $or: [
                { senderId: reqUserID, receiverId: chatUserID },
                { senderId: chatUserID, receiverId: reqUserID }
            ]
        });

        res.status(200).json(messages);
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

        res.status(200).json(newMessage);
    }
    catch (error: any) {
        console.log("Error in sendMessage controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}