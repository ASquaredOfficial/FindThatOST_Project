import React from 'react';
import './footer.css';

const Footer = () => {
  return (
    <div className='fto__footer section__padding'>

      <div className='fto__footer-content'>
        <p className='fto__footer-content_main_header'>FindThatOST</p>
        <p className='fto__footer-content_details_paragraph'>
          FindThatOST is a platform dedicated to helping anime music lovers find the perfect soundtracks for their favourite series. Explore our vast collection, get personalized recommendations, and connect with a community of like-minded enthusiasts. Get started today and experience the joy of anime music.
        </p>

        <div className='fto__footer-content_links_container'>
          <p>Privacy</p>
          <p>Contact</p>
          <p>About</p>
        </div>

        <hr className='fto__footer-content_horizontal_rule' />

        <p className='fto__footer-content_copyright'>© 2023 FindThatOST. All rights reserved.</p>
      </div>
      
    </div>
  )
}

export default Footer