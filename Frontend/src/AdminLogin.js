import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoginError(''); // Clear previous error
    try {
      const res = await fetch('http://localhost:3000/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('adminType', data.role);
        if (data.role === 'electionAdmin') {
          navigate('/admin-dashboard');
        } else if (data.role === 'dcAdmin') {
          navigate('/dc-dashboard');
        } else {
          setLoginError('Unknown admin role.');
        }
      } else {
        setLoginError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError('Server error. Please try again later.');
      console.error(err);
    }
  };

  const style = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f2f5',
    },
    box: {
      backgroundColor: '#fff',
      padding: '40px',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      width: '300px',
      textAlign: 'center',
    },
    heading: {
      marginBottom: '20px',
      fontSize: '24px',
      fontWeight: 'bold',
    },
    input: {
      width: '100%',
      padding: '10px',
      marginBottom: '15px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      fontSize: '16px',
    },
    button: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#4CAF50',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '16px',
    },
    errorText: {
      color: 'red',
      marginBottom: '15px',
      fontSize: '14px',
    },
  };

  return (
    <div style={style.container}>
      <div style={style.box}>
        <h2 style={style.heading}>Admin Login</h2>
        {loginError && <div style={style.errorText}>{loginError}</div>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={style.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={style.input}
        />
        <button onClick={handleLogin} style={style.button}>Login</button>
      </div>
    </div>
  );
}

export default AdminLogin;
