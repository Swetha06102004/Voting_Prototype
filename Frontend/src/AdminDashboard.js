import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from './assets/ecadmin-bg.jpg';

function AdminDashboard() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [statusMessages, setStatusMessages] = useState({});

  useEffect(() => {
    const adminType = localStorage.getItem('adminType');
    if (adminType !== 'electionAdmin') {
      navigate('/admin-login');
    } else {
      fetchPendingData();
    }
  }, [navigate]);

  const fetchPendingData = async () => {
    try {
      const res = await fetch('http://localhost:3000/admin/requests');
      const data = await res.json();
      setRegistrations(data);
      setStatusMessages({});
    } catch (err) {
      console.error(err);
      setStatusMessages({ global: 'Error loading pending data' });
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/admin/approve/${id}`, {
        method: 'PUT',
      });
      const data = await res.json();
      setStatusMessages(prev => ({ ...prev, [id]: data.message }));
      fetchPendingData();
    } catch (err) {
      console.error(err);
      setStatusMessages(prev => ({ ...prev, [id]: 'Approval failed.' }));
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/admin/reject/${id}`, {
        method: 'PUT',
      });
      const data = await res.json();
      setStatusMessages(prev => ({ ...prev, [id]: data.message }));
      fetchPendingData();
    } catch (err) {
      console.error(err);
      setStatusMessages(prev => ({ ...prev, [id]: 'Rejection failed.' }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('adminType');
    setMessage('Logged out successfully');
    setTimeout(() => navigate('/'), 1000);
  };

  const styles = {
    container: {
      height: '100%',
      minHeight: '100vh',
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: '40px 20px',
      overflowY: 'auto',
      fontFamily: 'Segoe UI, sans-serif',
    },
    box: {
      maxWidth: '600px',
      margin: 'auto',
      backgroundColor: '#FAEBD7',
      padding: '30px',
      borderRadius: '12px',
      marginTop:'200px'
    },
    heading: {
      marginBottom: '20px',
      textAlign: 'center',
      color: '#8B4513',
      fontSize: '30px',
      fontWeight: 'bold',
      fontFamily: 'Georgia, serif',
    },
    logoutButton: {
      backgroundColor: '#dc3545',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      padding: '10px 20px',
      cursor: 'pointer',
      marginBottom: '30px',
      float: 'right',
    },
    sectionTitle: {
      fontSize: '22px',
      marginBottom: '20px',
      color: '#333',
    },
    card: {
      background: '#f9f9f9',
      padding: '20px',
      marginBottom: '20px',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    image: {
      borderRadius: '8px',
      marginTop: '10px',
      maxWidth: '100px',
    },
    buttonGroup: {
      marginTop: '15px',
      display: 'flex',
      gap: '10px',
    },
    approveBtn: {
      padding: '8px 16px',
      backgroundColor: '#28a745',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    rejectBtn: {
      padding: '8px 16px',
      backgroundColor: '#f44336',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    statusMsg: {
      marginTop: '10px',
      fontSize: '14px',
      color: '#333',
    },
    error: {
      color: 'red',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
        <h2 style={styles.heading}>Admin Dashboard</h2>

        <h3 style={styles.sectionTitle}>📝 Pending Voter Registrations / Edits</h3>
        {statusMessages.global && <p style={styles.error}>{statusMessages.global}</p>}

        {registrations.length === 0 ? (
          <p>No pending registrations or edits.</p>
        ) : (
          registrations.map((reg) => (
            <div key={reg._id} style={styles.card}>
              <h4>{reg.name} (Voter ID: {reg.voterid})</h4>
              <p>Subdivision: {reg.subdivision}</p>
              <p>Mobile: {reg.mobile}</p>
              <img
                src={`http://localhost:3000/uploads/${reg.photo}`}
                alt="Voter"
                style={styles.image}
              />
              <div style={styles.buttonGroup}>
                <button style={styles.approveBtn} onClick={() => handleApprove(reg._id)}>✅ Approve</button>
                <button style={styles.rejectBtn} onClick={() => handleReject(reg._id)}>❌ Reject</button>
              </div>
              {statusMessages[reg._id] && (
                <p style={styles.statusMsg}>{statusMessages[reg._id]}</p>
              )}
            </div>
          ))
        )}

        {message && <div style={{ color: 'green', marginTop: '20px' }}>{message}</div>}
      </div>
    </div>
  );
}

export default AdminDashboard;
