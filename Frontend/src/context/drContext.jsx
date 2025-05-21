import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const DrContext = createContext();

export const DrProvider = ({ children }) => {
    const [doctorData, setDoctorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const fetchDoctorData = async () => {
            try {

                // Read the JWT from the cookie named "token"
                const cookieStr = document.cookie;
                const token = cookieStr
                    .split('; ')
                    .find(row => row.startsWith('token='))
                    ?.split('=')[1];


                const response = await axios.get('/api/DrHome', {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                });

                setDoctorData(response.data);
            } catch (err) {
                console.error('Error fetching doctor data:', err); // Log the error
                setError(err.response?.data?.message || 'Failed to fetch doctor data');
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorData();
    }, []);

    return (
        <DrContext.Provider value={{ doctorData, loading, error }}>
            {children}
        </DrContext.Provider>
    );
};

export const useDrContext = () => React.useContext(DrContext);

export default DrContext;
