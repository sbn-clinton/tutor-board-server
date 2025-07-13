// controllers/tutorController.js

import TutorSchema from "../models/TutorSchema.js";


export const getAllTutors = async (req, res) => {
  try {
    const tutors = await TutorSchema.find()
      .populate({
        path: 'reviews',
        select: 'rating', // only get the `rating` field from each review
      }).select(' -password');

    res.json(tutors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const getTutorById = async (req, res) => {
  try {
    // Get tutor by ID
    // req.params.id is the ID of the tutor to be retrieved
    const tutorId = req.params.id;
    const tutor = await TutorSchema.findById(tutorId)
  .populate({
    path: 'reviews',
    populate: {
      path: 'parent',
      select: 'fullName',
    },
    select: 'rating comment createdAt parent',
  }).select(' -password');

    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });
    res.json(tutor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};  

export const getTutorProfilePicture = async (req, res) => {
  try {
    const tutor = await TutorSchema.findById(req.params.tutorId).select(' -password');

    if (!tutor || !tutor.profileImage || !tutor.profileImage.data) {
      return res.status(404).send('No image found');
    }
   console.log("Tutor profileImage object:", tutor?.profileImage);

    res.set('Content-Type', tutor.profileImage.contentType);
    res.send(tutor.profileImage.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
}


export const updateTutorProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await TutorSchema.findById(userId).select(' -password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { fullName, email, phone, location, bio } = req.body;
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (bio) user.bio = bio;

    await user.save();
    res.json({ message: 'Tutor profile updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateTutorPicture = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    const user = await TutorSchema.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("User ID from auth:", userId);
    console.log("Incoming files:", req.files);

    const file = req?.files?.profileImage?.[0];
    if (!file) {
      return res.status(400).json({ message: 'No profile image uploaded' });
    }

    // Save profile image as per your schema
    user.profileImage = {
      data: file.buffer,
      contentType: file.mimetype,
    };

    await user.save();

    res.json({
      message: 'Tutor profile picture updated successfully',
      user,
    });
  } catch (err) {
    console.error("Error updating tutor picture:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};


//Subjects
export const tutorSubjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject } = req.body;

    if (!subject) return res.status(400).json({ message: 'Subject is required' });

    const user = await TutorSchema.findById(userId).select(' -password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.subjects.includes(subject)) {
      user.subjects.push(subject);
      await user.save();
    }

    res.json({ message: 'Subject added successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateTutorSubject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldSubject, newSubject } = req.body;

    if (!oldSubject || !newSubject) {
      return res.status(400).json({ message: 'Both oldSubject and newSubject are required' });
    }

    const user = await TutorSchema.findById(userId).select(' -password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const index = user.subjects.indexOf(oldSubject);
    if (index === -1) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    user.subjects[index] = newSubject;
    await user.save();

    res.json({ message: 'Subject updated successfully', subjects: user.subjects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const deleteTutorSubject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject } = req.params;

    const user = await TutorSchema.findById(userId).select(' -password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const originalLength = user.subjects.length;
    user.subjects = user.subjects.filter((s) => s !== subject);

    if (user.subjects.length === originalLength) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await user.save();
    res.json({ message: 'Subject deleted successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};



//Experiences
export const tutorWorkExperiences = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await TutorSchema.findById(userId).select(' -password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { schoolName, role, period, description } = req.body;

    // Validate required fields (optional)
    // if (!schoolName || !role || !startDate || !endDate || !description) {
    //   return res.status(400).json({ message: 'All fields are required' });
    // }

    const newExperience = {
      schoolName,
      role,
      period,
      description,
    };

    // Ensure workExperiences is an array
    if (!Array.isArray(user.workExperiences)) {
      user.workExperiences = [];
    }

    // Add new experience
    user.workExperiences.push(newExperience);

    await user.save();

    res.json({ message: 'Tutor work experience added successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateTutorWorkExperience = async (req, res) => {
  try {
    const userId = req.user.id;
    const { experienceId } = req.params;
    const { schoolName, role, startDate, endDate, description } = req.body;

    const user = await TutorSchema.findById(userId).select(' -password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const experience = user.workExperiences.id(experienceId);
    if (!experience) {
      return res.status(404).json({ message: 'Work experience not found' });
    }

    if (schoolName) experience.schoolName = schoolName;
    if (role) experience.role = role;
    if (startDate) experience.startDate = startDate;
    if (endDate) experience.endDate = endDate;
    if (description) experience.description = description;

    await user.save();
    res.json({ message: 'Work experience updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteTutorWorkExperience = async (req, res) => {
   try {
    const userId = req.user.id; // From auth middleware
    const experienceId = req.params.experienceId;

    const user = await TutorSchema.findById(userId).select(' -password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Filter out the experience to delete
    user.workExperiences = user.workExperiences.filter(
      (exp) => exp._id.toString() !== experienceId
    );

    await user.save();

    res.json({ message: 'Work experience deleted successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};



//Certificates
export const tutorCertificates = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await TutorSchema.findById(userId).select(' -password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { certName, schoolName, year } = req.body;

    

    // Ensure certificates is an array
    if (!Array.isArray(user.certificates)) {
      user.certificates = [];
    }

    // Add each uploaded file as a certificate entry
    req.files.certificates.forEach((file) => {
      user.certificates.push({
        certName,
        schoolName,
        year,
        data: file.buffer,
        contentType: file.mimetype,
      });
    });

    await user.save();
    res.json({ message: 'Tutor certificate(s) added successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateTutorCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { certificateId } = req.params; // passed as URL param
    const { certName, schoolName, year } = req.body;
    const file = req.files?.certificates?.[0];

    const user = await TutorSchema.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const certificate = user.certificates.id(certificateId);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    if (certName) certificate.certName = certName;
    if (schoolName) certificate.schoolName = schoolName;
    if (year) certificate.year = year;
    if (file) {
      certificate.data = file.buffer;
      certificate.contentType = file.mimetype;
    }

    await user.save();
    res.json({ message: 'Certificate updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteTutorCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { certificateId } = req.params;

    const user = await TutorSchema.findById(userId).select(' -password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const certificate = user.certificates.id(certificateId);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    certificate.remove();
    await user.save();

    res.json({ message: 'Certificate deleted successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getCertificate = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { certId } = req.params;

    const user = await TutorSchema.findById(userId).select(' -password');
    if (!user) return res.status(404).json({ message: "User not found" });

    const cert = user.certificates.id(certId); // find cert by subdocument ID
    if (!cert) return res.status(404).json({ message: "Certificate not found" });

    res.set("Content-Type", cert.contentType);
    res.send(cert.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving certificate" });
  }
};


//Available Days
export const updateAvailableDays = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { availableDays } = req.body;

    const user = await TutorSchema.findById(userId).select(' -password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!Array.isArray(availableDays)) {
      return res.status(400).json({ message: 'Available days must be an array' });
    }

    user.availableDays = availableDays;
    await user.save();

    res.json({ message: 'Available days updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};