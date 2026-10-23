// ResultDashboard.js
import React, { useEffect, useState } from 'react';

function ResultDashboard() {
  const [results, setResults] = useState([]);
  const [winner, setWinner] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/admin/vote-counts')
      .then(res => res.json())
      .then(data => {
        setResults(data);
        if (data.length > 0) {
          setWinner(data[0]._id);
        }
      })
      .catch(err => console.error('Error fetching results:', err));
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>🗳️ Voting is Closed</h2>
      <h3>🏆 Winner: {winner || 'No votes recorded yet'}</h3>

      <table style={{ margin: 'auto', marginTop: '30px' }} border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Total Votes</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, idx) => (
            <tr key={idx}>
              <td>{r._id}</td>
              <td>{r.votes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResultDashboard;
