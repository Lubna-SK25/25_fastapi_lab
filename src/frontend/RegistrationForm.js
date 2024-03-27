import React, { useState } from 'react';
import FormField from './FormField';
import axios from 'axios';

function RegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Perform length validation
    if (name === 'username' && value.length < 6) {
      setErrors({ ...errors, username: 'Username must be at least 6 characters' });
    } else if (name === 'password' && value.length < 7) {
      setErrors({ ...errors, password: 'Password must be at least 7 characters' });
    } else if (name === 'phoneNumber' && value.length !== 11) {
      setErrors({ ...errors, phoneNumber: 'Phone number must have exactly 11 digits' });
    } else if (name === 'email' && !value.includes('@')) {
      setErrors({ ...errors, email: 'Email must contain @' });
    } else {
      // Clear validation error if the input meets the criteria
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear any previous errors
    setSuccessMessage(''); // Clear any previous success message

    // Check if any field is empty
    if (!formData.username || !formData.password || !formData.confirmPassword || !formData.email || !formData.phoneNumber) {
      setErrors({ general: 'Please fill out all fields.' });
      return;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/register', formData);
      const data = response.data;
      setSuccessMessage(data.message); // Display success message
    } catch (error) {
      if (error.response) {
        const responseData = error.response.data;
        setErrors(responseData); // Set backend error message
      } else {
        setErrors({ general: 'An error occurred. Please try again.' }); // Set generic error message
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <FormField
          name="username"
          type="text"
          label="Username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
        />
        <FormField
          name="password"
          type="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />
        <FormField
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
        <FormField
          name="email"
          type="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
        <FormField
          name="phoneNumber"
          type="text"
          label="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          error={errors.phoneNumber}
        />
        <button type="submit">Register</button>
      </form>

      {successMessage && (
        <p style={{ color: 'green' }}>{successMessage}</p>
      )}

      {errors.general && (
        <p style={{ color: 'red' }}>{errors.general}</p>
      )}

      {Object.keys(errors).length > 0 && !errors.general && (
        <div>
          {Object.values(errors).map((errorMessage, index) => (
            <p key={index} style={{ color: 'red' }}>
              {errorMessage}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default RegistrationForm;
