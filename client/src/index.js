import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './index.css';
import { ToastContainer } from 'react-toastify'; // Import css for Toastify
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    //<React.StrictMode> // Adding this causes useEffect to be called twice (breaking the intended singular fetch in the search Page, calling it twice)
    <>
        <App />
        <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            />
    </>
    //</React.StrictMode>
);