import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DrLogin = () => {
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
      const response = await axios.post('/api/DrlogIn', formData, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setFormData({ email: '', password: '' }); // Reset form values
      navigate('/DrHome'); // Redirect to Home
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGoToSignUp = () => {
    navigate('/sign-in')
  }

  return (
    <div className=' flex items-center justify-center'>
      <div className='flex flex-col gap-4 w-150 border-2 pt-5 pb-5 p-10'>
      <form onSubmit={handleSubmit} >
         <div className='text-xl text-blue-500 font-semibold'>Hey Doc, Patients were waiting for you</div>
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
        <button className="border-2 p-2 bg-green-500 text-white mt-5 w-full">
          Log In
        </button>
      </form>
        <button 
        onClick={handleGoToSignUp}
        className="text-blue-500 text-lg" >
          New here ?
        </button>
      </div>
    </div>
  );
};

export default DrLogin;