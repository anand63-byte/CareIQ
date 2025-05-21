import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import UserContextProvider from './context/userContext.jsx';
import { DrProvider } from './context/drContext.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <UserContextProvider>
            <DrProvider> {/* Ensure DrProvider wraps the components */}
                <App />
            </DrProvider>
        </UserContextProvider>
    </StrictMode>
);
