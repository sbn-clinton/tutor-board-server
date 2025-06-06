// routes/tutorRoutes.js
import express from 'express';
import upload from '../config/multer.js';
import { ensureAuth, ensureTutor } from '../middleware/authMiddleware.js';
import { updateTutorProfile, updateTutorPicture, tutorSubjects, tutorWorkExperiences, tutorCertificates, getAllTutors, getTutorById, getTutorProfilePicture, deleteTutorSubject, deleteTutorWorkExperience, getCertificate, updateAvailableDays } from '../controllers/tutorControllers.js';


const router = express.Router();

// Upload image and one or more certificates
const uploadFields = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'certificates', maxCount: 5 }
]);

router.get('/profile-image/:tutorId',getTutorProfilePicture)
router.get("/all",  getAllTutors);
router.get("/:id", getTutorById);
router.put('/update-profile',ensureTutor, updateTutorProfile);
router.put('/update-picture',ensureTutor, upload.fields([{ name: 'profileImage', maxCount: 1 }]), updateTutorPicture);
router.put('/update-subjects',ensureTutor, tutorSubjects);
router.delete('/update-subjects/:subject',ensureTutor, deleteTutorSubject);
router.put('/update-work-experiences',ensureTutor, tutorWorkExperiences);
router.delete('/update-work-experiences/:experienceId',ensureTutor, deleteTutorWorkExperience);
router.put('/update-certificates',ensureTutor, upload.fields([{ name: 'certificates', maxCount: 5 }]), tutorCertificates);
router.get("/certificates/:certId", ensureAuth, getCertificate);
router.put('/available-days', ensureTutor, updateAvailableDays);



export default router;
