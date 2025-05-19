import mongoose from "mongoose";
import userUpdateLogsModel from "../models/userUpdatelogs.model.js";

export const createLog = async (
    adminId: string,
    userId: string,
    userType: string,
    session?: mongoose.ClientSession
) => {
    if (!adminId || !userId || !userType) {
        throw new Error("All fields are required");
    }

    const newLog = await userUpdateLogsModel.create(
        [{ adminId, userId, userType }],
        session ? { session } : {}
    );

    return newLog[0];
};
