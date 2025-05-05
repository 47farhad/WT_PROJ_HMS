import mongoose from "mongoose";

const labTestSchema = new mongoose.Schema({
    datetime: {
    type: Date,
    required: true,
    }
},
    {
        timestamps: true
      }

);
    export default mongoose.model('Lab Test', labTestSchema);