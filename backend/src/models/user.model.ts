import mongoose from "mongoose";

const medicalInfoSchema = new mongoose.Schema({
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
        default: ''
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    height: {  // in cm
        type: Number,
        default: null
    },
    weight: {  // in kg
        type: Number,
        default: null
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', ''],
        default: ''
    },
    allergies: {
        type: [String],  // Array of strings
        default: []
    },
    chronicConditions: {
        type: [String],
        default: []
    },
    currentMedications: {
        type: [String],
        default: []
    },
    primaryPhysician: {
        type: String,
        default: ''
    },
    physicianContact: {
        type: String,
        default: ''
    },
    insuranceProvider: {
        type: String,
        default: ''
    },
    policyNumber: {
        type: String,
        default: ''
    },
    smokingStatus: {
        type: String,
        enum: ['never', 'former', 'current', ''],
        default: ''
    },
    alcoholConsumption: {
        type: String,
        enum: ['never', 'occasional', 'regular', ''],
        default: ''
    },
    exerciseFrequency: {
        type: String,
        enum: ['none', 'light', 'moderate', 'heavy', ''],
        default: ''
    },
    dietaryRestrictions: {
        type: String,
        default: ''
    },
    additionalNotes: {
        type: String,
        default: ''
    },
},
    {
        timestamps: true
    }
);

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
        },
        lastOnline: {
            type: Date,
            default: Date.now
        },
        medicalInfo: {
            type: medicalInfoSchema,
            default: () => ({})
        },
        contact: {
            type: String,
            default: ""
        },
        emergencyContact: {
            type: String,
            default: ""
        },
        address: {
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