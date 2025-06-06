 import TutorSchema from '../models/TutorSchema.js';
 import ParentSchema from '../models/ParentSchema.js'; // adjust if needed
 import Review from '../models/ReviewSchema.js';  
 
 export const createReview =async (req, res) => {
  const { rating, comment, tutorId, userId } = req.body;

  if (!rating || !comment || !tutorId || !userId) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Optional: Check if the tutor and user exist
    const tutor = await TutorSchema.findById(tutorId);
    const user = await ParentSchema.findById(userId);

    if (userId !== req.user.id) {
      return res.status(401).json({ message: 'You are not authorized to perform this action' });
    }
    if (!tutor || !user) {
      return res.status(404).json({ message: 'Tutor or User not found' });
    }


    const review = await Review.create({
  rating,
  comment,
  tutor: tutor,
  parent: user,
});

await TutorSchema.findByIdAndUpdate(tutorId, {
  $push: { reviews: review._id }
});


    res.status(200).json({ message: 'Review submitted', review });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}