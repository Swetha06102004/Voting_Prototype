import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from './assets/dcadmin-bg.jpg';

function DCDashBoard() {
  const [aadhar, setAadhar] = useState('');
  const [voter, setVoter] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const adminType = localStorage.getItem('adminType');
    if (adminType !== 'dcAdmin') {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleSearch = async () => {
    try {
      const res = await fetch(`http://localhost:3000/dcadmin/find/${aadhar}`);
      const data = await res.json();
      if (res.ok) {
        setVoter(data);
        setMessage('');
        setMessageType('');
      } else {
        setVoter(null);
        setMessage(data.message);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error searching voter:', error);
      setMessage('Server error');
      setMessageType('error');
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this voter's record?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:3000/dcadmin/delete/${aadhar}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setMessageType('success');
        setVoter(null);
        setAadhar('');
      } else {
        setMessage(data.message);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error deleting voter:', error);
      setMessage('Server error');
      setMessageType('error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('adminType');
    setMessage('Logged out successfully');
    setMessageType('success');
    setTimeout(() => navigate('/'), 1000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <h2 style={styles.heading}>DC Admin — Delete Voter by Aadhar</h2>
        <input
          type="text"
          value={aadhar}
          placeholder="Enter Aadhar Number"
          onChange={(e) => setAadhar(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleSearch} style={{ ...styles.button, ...styles.searchButton }}>
          Search
        </button>
        <button onClick={handleLogout} style={{ ...styles.button, ...styles.logoutButton }}>
          Logout
        </button>
        {message && (
          <p
            style={{
              ...styles.messageBox,
              backgroundColor: messageType === 'error' ? '#f8d7da' : '#d4edda',
              color: messageType === 'error' ? '#721c24' : '#155724',
              borderColor: messageType === 'error' ? '#f5c6cb' : '#c3e6cb',
            }}
          >
            {message}
          </p>
        )}
      </div>

      {voter && (
        <div style={styles.voterCard}>
          <h3>Voter Details</h3>
          <p style={styles.fieldLabel}><strong>Name:</strong> {voter.name}</p>
          <p style={styles.fieldLabel}><strong>Voter ID:</strong> {voter.voterid}</p>
          <p style={styles.fieldLabel}><strong>Gender:</strong> {voter.gender}</p>
          <p style={styles.fieldLabel}><strong>Mobile:</strong> {voter.mobile}</p>
          <p style={styles.fieldLabel}><strong>State:</strong> {voter.state}</p>
          <p style={styles.fieldLabel}><strong>District:</strong> {voter.district}</p>
          <p style={styles.fieldLabel}><strong>Subdivision:</strong> {voter.subdivision}</p>
          <img
            src={`http://localhost:3000/uploads/${voter.photo}`}
            alt="voter"
            width="150"
            style={{ marginTop: '10px', borderRadius: '8px' }}
          /><br /><br />
          <button onClick={handleDelete} style={styles.deleteButton}>
            Delete Voter
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
    container: {
      height: '100vh',
      width: '100%',
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      overflowY: 'auto',
      fontFamily: 'Segoe UI, sans-serif',
    },
    topBar: {
      marginBottom: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    heading: {
      fontSize: '26px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#222',
    },
    input: {
      padding: '10px',
      width: '300px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '16px',
      marginBottom: '10px',
    },
    button: {
      padding: '10px 20px',
      fontSize: '16px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      marginBottom: '10px',
    },
    searchButton: {
      backgroundColor: '#4CAF50',
      color: '#fff',
    },
    logoutButton: {
      backgroundColor: '#f44336',
      color: '#fff',
    },
    voterCard: {
      marginTop: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '12px',
      padding: '25px',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
      color: '#333',
    },
    fieldLabel: {
      fontWeight: 'bold',
      color: '#555',
    },
    deleteButton: {
      marginTop: '15px',
      padding: '10px 20px',
      fontSize: '16px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: '#dc3545',
      color: '#fff',
      cursor: 'pointer',
    },
    messageBox: {
      marginTop: '20px',
      fontWeight: 'bold',
      fontSize: '16px',
      padding: '10px 15px',
      borderRadius: '6px',
      textAlign: 'center',
      maxWidth: '400px',
      border: '1px solid transparent',
    },
  };
  
export default DCDashBoard;
