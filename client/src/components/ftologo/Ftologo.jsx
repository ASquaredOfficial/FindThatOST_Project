import React, { useState, useEffect } from 'react';
import './ftologo.css';
import smallLogo from '../../assets/FindThatOST_logo_short.svg'
import largeLogo from '../../assets/FindThatOST_logo_long.svg'
import { useNavigate } from "react-router-dom";

const Ftologo = () => {
  const [mediaSize, setMediaSize] = useState('');
  const navigate = useNavigate();

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

  const HandleLogoOnClick = () => {
    let curentPage = window.location.href;
    if (curentPage.startsWith(window.location.origin + '/home')) {
      //if home page, refresh
      navigate(0)
    }
    else {
      navigate('/home')
    }
  }

  return (
      <img 
        style={{cursor: 'pointer'}}
        src={mediaSize === 'small' ? smallLogo : largeLogo } 
        alt="Logo" 
        onClick={HandleLogoOnClick}
      />
  );
};

export default Ftologo;