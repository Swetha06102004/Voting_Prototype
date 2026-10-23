import React, { useState, useRef } from 'react';
import './Registration.css';
import { useNavigate } from 'react-router-dom'; 
import Image from './assets/reg.jpg';
import Division from './DistrictDivision.json';

const stateDistricts = {
  "Tamil Nadu": [  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri","Dindigul", "Erode", "Kallakurichi",
  "Kancheepuram", "Kanniyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Perambalur", "Pudukottai",
  "Ramanathapuram", "Ranipet", "Salem", "Sivagangai", "Tenkasi", "Thanjavur", "The Nilgiris", "Theni", "Thiruvallur","Thiruvarur",
  "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvannamalai", "Vellore","Villupuram", "Virudhunagar"
]
};

const RegistrationForm = () => {
  const [form, setForm] = useState({
    name: '', dob: '', aadhar: '', voterid: '', mobile: '',
    gender: '', state: 'Tamil Nadu', district: '', subdivision: '', photo: null
  });
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState('');
  const [formStatus, setFormStatus] = useState(''); 
  const fileInputRef = useRef();                    
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      validatePhoto(file);
      setForm(prev => ({ ...prev, photo: file }));
      previewPhoto(file);
    } else {
      setForm(prev => ({ ...prev, [name]: value }));

      
      if (name === "state") {
        setForm(prev => ({ ...prev, district: '', subdivision: '' }));
      }
      
      if (name === "district") {
        setForm(prev => ({ ...prev, subdivision: '' }));
      }
    }
  };

  const previewPhoto = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview('');
    }
  };

  const validatePhoto = (file) => {
    const filePath = file.name;
    const allowedExtensions = /(\.jpg|\.png)$/i;
    if (!allowedExtensions.exec(filePath)) {
      setErrors(prev => ({ ...prev, photo: "Only .jpg or .png files allowed." }));
      return false;
    }
    if (file.size > 102400) {
      setErrors(prev => ({ ...prev, photo: "File must be less than or equal to 100KB." }));
      return false;
    }
    setErrors(prev => ({ ...prev, photo: null }));
    return true;
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = () => {
    const newErrors = {};
    const patternAadhar = /^\d{12}$/;
    const patternVoterId = /^[A-Z]{3}[0-9]{7}$/i;
    const patternMobile = /^[6-9][0-9]{9}$/;

    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.dob) newErrors.dob = "Date of birth is required.";
    else if (calculateAge(form.dob) < 18) newErrors.dob = "You must be 18+.";

    if (!patternAadhar.test(form.aadhar)) newErrors.aadhar = "Invalid Aadhar (12 digits).";
    if (!patternVoterId.test(form.voterid)) newErrors.voterid = "Invalid Voter ID format.";
    if (!patternMobile.test(form.mobile)) newErrors.mobile = "Invalid mobile number.";

    if (!form.gender) newErrors.gender = "Gender is required.";
    if (!form.state) newErrors.state = "State is required.";
    if (!form.district) newErrors.district = "District is required.";
    if (!form.subdivision) newErrors.subdivision = "Sub Division is required.";
    if (!form.photo) newErrors.photo = "Please upload a photo.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("dob", form.dob);
      formData.append("aadhar", form.aadhar);
      formData.append("voterid", form.voterid);
      formData.append("mobile", form.mobile);
      formData.append("gender", form.gender);
      formData.append("state", form.state);
      formData.append("district", form.district);
      formData.append("subdivision", form.subdivision);
      formData.append("photo", form.photo);
  
      try {
        const response = await fetch("http://localhost:3000/register", {
          method: "POST",
          body: formData,
        });
  
       if (response.ok) {
        setFormStatus("Registration successful!");
        setForm({
        name: '',
        dob: '',
        aadhar: '',
        voterid: '',
        mobile: '',
        gender: '',
        state: '',
        district: '',
        subdivision: '',
        photo: null
      });

        setPhotoPreview('');
        setErrors({});
        fileInputRef.current.value = ''; // Clear file input
        setTimeout(() => navigate('/'), 1000); // Navigate with delay
      }       
      else {
      setFormStatus("Something went wrong.");
      }
    }
    catch (err) {
      setFormStatus("Server error. Please check connection.");
      console.error(err);
    }
    }
  };
  
  
  const getDistricts = () => {
    return stateDistricts[form.state] || [];
  };

  const getDivisions = () => Division[form.district] || [];


  return (
    <div style={style.wrapper}>
    <div className="form-container">
      <h1>REGISTRATION FORM</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        
        <div className="input-group">
          <label>Name:</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Enter full name"/>
          <div className="error-message">{errors.name}</div>
        </div>

        <div className="input-group">
          <label>Date of Birth:</label>
          <input type="date" name="dob" value={form.dob} onChange={handleChange} placeholder="Select DOB"/>
          <div className="error-message">{errors.dob}</div>
        </div>

        <div className="input-group">
          <label>Aadhar Number:</label>
          <input name="aadhar" value={form.aadhar} onChange={handleChange} placeholder="12-digit Aadhar number"/>
          <div className="error-message">{errors.aadhar}</div>
        </div>

        <div className="input-group">
          <label>Voter ID:</label>
          <input name="voterid" value={form.voterid} onChange={handleChange} placeholder="E.g., ABC1234567"/>
          <div className="error-message">{errors.voterid}</div>
        </div>

        <div className="input-group">
          <label>Mobile Number:</label>
          <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="10-digit mobile number"/>
          <div className="error-message">{errors.mobile}</div>
        </div>

        <div className="input-group">
          <label>Gender:</label>
          <div className="gender-options">
            {["Male", "Female", "Other"].map(g => (
              <label key={g}>
                <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={handleChange} />
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
                    <option value="Tamil Nadu">Tamil Nadu</option>
          </select>
          <div className="error-message">{errors.state}</div>
        </div>

        <div className="input-group">
          <label>District:</label>
          <select name="district" value={form.district} onChange={handleChange}>
            <option value="">--Select--</option>
            {getDistricts().map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="error-message">{errors.district}</div>
        </div>

        <div className="input-group">
          <label>Sub Division:</label>
          <select name="subdivision" value={form.subdivision} onChange={handleChange}>
            <option value="">--Select--</option>
            {getDivisions().map(div => <option key={div} value={div}>{div}</option>)}
          </select>
          <div className="error-message">{errors.subdivision}</div>
        </div>

        <div className="input-group">
          <label>Upload Photo (.jpg or .png only, max 100KB):</label>
          <input type="file" name="photo" accept=".jpg,.png" onChange={handleChange} ref={fileInputRef} />
          {photoPreview && <img src={photoPreview} alt="Preview" style={{ maxWidth: '100px', marginTop: '10px' }} />}
          <div className="error-message">{errors.photo}</div>
        </div>

        <button type="submit" className="submit-btn">Submit</button>

      </form>
      {formStatus && (
      <p className="form-status-message" style={{ color: formStatus.startsWith("✅") ? "green" : "red" }}>
      {formStatus}
      </p>
      )}


    </div>
    </div>
  );
};
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

export default RegistrationForm;
