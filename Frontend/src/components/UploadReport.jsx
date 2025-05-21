import React, { useState } from 'react';
import axios from 'axios';
import NavBar from './NavBar';

const UploadReport = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    setIsUploading(true); // Change button color to red

    const formData = new FormData();
    formData.append('report', file);

    try {
      const response = await axios.post('/api/uploadReport', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Report uploaded successfully');
    } catch (error) {
      console.error('Error uploading report:', error);
      alert('Failed to upload report');
    } finally {
      setIsUploading(false); // Reset button state if needed
    }
  };

  return (
    <div className="p-5">
      <NavBar/>
      <h1 className="text-xl font-bold mb-4 mt-5 text-blue-500">Upload Report</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="file" onChange={handleFileChange} />
        <button
          type="submit"
          className={`p-2 text-white ${isUploading ? 'bg-gray-500' : 'bg-blue-500'}`}
        >
          Upload
        </button>
      </form>
    </div>
  );
};

export default UploadReport;