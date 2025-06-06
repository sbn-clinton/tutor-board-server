// routes/userRoutes.js
import express from 'express';
import upload from '../config/multer.js';
import { ensureParent, ensureAuth } from '../middleware/authMiddleware.js';
import { updateParentPicture, updateParentProfile, updateParentChildren } from '../controllers/parentController.js';
import { getParentProfilePicture } from '../controllers/parentController.js';
import ParentSchema from '../models/ParentSchema.js';

const router = express.Router();

router.put(
  '/profile',
  ensureAuth,
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'certificates', maxCount: 5 },
  ]),
  // updateProfile
);
router.put('/update-profile',ensureParent,   updateParentProfile);
router.put('/update-picture',ensureParent, upload.fields([{ name: 'profileImage', maxCount: 1 }]), updateParentPicture);
router.get('/profile-image/:parentId', getParentProfilePicture)
router.put('/update-children',ensureParent,  updateParentChildren);
router.delete('/delete-child/:childId', ensureParent, async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await ParentSchema.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const childId = req.params.childId;

    user.children = user.children.filter(
      (child) => child._id.toString() !== childId
    );

    await user.save();

    res.json({ message: 'Child deleted successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


export default router;
