import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import UserContextProvider from './context/userContext';
import ReportsContextProvider from './context/reportsContext';

ReactDOM.render(
    <UserContextProvider>
        <ReportsContextProvider>
            <App />
        </ReportsContextProvider>
    </UserContextProvider>,
    document.getElementById('root')
);
