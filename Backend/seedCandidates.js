const mongoose = require('mongoose');
const Candidate = require('./models/candidate');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/voterRegistration', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const candidatesData = [
  {
    candidateName: 'Arun Kumar',
    partyName: 'AIADMK',
    symbol: 'aiadmk-symbol.png',
    subdivision: 'Anna Nagar',
    votes: 0,
  },
  {
    candidateName: 'Priya Selvan',
    partyName: 'DMK',
    symbol: 'dmk-symbol.png',
    subdivision: 'Anna Nagar',
    votes: 0,
  },
  {
    candidateName: 'Ramesh Nair',
    partyName: 'Congress',
    symbol: 'congress-symbol.png',
    subdivision: 'Coimbatore North',
    votes: 0,
  },
  {
    candidateName: 'Lakshmi Devi',
    partyName: 'BJP',
    symbol: 'bjp-symbol.png',
    subdivision: 'Coimbatore North',
    votes: 0,
  },
  {
    candidateName: 'Gopi Chandran',
    partyName: 'DMK',
    symbol: 'dmk-symbol.png',
    subdivision: 'Madurai',
    votes: 0,
  },
  {
    candidateName: 'Anitha Kannan',
    partyName: 'AIADMK',
    symbol: 'aiadmk-symbol.png',
    subdivision: 'Madurai',
    votes: 0,
  },
  {
    candidateName: 'Suresh Kumar',
    partyName: 'Congress',
    symbol: 'congress-symbol.png',
    subdivision: 'Tiruchirappalli East',
    votes: 0,
  },
  {
    candidateName: 'Meena Priya',
    partyName: 'BJP',
    symbol: 'bjp-symbol.png',
    subdivision: 'Tiruchirappalli East',
    votes: 0,
  },
];

// Insert candidates
async function seedCandidates() {
  try {
    await Candidate.deleteMany(); // Clear old candidates if any
    await Candidate.insertMany(candidatesData);
    console.log('Candidates seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding candidates:', error);
  }
}

seedCandidates();
