import React, {useState} from 'react';
import './navbar.css';

import { RiMenu3Line, RiCloseLine } from 'react-icons/ri'
import Ftologo from '../ftologo/Ftologo';
import search_icon from '../../assets/Search_Icon.svg'

const Menu = () => (
  <>
  <p><a href='#home'>Home</a></p>
  <p><a href='#search'>Search</a></p>
  <p><a href='#askchatgpt'>Ask ChatGPT</a></p>
  </>
)


const Navbar = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  return (
    <div className='fto__navbar'>
      <div className='fto__navbar-links'>

        <div className='fto__navbar-links_logo'>
          <Ftologo/>
        </div>
        <div className='fto__navbar-links_container'>
          <Menu />
        </div>
        <div className='fto__navbar-search'>
          <input type='search' placeholder='Enter Anime Title' />
          <button type='button'><img src={search_icon}/></button>
        </div>

      </div>
      <div className='fto__navbar-sign'>
        <p><strong>Log in</strong></p>
        <button type='button'>Sign Up</button>
      </div>

      <div className='fto__navbar-menu'>
        {toggleMenu
          ? <RiCloseLine color='#fff' size={27} onClick={() => setToggleMenu(false)} />
          : <RiMenu3Line color='#fff' size={27} onClick={() => setToggleMenu(true)} />
        }
        {toggleMenu && (
          <div className='fto__navbar-menu_container sclae-up-center'>
            <div className='fto__navbar-menu_container-links'>
              <Menu />
              <div className='fto__navbar-menu_container-links-sign'>
                <p><strong>Log in</strong></p>
                <button type='button'>Sign Up</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar