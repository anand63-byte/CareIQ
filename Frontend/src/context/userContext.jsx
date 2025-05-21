// src/context/userContext.js

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// ▶️ Make axios send your httpOnly authToken cookie on every request:
axios.defaults.withCredentials = true;

export const ReportsContext = createContext();

const UserContextProvider = ({ children }) => {
  const [reports, setReports]   = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // 1️⃣ Get the logged‐in user and their reports
    axios.get('/api/home')
      .then(res => {
        if (res.data.loggedIn) {
          setUserData(res.data.user);
        }
      })
      .catch(err => console.error('Error fetching user data:', err));

    // 2️⃣ Fetch your GenAI analysis (or whatever /api/genAI returns)
    axios.get('/api/genAI')
      .then(res => setReports(res.data))
      .catch(err => console.error('Error fetching AI reports:', err));
  }, []);

  return (
    <ReportsContext.Provider
      value={{
        reports,
        userData,
        doctors: userData?.doctors || []
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
};

export default UserContextProvider;
