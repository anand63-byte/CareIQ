import React, { useContext, useState } from 'react';
import { ReportsContext } from '../context/userContext';
import NavBar from './NavBar';

const MyDoctors = () => {
  const { doctors } = useContext(ReportsContext);
  const [searchTerm, setSearchTerm] = useState(''); // State for search input

  const handleRemoveDoctor = async (doctorId) => {
    try {
      const response = await fetch(`/api/removeDoc/${doctorId}`, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
      });

      if (response.ok) {
        alert('Doctor removed successfully');
        window.location.reload(); // Reload the page to update the list
      } else {
        const errorData = await response.json();
        alert(`Failed to remove doctor: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error removing doctor:', error);
      alert('An error occurred while removing the doctor');
    }
  };

  // Filter doctors based on the search term
  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-5">
      <NavBar />
      <input
        type="text"
        placeholder="Find your doctor"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border-2 p-2 mt-5 w-100 rounded-full "
      />
      {filteredDoctors && filteredDoctors.length > 0 ? (
        filteredDoctors.map((doctor, index) => (
          <div className='border-2 p-2 mt-5 flex flex-col gap-2' key={index}>
            <p className='text-lg font-semibold'>Dr. {doctor.name}</p>
            <div className='flex justify-between'>
              <p className='text-blue-500'>Email: {doctor.email}</p>
              <button
                onClick={() => handleRemoveDoctor(doctor._id)}
                className='text-red-500 underline'>
                Remove Doctor
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600 mt-3">No doctors found.</p>
      )}
    </div>
  );
};

export default MyDoctors;
