import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Component imports
import HomePage from './Homepage';
import Registration from './Registration';
import SignIn from './SignIn';
import ResultDashboard from './ResultDashboard';
import VotePage from './VotePage';
import EditProfile from './EditProfile';
import VoterAction from './VoterAction';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import AdminRequest from './AdminRequest';
import DCDashBoard from './DCDashBoard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-request" element={<AdminRequest />} />

        {/* DC Admin Route */}
        <Route path="/dc-dashboard" element={<DCDashBoard />} />

        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/result-dashboard" element={<ResultDashboard />} />
        <Route path="/voter-action" element={<VoterAction />} />
        <Route path="/vote-page" element={<VotePage />} />
        <Route path="/edit-profile" element={<EditProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
