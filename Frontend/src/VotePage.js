import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import aiadmkSymbol from './images/aiadmk-symbol.png';
import dmkSymbol from './images/dmk-symbol.png';
import congressSymbol from './images/congress-symbol.png';
import bjpSymbol from './images/bjp-symbol.png';
import votingBg from './assets/voter-bg.jpg'; 

const symbolMap = {
  'aiadmk-symbol.png': aiadmkSymbol,
  'dmk-symbol.png': dmkSymbol,
  'congress-symbol.png': congressSymbol,
  'bjp-symbol.png': bjpSymbol,
};

function VotePage() {
  const location = useLocation();
  const voterid = location.state?.voterid || localStorage.getItem('voterid');

  const [subdivision, setSubdivision] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [votingStatus, setVotingStatus] = useState('');
  const [timeLeft, setTimeLeft] = useState('');


  useEffect(() => {
  fetch('http://localhost:3000/voting-time-status')
    .then(res => res.json())
    .then(data => setVotingStatus(data.status))
    .catch(() => setVotingStatus('error'));
}, []);

useEffect(() => {
  let interval;

  if (votingStatus === 'ongoing') {
    fetch('http://localhost:3000/voting-end-time')
      .then(res => res.json())
      .then(data => {
        const end = new Date(data.endTime);

        interval = setInterval(() => {
          const now = new Date();
          const diff = end - now;

          if (diff <= 0) {
            clearInterval(interval);
            setVotingStatus('ended');
          } else {
            const hrs = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
          }
        }, 1000);
      })
      .catch(err => console.error('Error getting end time', err));
  }

  // ✅ Proper cleanup
  return () => {
    if (interval) clearInterval(interval);
  };
}, [votingStatus]);


  useEffect(() => {
    if (voterid) {
      localStorage.setItem('voterid', voterid);
      fetch(`http://localhost:3000/profile/${voterid}`)
        .then(res => res.json())
        .then(data => {
          if (data?.subdivision) {
            setSubdivision(data.subdivision);
            localStorage.setItem('subdivision', data.subdivision);
          } else {
            setMessage('Unable to fetch subdivision from voter profile.');
          }
        })
        .catch(() => setMessage('Error fetching voter info.'));
    }
  }, [voterid]);

  useEffect(() => {
    if (subdivision) {
      fetch(`http://localhost:3000/candidates/${subdivision}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setCandidates(data);
          } else {
            setMessage(data.message || 'No candidates found.');
          }
        })
        .catch(() => setMessage('Error fetching candidates.'));
    }
  }, [subdivision]);

  const handleVote = async () => {
    if (!selectedCandidate) {
      setMessage('⚠️ Please select a candidate.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterid,
          candidateName: selectedCandidate.candidateName,
          subdivision,
        }),
      });

      const data = await res.json();

      if (data.message === 'Vote successfully recorded.') {
        setVoteSubmitted(true);
      } else {
        setMessage(data.message || 'Failed to submit vote.');
      }
    } catch (err) {
      setMessage('Error submitting vote.');
    }
  };

  if (!voterid) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Missing voter information</h2>
        <p>Please sign in again to access the voting portal.</p>
      </div>
    );
  }
  if (votingStatus === 'not_started') {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>🕒 Voting has not started yet.</h2>
    </div>
  );
}

if (votingStatus === 'error') {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2 style={{ color: 'red' }}>Error checking voting time.</h2>
    </div>
  );
}

  if (voteSubmitted) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Thank you for voting!</h2>
      </div>
    );
  }

  return (
      <div style={{
      backgroundImage: `url(${votingBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      padding: '40px 0',
    }}
  >
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h2>🗳️ Vote for Your Candidate</h2>

      {votingStatus === 'ongoing' && timeLeft && (
        <p style={{ fontSize: '16px', marginBottom: '20px', color: 'green' }}>
        ⏳ Voting ends in: <strong>{timeLeft}</strong>
        </p>
      )}


      {message && (
        <p style={{ color: 'red', marginBottom: '10px' }}>{message}</p>
      )}

      {candidates.length === 0 ? (
        <p>Loading candidates...</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {candidates.map((candidate, index) => (
            <li
              key={index}
              onClick={() => {
                setSelectedCandidate(candidate);
                setMessage('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '10px',
                marginBottom: '10px',
                border: selectedCandidate === candidate ? '3px solid #007bff' : '1px solid #ccc',
                borderRadius: '10px',
                cursor: 'pointer',
                backgroundColor: selectedCandidate === candidate ? '#e7f1ff' : '#fff',
              }}
            >
              <img
                src={symbolMap[candidate.symbol]}
                alt={candidate.partyName}
                style={{ width: '50px', height: '50px' }}
              />
              <div>
                <strong>{candidate.candidateName}</strong> <br />
                <span>({candidate.partyName})</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={handleVote}
        disabled={!selectedCandidate}
        style={{
          marginTop: '20px',
          padding: '12px 24px',
          backgroundColor: selectedCandidate ? '#007bff' : '#ccc',
          color: 'white',
          fontSize: '16px',
          border: 'none',
          borderRadius: '8px',
          cursor: selectedCandidate ? 'pointer' : 'not-allowed',
        }}
      >
        Submit Vote
      </button>
    </div>
    </div>
  );
}

export default VotePage;
