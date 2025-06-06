// config/multer.js
import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const { fieldname, mimetype } = file;

  // Profile image: only allow jpg, jpeg, png
  if (fieldname === 'profileImage') {
    if (['image/jpeg', 'image/jpg', 'image/png'].includes(mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, or PNG images are allowed for profileImage'), false);
    }
  }

  // Certificates: only allow pdf and docx
  else if (fieldname === 'certificates') {
    if (['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or DOCX files are allowed for certificates'), false);
    }
  }

  // Any other field is rejected
  else {
    cb(new Error(`Invalid field: ${fieldname}`), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
