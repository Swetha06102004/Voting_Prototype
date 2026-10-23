const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcrypt');

const Candidate = require('./models/candidate');
const Admin = require('./models/admin');
const DeletedVoter = require('./models/deletedVoter');
const Registration = require('./models/registration');
const PendingRegistration = require('./models/pendingRegistration');
const Vote = require('./models/vote');

const votingStartTime = new Date('2025-07-11T09:00:00');
const votingEndTime = new Date('2025-07-12T09:00:00'); 

const app = express();

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/voterRegistration', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Ensure upload directories exist
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
if (!fs.existsSync('./certificates')) fs.mkdirSync('./certificates');

// Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use('/certificates', express.static('certificates'));

// Multer setup
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const certStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'certificates/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const uploadPhoto = multer({ storage: photoStorage });
const uploadCert = multer({ storage: certStorage });


// ✅ Admin Login Route
app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin) return res.status(401).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    return res.status(200).json({ message: 'Login successful', role: admin.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ✅ Voter Registration (Pending)
app.post('/register', uploadPhoto.single('photo'), async (req, res) => {
  try {
    const { name, dob, aadhar, voterid, gender, state, district, subdivision, mobile } = req.body;
    const photo = req.file ? req.file.filename : '';

    const pending = new PendingRegistration({
      name, dob, aadhar, voterid, gender, state, district, subdivision, mobile, photo
    });

    await pending.save();
    res.status(200).json({ message: 'Registration submitted for approval.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving pending registration.' });
  }
});

// ✅ Admin: Get All Pending Voters
app.get('/admin/requests', async (req, res) => {
  try {
    const pending = await PendingRegistration.find();
    res.status(200).json(pending);
  } catch (err) {
    console.error('Error fetching pending registrations:', err);
    res.status(500).json({ message: 'Error fetching pending registrations' });
  }
});

// ✅ Admin: Approve Voter
app.put('/admin/approve/:id', async (req, res) => {
  try {
    const pending = await PendingRegistration.findById(req.params.id);
    if (!pending) return res.status(404).json({ message: 'Pending record not found' });

    const approvedData = pending.toObject();
    approvedData.status = 'approved';
    delete approvedData._id;  

    const approved = new Registration(approvedData);
    await approved.save();
    await PendingRegistration.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Voter approved and added to main list.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error during approval' });
  }
});

// ✅ Admin: Reject Voter
app.put('/admin/reject/:id', async (req, res) => {
  try {
    await PendingRegistration.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Registration rejected and deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error during rejection' });
  }
});

// ✅ Voter Sign-In
app.post('/signin', async (req, res) => {
  try {
    const { voterid, mobile } = req.body;
    const voter = await Registration.findOne({ voterid, mobile });

    if (!voter) return res.status(401).json({ message: 'Voter not found or mobile mismatch' });
    if (voter.status !== 'approved') return res.status(403).json({ message: 'Voter not approved yet' });

    res.status(200).json({ message: 'OTP sent successfully', subdivision: voter.subdivision });
  } catch (error) {
    console.error('Error in /signin:', error);
    res.status(500).json({ message: 'Server error during sign in' });
  }
});

// ✅ DC Admin: Find Voter by Aadhar
app.get('/dcadmin/find/:aadhar', async (req, res) => {
  try {
    const { aadhar } = req.params;
    const voter = await Registration.findOne({ aadhar });

    if (!voter) return res.status(404).json({ message: 'Voter not found' });

    res.status(200).json(voter);
  } catch (error) {
    console.error('Error finding voter:', error);
    res.status(500).json({ message: 'Server error while searching voter' });
  }
});

// ✅ DC Admin: Delete and Archive Voter
app.delete('/dcadmin/delete/:aadhar', async (req, res) => {
  try {
    const aadhar = req.params.aadhar;
    const voter = await Registration.findOne({ aadhar });
    if (!voter) return res.status(404).json({ message: 'Voter not found' });

    const deleted = new DeletedVoter({ ...voter.toObject(), deletedAt: new Date() });
    await deleted.save();
    await Registration.deleteOne({ aadhar });

    res.status(200).json({ message: 'Voter deleted and archived successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting voter' });
  }
});

// ✅ DC Admin: Get All Deleted Voters
app.get('/dcadmin/deleted-voters', async (req, res) => {
  try {
    const deletedVoters = await DeletedVoter.find().sort({ deletedAt: -1 });
    res.status(200).json(deletedVoters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching deleted voters' });
  }
});
// ✅ Get voter profile by Voter ID
app.get('/profile/:voterid', async (req, res) => {
  try {
    const { voterid } = req.params;
    const voter = await Registration.findOne({ voterid });

    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

    res.status(200).json(voter);
  } catch (error) {
    console.error('Error fetching voter profile:', error);
    res.status(500).json({ message: 'Server error while fetching voter profile' });
  }
});

// ✅ Get candidates by subdivision
app.get('/candidates/:subdivision', async (req, res) => {
  try {
    const { subdivision } = req.params;
    const candidates = await Candidate.find({ subdivision });

    if (!candidates.length) {
      return res.status(404).json({ message: 'No candidates found for this subdivision' });
    }

    res.status(200).json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: 'Server error while fetching candidates' });
  }
});

// ✅ Submit Vote
app.post('/vote', async (req, res) => {
  try {
    const { voterid, candidateName, subdivision } = req.body;

    // Prevent double voting
    const existing = await Vote.findOne({ voterid });
    if (existing) {
      return res.status(400).json({ message: 'You have already voted.' });
    }

    // Save vote
    const vote = new Vote({ voterid, candidateName, subdivision });
    await vote.save();

    res.status(200).json({ message: 'Vote successfully recorded.' });
  } catch (err) {
    console.error('Vote Error:', err);
    res.status(500).json({ message: 'Server error while submitting vote.' });
  }
});

app.get('/voting-time-status', (req, res) => {
  const now = new Date();
  if (now < votingStartTime) {
    res.json({ status: 'not_started' });
  } else if (now >= votingStartTime && now < votingEndTime) {
    res.json({ status: 'ongoing' });
  } else {
    res.json({ status: 'ended' });
  }
});

app.get('/voting-end-time', (req, res) => {
  res.json({ endTime: votingEndTime });
});

// ✅ Server Start
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
