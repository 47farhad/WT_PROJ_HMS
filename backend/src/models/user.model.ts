import mongoose from "mongoose";

// Work schedule interface for TypeScript type checking
interface IWorkSchedule {
    day: string;
    isWorking: boolean;
    startTime: string;
    endTime: string;
    slotDuration: number;
}

// Doctor information interface
interface IDoctorInfo {
    specialization: string;
    qualifications: string[];
    experience: number;
    workSchedule: IWorkSchedule[];
    commission: number;
    department: string;
    isAvailable: boolean;
    ratings: {
        patientId: mongoose.Types.ObjectId;
        rating: number;
        review?: string;
        date: Date;
    }[];
    averageRating: number;
}

// Medical information interface for patients
interface IMedicalInfo {
    dateOfBirth?: Date;
    bloodType?: string;
    allergies?: string[];
    chronicDiseases?: string[];
    surgeries?: string[];
}

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
            enum: ['Patient', 'Doctor', 'Admin', 'Assistant', 'Pharmacist', 'Support', 'Lab'],
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

        phone: {
            type: String
        },

        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        },

        // Doctor-specific information
        doctorInfo: {
            specialization: String,
            qualifications: [String],
            experience: Number,
            workSchedule: [
                {
                    day: {
                        type: String,
                        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                    },
                    isWorking: {
                        type: Boolean,
                        default: true
                    },
                    startTime: String,
                    endTime: String,
                    slotDuration: {
                        type: Number,
                        default: 30
                    }
                }
            ],
            commission: {
                type: Number,
                default: 0
            },
            department: String,
            isAvailable: {
                type: Boolean,
                default: true
            },
            ratings: [
                {
                    patientId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User'
                    },
                    rating: {
                        type: Number,
                        min: 1,
                        max: 5
                    },
                    review: String,
                    date: {
                        type: Date,
                        default: Date.now
                    }
                }
            ],
            averageRating: {
                type: Number,
                default: 0
            }
        },

        // Patient-specific medical information
        medicalInfo: {
            dateOfBirth: Date,
            bloodType: String,
            allergies: [String],
            chronicDiseases: [String],
            surgeries: [String]
        },

        isActive: {
            type: Boolean,
            default: true
        },

        verified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Calculate average rating when ratings are modified
userSchema.pre('save', function(next) {
    if (this.doctorInfo?.ratings && this.doctorInfo.ratings.length > 0) {
        const totalRating = this.doctorInfo.ratings.reduce((sum, rating) => {
            // Check if rating.rating exists before adding it to the sum
            return sum + (rating.rating || 0);
        }, 0);
        this.doctorInfo.averageRating = totalRating / this.doctorInfo.ratings.length;
    } else if (this.doctorInfo) {
        this.doctorInfo.averageRating = 0;
    }
    next();
});

const User = mongoose.model("User", userSchema);

export default User;