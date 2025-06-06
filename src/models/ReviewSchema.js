import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TutorSchema',
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParentSchema',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema); // ✅ use 'Review'

