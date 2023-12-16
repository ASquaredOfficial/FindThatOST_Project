import React from 'react';
import './header.css';

import anime_poster_img from '../../assets/anime_poster.png';

const Header = () => {
  return (
    <div className='fto__header' id='home'>
      <div className='fto__header-content'>
        <h1 className='header__text'>
          Find and Discover Your Favourite Anime Music
        </h1>
        <p>
          Welcome to FindThatOST, the ultimate destination for all your favourite anime music. Search for the perfect soundtrack for your favourite anime series and relive the magic of every scene.
        </p>
      </div>
      
      <div className='fto__header-image'>
        <img src={anime_poster_img} alt='anime poster' /> 
      </div>
    </div>
  )
}

export default Header