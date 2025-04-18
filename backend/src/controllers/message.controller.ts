import cloudinary from "../lib/cloudinary";
import Message from "../models/message.model";
import User from "../models/user.model";

export const getUsersForSidebar = async (req: any, res: any) => {
    try {
        const reqUserID = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: reqUserID } }).select("-password"); // To be changed. dont wont ALL the users

        res.status(200).json(filteredUsers);
    }
    catch (error: any) {
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
        const { receiverID } = req.params;
        const reqUserID = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId: reqUserID,
            receiverId: receiverID,
            text: text,
            image: imageUrl
        });

        await newMessage.save();
    }
    catch (error: any) {
        console.log("Error in sendMessage controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}