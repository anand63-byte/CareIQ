import React, { useState } from 'react';
import NavBar from './NavBar';
import axios from 'axios';

const MediDecode = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [responseData, setResponseData] = useState(null); // State to store the response
  const [isButtonClicked, setIsButtonClicked] = useState(false); // State to track button click

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
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
      const response = await axios.post('/api/mediDecode', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Parse the JSON string from the response
      const parsedData = JSON.parse(response.data.analysis.replace(/```json|```/g, '').trim());
      setResponseData(parsedData); // Store the parsed response data
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsButtonClicked(false); // Reset button color after processing
    }
  };

  const renderField = (label, value) => (
    <p className=' mt-2'>
      <span className='text-blue-500'>{label}:</span> {value || 'N/A'}
    </p>
  );

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
      {responseData && (
        <div>
          <h3 className='text-blue-500 text-2xl mt-5 font-semibold'>Decoded Information:</h3>
          <div className='border-2 p-4 mt-5 rounded-lg'>
            {renderField('Brand Name', responseData.brand_name)}
            {renderField('Generic Name', responseData.generic_name)}
            {renderField('Salt Name', responseData.salt_name)}
            {renderField('Dosage Form', responseData.dosage_form)}
            {renderField('Strength', responseData.strength)}
            {renderField('Recommended Dosage', responseData.recommended_dosage)}
            {renderField('Indications', responseData.indications)}
            {renderField('Contraindications', responseData.contraindications)}
            {renderField('Common Side Effects', responseData.common_side_effects)}
            {renderField('Food Suggestions', responseData.food_suggestions)}
            {renderField('Storage Instructions', responseData.storage_instructions)}
            {renderField('Manufacturer', responseData.manufacturer)}
            {renderField('Approximate Price Range', responseData.approximate_price_range)}
            {renderField('Cheapest Generic Options', responseData.cheapest_generic_options)}
            {renderField('Additional Notes', responseData.additional_notes)}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediDecode;