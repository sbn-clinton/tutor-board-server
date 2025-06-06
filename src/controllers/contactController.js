import transporter from '../config/nodemailer.js';
import TutorSchema from '../models/TutorSchema.js';

export const contactTutor = async (req, res) => {
  try {
    const { tutorId, message, fullName, email, phone } = req.body;
    const parent = req.user;

    if (fullName !== parent.fullName || email !== parent.email || phone !== parent.phone) {
      return res.status(400).json({ error: 'Invalid parent details' });
    }

    const tutor = await TutorSchema.findById(tutorId);

    if (!tutor || tutor.role !== 'tutor') {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    await transporter.sendMail({
      from: `"${parent.fullName}" <${process.env.EMAIL_USER}>`,
      to: tutor.email,
      subject: 'Message from a parent on Home Tutor Finder',
      text: `You received a message from a parent (${parent.fullName}, ${parent.email}, ${parent.phone}):\n\n${message}`,
    });

    res.json({ success: true, message: 'Email sent to tutor successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send email' });
  }
};
