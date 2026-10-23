import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './VoterAction.css';

function VoterAction() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { voterid } = state || {};
  const [voter, setVoter] = useState(null);
  const [error, setError] = useState('');
  const [votingEnded, setVotingEnded] = useState(false);

  useEffect(() => {
    if (!voterid) {
      navigate('/sign-in');
      return;
    }

    const fetchVoter = async () => {
      try {
        const res = await fetch(`http://localhost:3000/profile/${voterid}`);
        const data = await res.json();
        if (res.ok) setVoter(data);
        else setError('Voter not found');
      } catch (err) {
        setError('Server error while fetching voter');
      }
    };

    fetchVoter();

    // 🔁 Check if voting has ended
    fetch('http://localhost:3000/voting-time-status')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ended') {
          setVotingEnded(true);
        }
      })
      .catch(() => {
        console.warn('Could not fetch voting time status');
      });
  }, [voterid, navigate]);

  if (error) return <div className="voter-error">{error}</div>;
  if (!voter) return <div className="voter-loading">Loading voter...</div>;

  return (
    <div className="voter-page">
      <div className="voter-action-wrapper">
        <h2>Welcome, {voter.name}</h2>
        <div className="voter-info">
          <p><strong>Voter ID:</strong> {voter.voterid}</p>
          {voter.photo && (
            <img src={`http://localhost:3000/uploads/${voter.photo}`} alt="Voter" />
          )}
        </div>
        <div className="voter-buttons">
          <button
            onClick={() => navigate('/vote-page', { state: { voterid } })}
            disabled={votingEnded}
          >
            {votingEnded ? 'Voting Closed' : 'Vote'}
          </button>
          <button onClick={() => navigate('/edit-profile', { state: { voterid } })}>
            Edit Profile
          </button>
          <button onClick={() => navigate('/')}>Logout</button>
        </div>
      </div>
    </div>
  );
}

export default VoterAction;
