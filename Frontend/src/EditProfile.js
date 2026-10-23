import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Registration.css';
import Image from './assets/reg.jpg';

const stateDistricts = {
  "Tamil Nadu": ["Erode", "Chennai", "Madurai", "Coimbatore"]
};

const districtDivision = {
  "Erode": ["Erode West", "Erode East", "Modakurichi", "Perundurai"],
  "Chennai": ["North", "Central", "South"],
  "Madurai": ["East", "West"],
  "Coimbatore": ["North", "South"]
};

function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const voterid = location.state?.voterid;

  const [form, setForm] = useState({
    name: '', dob: '', aadhar: '', voterid: '', mobile: '',
    gender: '', state: '', district: '', subdivision: '', photo: null
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ message: '', type: '' }); // unified status state

   useEffect(() => {
    if (!voterid) return;
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/profile/${voterid}`);
        const data = await response.json();
        if (response.ok) {
          setForm(data);
          if (data.photo) {
            setPhotoPreview(`http://localhost:3000/uploads/${data.photo}`);
          }
        } else {
          setStatus({ message: "Failed to load profile.", type: "error" });
        }
      } catch (err) {
        console.error(err);
        setStatus({ message: "Error fetching profile.", type: "error" });
      }
    };
    fetchData();
  }, [voterid]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      validatePhoto(file);
      setForm(prev => ({ ...prev, photo: file }));
      previewPhoto(file);
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      if (name === 'state') setForm(prev => ({ ...prev, district: '', subdivision: '' }));
      if (name === 'district') setForm(prev => ({ ...prev, subdivision: '' }));
    }
  };

  const previewPhoto = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validatePhoto = (file) => {
    const allowedExtensions = /(\.jpg|\.png)$/i;
    if (!allowedExtensions.exec(file.name)) {
      setErrors(prev => ({ ...prev, photo: "Only .jpg or .png files allowed." }));
      return false;
    }
        if (file.size > 102400) {
      setErrors(prev => ({ ...prev, photo: "File must be less than 100KB." }));
      return false;
    }
    setErrors(prev => ({ ...prev, photo: null }));
    return true;
  };

  const validateForm = () => {
    const newErrors = {};
    const patternAadhar = /^\d{12}$/;
    const patternVoterId = /^[A-Z]{3}[0-9]{7}$/i;
    const patternMobile = /^[6-9][0-9]{9}$/;

    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.dob) newErrors.dob = "Date of Birth is required.";
    if (!patternAadhar.test(form.aadhar)) newErrors.aadhar = "Invalid Aadhar.";
    if (!patternVoterId.test(form.voterid)) newErrors.voterid = "Invalid Voter ID.";
    if (!patternMobile.test(form.mobile)) newErrors.mobile = "Invalid mobile number.";
    if (!form.gender) newErrors.gender = "Gender is required.";
    if (!form.state) newErrors.state = "State is required.";
    if (!form.district) newErrors.district = "District is required.";
    if (!form.subdivision) newErrors.subdivision = "Subdivision is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    for (let key in form) {
      if (form[key] !== null) formData.append(key, form[key]);
    }

    try {
      const response = await fetch(`http://localhost:3000/profile/update/${form.voterid}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        setStatus({ message: "Profile updated successfully!", type: "success" });
        navigate('/VoterPage', {
          state: { voterid: form.voterid, subdivision: form.subdivision },
        });
      } else {
        setStatus({ message: "Failed to update profile.", type: "error" });
      }
    } catch (err) {
      setStatus({ message: "Server error. Please try again later.", type: "error" });
    }
  };

    const getDistricts = () => stateDistricts[form.state] || [];
    const getDivisions = () => districtDivision[form.district] || [];

return (
    <div style={style.wrapper}>
      <div className="form-container">
        <h1>Edit Profile</h1>

        {status.message && (
          <div
            style={{
              marginBottom: '15px',
              padding: '10px',
              borderRadius: '6px',
              color: status.type === 'error' ? '#721c24' : '#155724',
              backgroundColor: status.type === 'error' ? '#f8d7da' : '#d4edda',
              border: `1px solid ${status.type === 'error' ? '#f5c6cb' : '#c3e6cb'}`
            }}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="input-group">
            <label>Name:</label>
            <input name="name" value={form.name} onChange={handleChange} />
            <div className="error-message">{errors.name}</div>
          </div>

          <div className="input-group">
            <label>Date of Birth:</label>
            <input type="date" name="dob" value={form.dob} onChange={handleChange} />
            <div className="error-message">{errors.dob}</div>
          </div>

          <div className="input-group">
            <label>Aadhar Number:</label>
            <input name="aadhar" value={form.aadhar} onChange={handleChange} />
            <div className="error-message">{errors.aadhar}</div>
          </div>

          <div className="input-group">
            <label>Voter ID:</label>
            <input
              name="voterid"
              value={form.voterid}
              readOnly
              style={{ backgroundColor: '#eee' }}
            />
            <div className="error-message">{errors.voterid}</div>
          </div>

          <div className="input-group">
            <label>Mobile Number:</label>
            <input name="mobile" value={form.mobile} onChange={handleChange} />
            <div className="error-message">{errors.mobile}</div>
          </div>

          <div className="input-group">
            <label>Gender:</label>
            <div className="gender-options">
              {["Male", "Female", "Other"].map((g) => (
                <label key={g}>
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={handleChange}
                  />
                  {g}
                </label>
              ))}
            </div>
            <div className="error-message">{errors.gender}</div>
          </div>

          <div className="input-group">
            <label>State:</label>
            <select name="state" value={form.state} onChange={handleChange}>
              <option value="">--Select--</option>
              {Object.keys(stateDistricts).map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <div className="error-message">{errors.state}</div>
          </div>

          <div className="input-group">
            <label>District:</label>
            <select name="district" value={form.district} onChange={handleChange}>
              <option value="">--Select--</option>
              {getDistricts().map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <div className="error-message">{errors.district}</div>
          </div>

          <div className="input-group">
            <label>Subdivision:</label>
            <select name="subdivision" value={form.subdivision} onChange={handleChange}>
              <option value="">--Select--</option>
              {getDivisions().map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="error-message">{errors.subdivision}</div>
          </div>

          <div className="input-group">
            <label>Update Photo (.jpg/.png only, max 100KB):</label>
            <input type="file" name="photo" accept=".jpg,.png" onChange={handleChange} />
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                style={{ maxWidth: '100px', marginTop: '10px' }}
              />
            )}
            <div className="error-message">{errors.photo}</div>
          </div>

          <button type="submit" className="submit-btn" disabled={!validateForm()}>
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}

const style = {
  wrapper: {
    backgroundImage: `url(${Image})`,
    margin: 0,
    fontFamily: 'Poppins, sans-serif',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    filter: 'brightness(0.8)',
  },
};

export default EditProfile;