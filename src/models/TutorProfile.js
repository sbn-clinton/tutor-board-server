// models/TutorProfile.js
import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
  name: String,
});

const tutorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  subject: {
    type: String,
    required: true
  },
  profileImage: {
    data: Buffer,
    contentType: String
  },
  certificates: [certificateSchema],
  workExperience: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model('TutorProfile', tutorProfileSchema);
