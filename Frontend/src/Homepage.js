import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import homeImage from './assets/home.jpg';

const HomePage = () => {
  const navigate = useNavigate();
  const [votingStatus, setVotingStatus] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/voting-time-status')
      .then((res) => res.json())
      .then((data) => setVotingStatus(data.status))
      .catch(() => setVotingStatus('error'));
  }, []);

  // Admin login shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        navigate('/admin-login');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.overlay}>
        <h1 style={styles.heading}>Welcome to the Online Voting Portal</h1>
        <p style={styles.subText}>Choose an option below to get started</p>

        <div style={styles.buttonContainer}>
          <button style={styles.button} onClick={() => navigate('/registration')}>
            Register as Voter
          </button>

          <button style={styles.button} onClick={() => navigate('/sign-in')}>
            Sign In
          </button>

          {/* ✅ Show this only if voting has ended */}
          {votingStatus === 'ended' && (
            <button
              style={{ ...styles.button, backgroundColor: 'black' }}
              onClick={() => navigate('/result-dashboard')}
            >
              View Results
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundImage: `url(${homeImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '0 20px',
  },
  overlay: {
    padding: '40px',
    borderRadius: '12px',
    textAlign: 'center',
    color: '#fff',
    maxWidth: '90%',
  },
  heading: {
    fontSize: '42px',
    marginBottom: '50px',
    color: '#1b4f72',
  },
  subText: {
    fontSize: '30px',
    marginBottom: '50px',
    color: '#1b4f72',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  button: {
    padding: '15px 30px',
    fontSize: '16px',
    backgroundColor: 'black',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default HomePage;
