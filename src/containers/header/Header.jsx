import React from 'react'
import './header.css'

import ai_img from '../../assets/ai.png';

const Header = () => {
  return (
    <div className='fto__header section__padding' id='home'>
      <div className='fto__header-content'>
        <h1 className='gradient__text'>
          Let&#8217;s Build Something amazing with GPT-3 OpenAI
        </h1>
        <p>
          Yet bed any for travelling assistance indulgence unpleasing. Not thoughts all exercise blessing. Indulgence way everything joy alteration boisterous the attachment. Party we years to order allow asked of.
        </p>

        <div className='fto__header-content__input'>
          <input type='search' placeholder='Your Question for ChatGPT' />
          <button type='button'>Ask ChatGPT</button>
        </div>
      </div>
      
      <div className='fto__header-image'>
        <img src={ai_img} alt='ai' /> 
      </div>
    </div>
  )
}

export default Header