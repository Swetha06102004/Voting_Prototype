import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignIn.css'; 
import backgroundImage from './assets/sigin.jpg';

function SignIn() {
  const [voterid, setVoterid] = useState('');
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [error, setError] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [subdivision, setSubdivision] = useState('');

  const navigate = useNavigate();

  // Validate inputs
  const validateInputs = () => {
    const voterIdPattern = /^[A-Z]{3}[0-9]{7}$/i;
    const mobilePattern = /^[6-9]\d{9}$/;

    if (!voterIdPattern.test(voterid)) {
      setError("Invalid Voter ID. Format: ABC1234567");
      return false;
    }

    if (!mobilePattern.test(mobile)) {
      setError("Invalid Mobile Number. Must be 10 digits starting with 6-9.");
      return false;
    }

    setError('');
    return true;
  };

  // Send OTP
  const sendOTP = async () => {
    if (!validateInputs()) return;

    try {
      const response = await fetch('http://localhost:3000/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterid, mobile })
      });

      const data = await response.json();

      if (response.ok && data.message === 'OTP sent successfully') {
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        setGeneratedOtp(otp);
        setSubdivision(data.subdivision || '');
        setOtpMessage(`Your OTP is: ${otp}`);
        setOtpSent(true);
        setError('');
      } else {
        setError(data.message || 'Invalid credentials.');
      }
    } catch (err) {
      setError('Error connecting to server.');
    }
  };

  // Verify OTP
  const verifyOTP = () => {
    if (enteredOtp.trim() === generatedOtp) {
      setOtpMessage(" OTP Verified Successfully!");
      setTimeout(() => {
        navigate('/voter-action', {
          state: { voterid, subdivision }
        });
      }, 1000);
    } else {
      setOtpMessage("Incorrect OTP. Please try again.");
    }
  };

  // Optional: Auto clear OTP message after 5 seconds
  useEffect(() => {
    if (otpMessage) {
      const timer = setTimeout(() => setOtpMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [otpMessage]);

  return (
    <div style={styles.wrapper}>
      <div className="signin-container">
        <h2>Voter Sign In</h2>

        <div className="input-group">
          <label>Voter ID:</label>
          <input
            type="text"
            value={voterid}
            onChange={(e) => setVoterid(e.target.value)}
            placeholder="ABC1234567"
          />
        </div>

        <div className="input-group">
          <label>Mobile Number:</label>
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="10-digit mobile number"
          />
        </div>

        {!otpSent && (
          <button className="signin-btn" onClick={sendOTP}>Send OTP</button>
        )}

        {otpSent && (
          <>
            <div className="input-group">
              <label>Enter OTP:</label>
              <input
                type="text"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="Enter the OTP"
              />
            </div>
            <button className="signin-btn" onClick={verifyOTP}>Verify OTP</button>
          </>
        )}

        {error && (
          <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>
            {error}
          </div>
        )}

        {otpMessage && (
          <div
            className="otp-message"
            style={{
              marginTop: '10px',
              color: otpMessage.startsWith("✅") ? 'green' : 'blue',
              fontWeight: '500'
            }}
          >
            {otpMessage}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontFamily: 'Poppins, sans-serif',
    filter: 'brightness(0.85)'
  }
};

export default SignIn;
