import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },

        firstName: {
            type: String,
            required: true
        },

        lastName: {
            type: String,
            required: true
        },

        userType: {
            type: String,
            default: "Patient"
        },

        password: {
            type: String,
            required: true,
            minlength: 8
        },

        profilePic: {
            type: String,
            default: ""
        }
    },

    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

export default User;