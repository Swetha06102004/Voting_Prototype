import React, { useEffect, useState } from 'react';

function AdminRequests() {
  const [registrations, setRegistrations] = useState([]);
  const [edits, setEdits] = useState([]);
  const [deletions, setDeletions] = useState([]);
  const [statusMessages, setStatusMessages] = useState({});

  const fetchRequests = async () => {
    try {
      const [regRes, editRes, delRes] = await Promise.all([
        fetch('http://localhost:3000/admin/requests/registrations'),
        fetch('http://localhost:3000/admin/requests/edits'),
        fetch('http://localhost:3000/admin/requests/deletions'),
      ]);

      const regData = await regRes.json();
      const editData = await editRes.json();
      const delData = await delRes.json();

      setRegistrations(regData);
      setEdits(editData);
      setDeletions(delData);
      setStatusMessages({});
    } catch (err) {
      console.error('Error fetching admin requests:', err);
      setStatusMessages({ global: 'Error fetching admin requests.' });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (type, id, action) => {
    const url = `http://localhost:3000/admin/${type}/${id}/${action}`;
    try {
      const res = await fetch(url, { method: 'PUT' });
      const data = await res.json();
      setStatusMessages(prev => ({ ...prev, [id]: data.message }));
      fetchRequests(); // Refresh after action
    } catch (err) {
      console.error('Error processing request:', err);
      setStatusMessages(prev => ({ ...prev, [id]: 'Error processing request.' }));
    }
  };

  const renderRequests = (requests, type) => {
    return requests.map((req) => (
      <div key={req._id} style={styles.card}>
        <p><strong>Name:</strong> {req.name}</p>
        <p><strong>Voter ID:</strong> {req.voterid}</p>

        {type === 'deletion' ? (
          req.certificate && (
            <img
              src={`http://localhost:3000/uploads/${req.certificate}`}
              alt="Death Certificate"
              style={styles.image}
            />
          )
        ) : (
          req.photo && (
            <img
              src={`http://localhost:3000/uploads/${req.photo}`}
              alt="Voter"
              style={styles.image}
            />
          )
        )}

        <div style={styles.buttonRow}>
          <button onClick={() => handleAction(type, req._id, 'approve')} style={styles.approve}>Approve</button>
          <button onClick={() => handleAction(type, req._id, 'reject')} style={styles.reject}>Reject</button>
        </div>

        {statusMessages[req._id] && (
          <p style={styles.message}>{statusMessages[req._id]}</p>
        )}
      </div>
    ));
  };

  return (
    <div style={styles.wrapper}>
      <h2>Admin Requests</h2>

      {statusMessages.global && <p style={styles.error}>{statusMessages.global}</p>}

      <section>
        <h3>Registration Requests</h3>
        {registrations.length > 0
          ? renderRequests(registrations, 'registration')
          : <p>No pending registrations.</p>}
      </section>

      <section>
        <h3>Edit Requests</h3>
        {edits.length > 0
          ? renderRequests(edits, 'edit')
          : <p>No pending edits.</p>}
      </section>

      <section>
        <h3>Delete Requests</h3>
        {deletions.length > 0
          ? renderRequests(deletions, 'deletion')
          : <p>No pending deletions.</p>}
      </section>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: '20px',
    fontFamily: 'Poppins, sans-serif',
  },
  card: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    backgroundColor: '#f9f9f9',
  },
  image: {
    maxWidth: '150px',
    marginTop: '10px',
  },
  buttonRow: {
    marginTop: '10px',
    display: 'flex',
    gap: '10px',
  },
  approve: {
    padding: '6px 12px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
  },
  reject: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
  },
  message: {
    marginTop: '10px',
    fontSize: '14px',
    color: '#333',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
};

export default AdminRequests;
