import React, {useState} from 'react';
import './navbar.css';

import { RiMenu3Line, RiCloseLine } from 'react-icons/ri'
import logo from '../../assets/logo.svg'

const Menu = () => (
  <>
  <p><a href='#home'>Home</a></p>
  <p><a href='#wgpt3'>What is GPT</a></p>
  <p><a href='#possibility'>Open AI</a></p>
  <p><a href='#features'>Case Studies</a></p>
  <p><a href='#blog'>Library</a></p>
  </>
)


const Navbar = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  return (
    <div className='fto__navbar'>
      <div className='fto__navbar-links'>
        <div className='fto__navbar-links_logo'>
          <img src={logo} alt='logo'/>
        </div>
        <div className='fto__navbar-links_container'>
          <Menu />
        </div>
      </div>
      <div className='fto__navbar-sign'>
        <p><strong>Sign in</strong></p>
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
                <p><strong>Sign in</strong></p>
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