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

        const userWithoutPassword: any = user.toObject();
        delete userWithoutPassword.password;

        res.status(200).json(userWithoutPassword);
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
    }
    catch (error: any) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req: any, res: any) => {
    try {
        const { personalData, medicalData } = req.body;
        const userID = req.user._id;
        const updateData: any = {};

        // Destructure and validate personal info
        if (personalData) {
            const {
                firstName,
                lastName,
                contact,
                emergencyContact,
                address,
                profilePic
            } = personalData;

            if (firstName) updateData.firstName = firstName;
            if (lastName) updateData.lastName = lastName;
            if (contact) updateData.contact = contact;
            if (emergencyContact) updateData.emergencyContact = emergencyContact;
            if (address) updateData.address = address;

            // Handle profile picture separately
            if (profilePic) {
                const uploadResponse = await cloudinary.uploader.upload(profilePic);
                updateData.profilePic = uploadResponse.secure_url;
            }
        }

        // Process medical data only for Patients
        if (medicalData && req.user.userType === "Patient") {
            const {
                bloodType,
                dateOfBirth,
                height,
                weight,
                gender,
                allergies,
                chronicConditions,
                currentMedications,
                primaryPhysician,
                physicianContact,
                insuranceProvider,
                policyNumber,
                smokingStatus,
                alcoholConsumption,
                exerciseFrequency,
                dietaryRestrictions,
                additionalNotes
            } = medicalData;

            updateData.medicalInfo = {};

            if (bloodType) updateData.medicalInfo.bloodType = bloodType;
            if (dateOfBirth) updateData.medicalInfo.dateOfBirth = dateOfBirth;
            if (height) updateData.medicalInfo.height = height;
            if (weight) updateData.medicalInfo.weight = weight;
            if (gender) updateData.medicalInfo.gender = gender;
            if (allergies) updateData.medicalInfo.allergies = allergies;
            if (chronicConditions) updateData.medicalInfo.chronicConditions = chronicConditions;
            if (currentMedications) updateData.medicalInfo.currentMedications = currentMedications;
            if (primaryPhysician) updateData.medicalInfo.primaryPhysician = primaryPhysician;
            if (physicianContact) updateData.medicalInfo.physicianContact = physicianContact;
            if (insuranceProvider) updateData.medicalInfo.insuranceProvider = insuranceProvider;
            if (policyNumber) updateData.medicalInfo.policyNumber = policyNumber;
            if (smokingStatus) updateData.medicalInfo.smokingStatus = smokingStatus;
            if (alcoholConsumption) updateData.medicalInfo.alcoholConsumption = alcoholConsumption;
            if (exerciseFrequency) updateData.medicalInfo.exerciseFrequency = exerciseFrequency;
            if (dietaryRestrictions) updateData.medicalInfo.dietaryRestrictions = dietaryRestrictions;
            if (additionalNotes) updateData.medicalInfo.additionalNotes = additionalNotes;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userID,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (error: any) {
        console.log("Error in updateProfile controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};