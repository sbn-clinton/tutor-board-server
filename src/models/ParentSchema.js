// models/ParentSchema.js
import mongoose from 'mongoose';


const imageSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
});

const childSchema = new mongoose.Schema({
    name: String,
    age: Number,
    grade: String,
    school: String,
    subjects: [String],
});

const parentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,
  googleId: String,
  role: { type: String, default: 'parent', required: true },
    
  phone: String,
  location: String,
  about: String,
  profileImage: imageSchema, // ✅ saved in MongoDB as binary
  children: [childSchema],
}, { timestamps: true });

export default mongoose.model('ParentSchema', parentSchema);
