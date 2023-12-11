import React from 'react';
import './askChatGPT.css';

import ai_img from '../../assets/ai.png';

const AskChatGPT = () => {
  return (
    <div className='fto__askChatGPT section__padding' id='home'>
      <div className='fto__askChatGPT-image'>
        <img src={ai_img} alt='ai' /> 
      </div>
      
      <div className='fto__askChatGPT-content'>
        <h1 className='gradient__text'>
          Ask ChatGPT
        </h1>
        <p>
          We have utilised AI technologies to revolutionise your search using ChatGPT to query our records for you. Give it a try!
        </p>

        <div className='fto__askChatGPT-content__input'>
          <input type='search' placeholder='Enter question for ChatGPT' />
          <button type='button'>Ask ChatGPT</button>
        </div>
      </div>
    </div>
  )
}

export default AskChatGPT