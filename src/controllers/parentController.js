// controllers/parentController.js

import ParentSchema from "../models/ParentSchema.js";



export const updateParentProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await ParentSchema.findById(userId).select(' -password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { fullName, email, phone, location, about } = req.body;
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (about) user.about = about;


    await user.save();
    res.json({ message: 'Parent profile updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const updateParentPicture = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await ParentSchema.findById(userId).select(' -password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.files?.profileImage?.[0]) {
      const file = req.files.profileImage[0];
      user.profileImage = {
        data: file.buffer,
        contentType: file.mimetype,
      };
    }

    await user.save();
    res.json({ message: 'Parent profile picture updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getParentProfilePicture = async (req, res) => {
  try {
    const parent = await ParentSchema.findById(req.params.parentId).select('-password');

    if (!parent || !parent.profileImage || !parent.profileImage.data) {
      return res.status(404).send('No image found');
    }

    // Set CORS headers - THIS IS THE KEY FIX
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Set cache headers for better performance
    res.header('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    // Set content type and send image
    res.set('Content-Type', parent.profileImage.contentType);
    res.send(parent.profileImage.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
}

export const updateParentChildren =async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await ParentSchema.findById(userId).select(' -password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, age, grade, school, subjects } = req.body;

    const newChild = {
      name,
      age,
      grade,
      school,
      subjects, // Should be an array of strings
    };

    // Ensure children is an array
    if (!Array.isArray(user.children)) {
      user.children = [];
    }

    // Add new child
    user.children.push(newChild);

    await user.save();

    res.json({ message: 'Child added successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
