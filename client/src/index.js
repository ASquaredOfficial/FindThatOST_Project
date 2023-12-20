import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    //<React.StrictMode> // Adding this causes useEffect to be called twice (breaking the intended singular fetch in the search Page, calling it twice)
        <App />
    //</React.StrictMode>
);