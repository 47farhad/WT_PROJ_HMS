import mongoose from 'mongoose';
import User from '../models/user.model.js'

export const updateLastOnline = async (userId: string | mongoose.ObjectId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        user.lastOnline = new Date();
        await user.save();

        return user;
    } catch (error) {
        console.error('Error updating last online:', error);
        throw error;
    }
};