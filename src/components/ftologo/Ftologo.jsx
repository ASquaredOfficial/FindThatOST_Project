import React, { useState, useEffect } from 'react';
import './ftologo.css';
import smallLogo from '../../assets/FindThatOST_logo_short.svg'
import largeLogo from '../../assets/FindThatOST_logo_long.svg'

const Ftologo = () => {
  const [mediaSize, setMediaSize] = useState('');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Update media size based on the window width
      if (width < 550) {
        setMediaSize('small');
      } else {
        setMediaSize('large');
      }
    };

    // Initial call and event listener setup
    handleResize();
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div>
      <img 
        src={mediaSize === 'small' ? smallLogo : largeLogo } 
        alt="Dynamic Image" 
      />
    </div>
  );
};

export default Ftologo;