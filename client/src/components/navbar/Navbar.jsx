import React, {useEffect, useState} from 'react'
import './navbar.css';

import { RiMenu3Line, RiCloseLine } from 'react-icons/ri'
import { useCustomNavigate } from './../../routing/navigation'
import Menu from '../menu/Menu'
import Ftologo from '../ftologo/Ftologo';
import search_icon from '../../assets/Search_Icon.svg'

const Navbar = () => {
  const { navigateToSearch } = useCustomNavigate();

  //username info rom backend
  const [backendData, setBackendData] = useState ([{}])
	useEffect(() => {
		fetch("/findthatost_api/username").then(
			response => response.json()
		).then(
			data => {
				setBackendData(data);
			}
		)
	}, [])

  //handle navbar searchbar submit
  const [formData, setFormData] = useState('');
  
  useEffect(() => {
    // Render (onMount)
    console.log(`Render-Navbar (onMount): ${window.location.href}`);  

    if (window.location.href.startsWith(window.location.origin + '/search')) {
      //if search page, add search string from url to searchbar
      setFormData(new URLSearchParams(window.location.search).get('query'))
    }
  }, [])

  const HandleSearchbarSubmit = (e) => {
    e.preventDefault();
    console.debug(`Navbar Form data: ${encodeURIComponent(formData)}`);
    
    navigateToSearch(formData);
  }

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
          <form onSubmit={HandleSearchbarSubmit}>
            <input 
              type='search' 
              placeholder='Enter Anime Title' 
              value={formData} 
              onChange= {
                (e) => setFormData(e.target.value)
              } 
            />
            <button type='submit'><img src={search_icon} alt='search'/></button>
          </form>
        </div>
      </div>

      {(typeof backendData.username == 'undefined') ? (
        //If no username passed, load non signed in navbar
        <div className='fto__navbar-sign'>
          <p><strong>Log in</strong></p>
          <button type='button'>Sign Up</button>
        </div>
      ): (
        //If username passed, load username to navbar
        <div className='fto__navbar-sign'>
          <p><strong>{backendData.username}</strong></p>
          <button type='button'>Sign Out</button>
        </div>
      )}

      <div className='fto__navbar-menu'>
        {/* Mobile View Toggle Navbar Menu*/}
        {toggleMenu
          ? <RiCloseLine color='#fff' size={27} onClick={() => setToggleMenu(false)} />
          : <RiMenu3Line color='#fff' size={27} onClick={() => setToggleMenu(true)} />
        }
        {toggleMenu && (
          <div className='fto__navbar-menu_container sclae-up-center'>
            <div className='fto__navbar-menu_container-links'>
              <Menu />
              {(typeof backendData.username === 'undefined') ? (
                //If no username passed, load non signed in navbar
                <div className='fto__navbar-menu_container-links-sign'>
                  <p><strong>Log in</strong></p>
                  <button type='button'>Sign Up</button>
                </div>
              ): (
                //If username passed, load username to navbar
                <div className='fto__navbar-menu_container-links-sign'>
                  <p><strong>{backendData.username}</strong></p>
                  <button type='button'>Sign Out</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar