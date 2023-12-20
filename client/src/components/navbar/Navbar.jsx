import React, {useEffect, useState} from 'react'
import './navbar.css';

import { useNavigate  } from 'react-router-dom';
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

  //username info rom backend
  const [backendData, setBackendData] = useState ([{}])
	useEffect(() => {
		fetch("/api").then(
			response => response.json()
		).then(
			data => {
				setBackendData(data);
			}
		)
	}, [])

  //handle navbar searchbar submit
  const [formData, setFormData] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Render (onMount)
    console.log(`Render-Navbar (onMount): ${location.href}`);  

    if (location.href.startsWith(location.origin + '/search')) {
      //if search page, add search string from url to searchbar
      setFormData(new URLSearchParams(location.search).get('data'))
    }
}, [])

  const HandleSearchbarSubmit = (e) => {
    e.preventDefault();
    console.log(`Navbar Form data: ${encodeURIComponent(formData)}`);
    navigate({
      pathname: '/search',
      search: `?data=${encodeURIComponent(formData)}`,
    });
    if (location.href.startsWith(location.origin + '/search')) {
      //if search page 
      navigate(0)
    }
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
            <button type='submit'><img src={search_icon}/></button>
          </form>
        </div>
      </div>

      {(typeof backendData.username == 'underfined') ? (
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
              {(typeof backendData.username == 'underfined') ? (
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