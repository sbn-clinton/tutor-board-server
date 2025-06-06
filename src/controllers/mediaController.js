// controllers/mediaController.js
import User from '../models/User.js';
import TutorProfile from '../models/TutorProfile.js';

export const getProfileImage = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) return res.status(404).send('User not found');

    if (user.role === 'tutor') {
      const profile = await TutorProfile.findOne({ user: userId });
      if (!profile || !profile.profileImage?.data) return res.status(404).send('Image not found');
      res.contentType(profile.profileImage.contentType);
      return res.send(profile.profileImage.data);
    }

    if (!user.profileImage?.data) return res.status(404).send('Image not found');
    res.contentType(user.profileImage.contentType);
    return res.send(user.profileImage.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const getCertificate = async (req, res) => {
  try {
    const { userId, index } = req.params;
    const profile = await TutorProfile.findOne({ user: userId });

    if (!profile || !profile.certificates || !profile.certificates[index]) {
      return res.status(404).send('Certificate not found');
    }

    const cert = profile.certificates[index];
    res.contentType(cert.contentType);
    return res.send(cert.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
