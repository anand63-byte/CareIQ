import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DrSignIn from './DrSignIn';

const SignIn = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/signIn', formData, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true            // ← accept the Set-Cookie header
      });
      setFormData({ username: '', email: '', password: '' }); // Reset form values
      navigate('/'); // Redirect to Home
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGoToLogin = async () => {
    try {
      console.log('Attempting to clear auth token and navigate to login...');
      navigate('/login');
    } catch (error) {
      console.error('Error clearing auth token or navigating:', error);
      alert('Failed to navigate to login. Please try again.');
    }
  };

  return (
    <div> 
      <div className='flex justify-center'>
          <h1 className='inline-block  mt-20 mb-20 text-4xl font-bold text-white rounded-br-xl rounded-tl-xl rounded-bl-xl bg-blue-500 p-5 ' >CareIQ</h1>
      </div>
    <div className=' flex  items-center justify-center gap-20'>
      
      <div className='flex flex-col gap-4 w-150 border-2 pt-5 pb-5 p-10'>
      <form onSubmit={handleSubmit} >
        <div className='text-blue-500 text-xl font-semibold'>
          Get your CareIQ 
        </div>
        <div className="border-2 mt-5">
          <input
            type="text"
            id="username"
            name="username"
            placeholder="User Name"
            className="p-2 w-full"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div className="border-2 mt-5">
          <input
            type="email"
            id="email"
            name="email"
            placeholder="User Email"
            className="p-2 w-full"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="border-2 mt-5">
          <input
            type="password"
            id="password"
            name="password"
            placeholder="User Password"
            className="p-2 w-full"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <button className="border-2 p-2 bg-green-500 w-full text-white mt-5" type="submit">
          Sign In
        </button>
      </form>
        <button 
        onClick={handleGoToLogin}
        className="text-blue-500 text-lg" >
          Already registered ?
        </button>
      </div>
      <div>
        <DrSignIn />
      </div>
      
    </div>
    </div>
  );
};

export default SignIn;