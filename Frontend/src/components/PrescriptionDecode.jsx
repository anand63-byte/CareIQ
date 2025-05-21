import React, { useState } from 'react';
import NavBar from './NavBar';
import axios from 'axios';

const PrescriptionDecode = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [responseData, setResponseData] = useState(''); // State to store the response
  const [isButtonClicked, setIsButtonClicked] = useState(false); // State to track button click
  const [errorMessage, setErrorMessage] = useState(null); // State to store error messages

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setErrorMessage(null); // Clear any previous error messages
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }

    setIsButtonClicked(true); // Change button color on click

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('/api/prescriptionDecode', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Handle plain text response
      const plainText = response.data.analysis;
      setResponseData(plainText); // Store the plain text response
      setErrorMessage(null); // Clear any error messages
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage('An error occurred while uploading the file. Please try again.');
    } finally {
      setIsButtonClicked(false); // Reset button color after processing
    }
  };

  const renderFormattedSummary = (summary) => {
    const lines = summary
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => line.replace(/\*/g, '').trim()); // Remove all '*' characters and trim whitespace
    return lines.map((line, index) => (
      <p key={index} className="mt-2 text-gray-700">
        {line}
      </p>
    ));
  };

  return (
    <div className='p-5'>
      <NavBar />
      <div className='flex flex-col items-center justify-center'>
        <input className='border-2 p-1 mt-2' type="file" accept="image/*" onChange={handleFileChange} />
        <button
          className={`w-1/2 rounded-full text-xl p-1 mt-2 ${
            isButtonClicked ? 'bg-gray-500' : 'bg-blue-500'
          } text-white`}
          onClick={handleSubmit}
        >
          Upload and Decode
        </button>
      </div>
      {errorMessage && <p className='text-red-500 mt-4'>{errorMessage}</p>}
      {responseData && (
        <div>
          <h3 className='text-blue-500 text-2xl mt-5 font-semibold'>Decoded Prescription:</h3>
          <div className='border-2 p-4 mt-5 rounded-lg bg-gray-50'>
            {renderFormattedSummary(responseData)}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionDecode;