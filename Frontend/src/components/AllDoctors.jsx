import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from './NavBar';

const AllDoctors = () => {
    const [doctors, setDoctors] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // State for search input

    useEffect(() => {
        axios.get('/api/allDoctors')
          .then(response => {
            setDoctors(response.data);
          })
          .catch(error => {
            console.error('Error fetching doctors:', error);
          });
    }, []);

    if (!doctors) return <div></div>;

    const handleAddDoc = async (id) => {
        await axios.post(`/api/addDoc/${id}`);
    };

    // Filter doctors based on the search term
    const filteredDoctors = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='p-5'>
            <NavBar />
            <input
                type="text"
                placeholder="Find your doctor"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-2 p-2 mt-5 w-100 rounded-full "
            />
            {filteredDoctors.map(el => {
                return (
                    <div key={el._id} className='flex flex-col gap-2 border-2 mt-5 p-2'>
                        <div className='font-semibold text-lg'>Dr. {el.name}</div>
                        <div className='flex justify-between'>
                            <div className='text-blue-500'>Email: {el.email}</div>
                            <button onClick={() => handleAddDoc(el._id)} 
                                className='text-blue-500 p-1 font-semibold rounded-full'>
                                <span className='bg-blue-500 text-white pl-2 pr-2 pb-1 rounded-full'>+</span> Add Doc
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AllDoctors;