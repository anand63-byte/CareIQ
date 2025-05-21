import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DrLogin from './DrLogin';

const Login = () => {
  const [formData, setFormData] = useState({
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
      const response = await axios.post('/api/logIn', formData, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true            // ← accept the Set-Cookie header
      });
      setFormData({ email: '', password: '' }); // Reset form values
      navigate('/'); // Redirect to Home
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGoToSignUp = () => {
    navigate('/sign-in')
  }

  return (
    <div>
      <div className='flex justify-center'>
          <h1 className='inline-block  mt-20 mb-20 text-4xl font-bold text-white rounded-br-xl rounded-tl-xl rounded-bl-xl bg-blue-500 p-5 ' >CareIQ</h1>
      </div>
    <div className='flex items-center gap-20 justify-center'>
      
      <div className='flex flex-col gap-4 w-150 border-2 p-10 pt-5 pb-5'>
      <form onSubmit={handleSubmit} >
      <div className='text-blue-500 text-xl font-semibold'>
          Welcome back 
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
        <button className="border-2 p-2 bg-green-500 text-white mt-5 w-full" type="submit">
          Log In
        </button>
      </form>
        <button 
        onClick={handleGoToSignUp}
        className="text-blue-500 text-lg" >
          New here ?
        </button>
      </div>
      <DrLogin/>
    </div>
    </div>
  );
};

export default Login;