import mongoose from "mongoose";

// TypeScript interfaces for type checking
interface IWorkSchedule {
    day: string;
    isWorking: boolean;
    startTime: string;
    endTime: string;
    slotDuration: number;
}

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

interface IMedicalInfo {
    dateOfBirth?: Date;
    height?: number;
    weight?: number;
    gender?: string;
    bloodType?: string;
    allergies?: string[];
    chronicDiseases?: string[];
    chronicConditions?: string[];
    currentMedications?: string[];
    surgeries?: string[];
    primaryPhysician?: string;
    physicianContact?: string;
    insuranceProvider?: string;
    policyNumber?: string;
    smokingStatus?: string;
    alcoholConsumption?: string;
    exerciseFrequency?: string;
    dietaryRestrictions?: string;
    additionalNotes?: string;
}

// Define comprehensive medical info schema
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
    chronicDiseases: {  // Preserved from first schema
        type: [String],
        default: []
    },
    chronicConditions: {  // From second schema
        type: [String],
        default: []
    },
    currentMedications: {
        type: [String],
        default: []
    },
    surgeries: {  // From first schema
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
    }
}, {
    timestamps: true,
    _id: false  // Prevents creating a separate ID for this subdocument
});

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
        // Contact information fields from both schemas
        phone: {
            type: String
        },
        contact: {
            type: String,
            default: ""
        },
        emergencyContact: {
            type: String,
            default: ""
        },
        // Support both address formats
        address: {
            type: mongoose.Schema.Types.Mixed,  // Can be either string or object
            default: "",
            get: function(addr: any) {
                return addr;
            },
            set: function(addr: any) {
                // If it's a string and not empty, convert to object structure
                if (typeof addr === 'string' && addr.trim() !== '') {
                    return {
                        street: addr,
                        city: "",
                        state: "",
                        zipCode: "",
                        country: ""
                    };
                }
                return addr;
            }
        },
        // Last online timestamp from second schema
        lastOnline: {
            type: Date,
            default: Date.now
        },
        // Doctor-specific information from first schema
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
        // Enhanced medical info using the comprehensive schema
        medicalInfo: {
            type: medicalInfoSchema,
            default: () => ({})
        },
        // Status fields from first schema
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