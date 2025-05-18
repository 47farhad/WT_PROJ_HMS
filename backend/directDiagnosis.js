// directDiagnosis.js - Run this with Node.js directly
// Save this as a separate file in your project root

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get MongoDB connection string from environment or use default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yourDBName';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define a simple schema that matches your User model's structure
const UserSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  userType: String,
  password: String,
  profilePic: String,
  phone: String,
  isActive: Boolean,
  doctorInfo: mongoose.Schema.Types.Mixed,
  // Add any other fields you need - this is just a basic version
}, { strict: false });  // Use strict: false to allow querying all fields even if not defined here

// Create a model for direct querying
const User = mongoose.model('User', UserSchema);

async function runDiagnostics() {
  try {
    console.log('\n===== DATABASE DIAGNOSTICS =====\n');
    
    // 1. Check connection and database
    console.log(`Connected to database: ${mongoose.connection.name}`);
    
    // 2. List all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // 3. Count total documents in the users collection
    const userCollection = collections.find(c => c.name.toLowerCase() === 'users');
    const userCollectionName = userCollection ? userCollection.name : 'users';
    
    const totalUsers = await User.countDocuments();
    console.log(`\nTotal documents in "${userCollectionName}" collection: ${totalUsers}`);
    
    // 4. Show all unique userType values
    const userTypes = await User.distinct('userType');
    console.log('\nUnique userType values:');
    console.log(userTypes);
    
    // 5. Look for users with 'Doctor' userType (exact match)
    const exactDoctors = await User.find({ userType: 'Doctor' });
    console.log(`\nUsers with userType exactly "Doctor": ${exactDoctors.length}`);
    
    if (exactDoctors.length > 0) {
      console.log('\nSample Doctor:');
      const sampleDoctor = exactDoctors[0];
      console.log({
        _id: sampleDoctor._id,
        name: `${sampleDoctor.firstName} ${sampleDoctor.lastName}`,
        email: sampleDoctor.email,
        userType: sampleDoctor.userType,
        hasDoctorInfo: Boolean(sampleDoctor.doctorInfo),
        doctorInfoKeys: sampleDoctor.doctorInfo ? Object.keys(sampleDoctor.doctorInfo) : []
      });
    }
    
    // 6. Try case-insensitive search
    const caseInsensitiveDoctors = await User.find({ 
      userType: { $regex: new RegExp('doctor', 'i') } 
    });
    console.log(`\nUsers with userType matching "doctor" (case-insensitive): ${caseInsensitiveDoctors.length}`);
    
    // 7. Look for users with doctorInfo field
    const usersWithDoctorInfo = await User.find({
      'doctorInfo.specialization': { $exists: true }
    });
    console.log(`\nUsers with doctorInfo.specialization field: ${usersWithDoctorInfo.length}`);
    
    // 8. Create a test doctor if needed
    if (exactDoctors.length === 0 && caseInsensitiveDoctors.length === 0 && usersWithDoctorInfo.length === 0) {
      console.log('\nNo doctors found in any format. Creating a test doctor...');
      
      const existingTestDoctor = await User.findOne({ email: 'testdoctor@example.com' });
      
      if (!existingTestDoctor) {
        const newDoctor = new User({
          email: 'testdoctor@example.com',
          firstName: 'Test',
          lastName: 'Doctor',
          userType: 'Doctor',
          password: 'hashedpassword123', // In production, hash this
          doctorInfo: {
            specialization: 'General Medicine',
            qualifications: ['MD'],
            experience: 5,
            department: 'General Medicine',
            isAvailable: true,
            commission: 10,
            workSchedule: [
              {
                day: 'Monday',
                isWorking: true,
                startTime: '09:00',
                endTime: '17:00',
                slotDuration: 30
              }
            ]
          },
          isActive: true
        });
        
        await newDoctor.save();
        console.log('Test doctor created successfully!');
        
        // Verify the doctor was created
        const verifyDoctor = await User.findOne({ email: 'testdoctor@example.com' });
        console.log(`Verification: Test doctor found: ${Boolean(verifyDoctor)}`);
      } else {
        console.log('Test doctor already exists.');
      }
    }
    
    // 9. Check user schema model name
    console.log('\nMongoose model names:');
    console.log(mongoose.modelNames());
    
    // 10. Final check - run the exact query from the controller again
    const finalDoctors = await User.find({ userType: 'Doctor' });
    console.log(`\nFinal check - users with userType exactly "Doctor": ${finalDoctors.length}`);
    
    if (finalDoctors.length > 0) {
      console.log('\nSample doctor IDs:');
      finalDoctors.slice(0, 3).forEach(doc => {
        console.log(`- ${doc._id} (${doc.firstName} ${doc.lastName})`);
      });
    }
    
    console.log('\n===== DIAGNOSTICS COMPLETE =====\n');
    
  } catch (error) {
    console.error('Error running diagnostics:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the diagnostics
runDiagnostics();