import mongoose from "mongoose";

const loggingSchema = new mongoose.Schema({

  adminId:{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true, 
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true, 
  },

  userType: {
    type: String, 
    required: true, 
  },

}, { 
  timestamps: true, 
});

const userUpdatelogsModel = mongoose.model("userUpdateLogs", loggingSchema);

export default userUpdatelogsModel;