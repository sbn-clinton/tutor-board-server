import mongoose from 'mongoose';

const workExperienceSchema = new mongoose.Schema({
  schoolName: String,
  role: String,
  period: String,
  description: String,
});

const imageSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
});

const fileSchema = new mongoose.Schema({
  certName: String,
  schoolName: String,
  year: String,
  data: Buffer,
  contentType: String,
});

const tutorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,
  googleId: String,
  role: { type: String, default: 'tutor', required: true },
  
  phone: String,
  location: String,
  bio: String,
  subjects: [String],
  availableDays: [String], // ✅ NEW FIELD: array of available days
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],

  profileImage: imageSchema,        // ✅ saved in MongoDB as binary
  certificates: [fileSchema],       // ✅ multiple certificates as binary
  workExperiences: [workExperienceSchema],
}, { timestamps: true });

export default mongoose.model('TutorSchema', tutorSchema);
