import React, {useEffect, useState} from 'react'
import './navbar.css';

import { RiMenu3Line, RiCloseLine } from 'react-icons/ri'
import { useCustomNavigate } from './../../routing/navigation'
import Menu from '../menu/Menu'
import Ftologo from '../ftologo/Ftologo';
import search_icon from '../../assets/Search_Icon.svg'
import { MobileSearchBar } from '../../containers';
import { IsEmpty } from '../../utils/RegularUtils';

const Navbar = ({
    SignInFunction,
    SignOutFunction,
    user_properties = {
        userId: null, 
        username: null
    }
}) => {
    const { navigateToSearch } = useCustomNavigate();

    const [toggleMenu, setToggleMenu] = useState(false);
    const [bMobileSearchbarVisible, setMobileSearchbarVisiblity] = useState(false);
    const [formData, setFormData] = useState(''); //handle navbar searchbar submit
    const [backendData, setBackendData] = useState({
        userId: null, 
        username: null
    });
  
    useEffect(() => {
        // Render (onMount)
        if (window.location.href.startsWith(window.location.origin + '/search')) {
            //if search page, add search string from url to searchbar
            setFormData(new URLSearchParams(window.location.search).get('query'))
        }
    }, []);
    
    useEffect(() => {
        setBackendData(user_properties);
    }, [user_properties]);

    const HandleSearchbarSubmit = (e) => {
        e.preventDefault();
        console.debug(`Navbar Form data: ${encodeURIComponent(formData)}`);
        navigateToSearch(formData);
    }

    const FocusOnSearchBar = () => {
        if (window.innerWidth <= '700'/*px*/) {   // Keep constant with class css 'fto__navbar-search'
            // Open Mobile View Searchbar
            setToggleMenu(false);
            setMobileSearchbarVisiblity(true);
        }
        else {
            // Focus on searchbar
            let formElements = document.getElementById("navbar_search_form");
            let searchBar = formElements['submit_animeSearch']
            searchBar.focus()
        }
    }

    return (
        <div className='fto__navbar' style={(bMobileSearchbarVisible) ? {marginBottom: '4rem', paddingBottom: '0rem', paddingTop: '0.7691rem'} : {}}>
            {(!bMobileSearchbarVisible) ? (
                <>
                    <div className='fto__navbar-links'>
                        <div className='fto__navbar-links_logo'>
                            <Ftologo id='fto__navbar-links_logo'/>
                        </div>
                        <div className='fto__navbar-links_container'>
                            <Menu 
                                FocusOnSearchBar={FocusOnSearchBar}/>
                        </div>
                        
                        <div className='fto__navbar-search'>
                            <form id='navbar_search_form' onSubmit={HandleSearchbarSubmit}>
                                <input 
                                    name='submit_animeSearch'
                                    type='search' 
                                    placeholder='Enter Anime Title' 
                                    value={formData} 
                                    onChange= {(e) => setFormData(e.target.value)} 
                                />
                                <button type='submit'><img src={search_icon} alt='search'/></button>
                            </form>
                        </div>
                    </div>

                    {(IsEmpty(backendData.username)) ? (
                        //If no username passed, load non signed in navbar
                        <div className='fto__navbar-sign'>
                            <p className='fto__navbar-login' onClick={SignInFunction} tabIndex='0'><strong>Log in</strong></p>
                            <button type='button' className='fto__button__pink'>Sign Up</button>
                        </div>
                    ): (
                        //If username passed, load username to navbar
                        <div className='fto__navbar-sign'>
                            <p className='fto__navbar-loggedin'><strong>{backendData.username}</strong></p>
                            <button type='button' className='fto__button__pink' onClick={SignOutFunction}>Sign Out</button>
                        </div>
                    )}

                    <div id='fto__navbar-small_menu' className='fto__navbar-menu'>
                        {/* Mobile View Toggle Navbar Menu*/}
                        {toggleMenu
                        ? <RiCloseLine tabIndex='0' color='#fff' size={27} onClick={() => setToggleMenu(false)} />
                        : <RiMenu3Line tabIndex='0' color='#fff' size={27} onClick={() => setToggleMenu(true)} />
                        }
                        {toggleMenu && (
                        <div className='fto__navbar-menu_container sclae-up-center'>
                            <div className='fto__navbar-menu_container-links'>
                            <Menu 
                                FocusOnSearchBar={FocusOnSearchBar}/>
                            {(IsEmpty(backendData.username)) ? (
                                //If no username passed, load non signed in navbar
                                <div className='fto__navbar-menu_container-links-sign'>
                                    <p className='fto__navbar-login' onClick={SignInFunction} tabIndex='0'><strong>Log in</strong></p>
                                    <button type='button'className='fto__button__pink'>Sign Up</button>
                                </div>
                            ): (
                                //If username passed, load username to navbar
                                <div className='fto__navbar-menu_container-links-sign'>
                                    <p className='fto__navbar-loggedin'><strong>{backendData.username}</strong></p>
                                    <button type='button' className='fto__button__pink' onClick={SignOutFunction}>Sign Out</button>
                                </div>
                            )}
                            </div>
                        </div>


                        )}
                    </div>
                </>
            ) : (
                <div className='fto__modal'>
                    <MobileSearchBar
                        setMobileSearchbarVisiblity={setMobileSearchbarVisiblity}
                        HandleSearchbarSubmit={HandleSearchbarSubmit}
                        formInputData={formData}
                        setInputFormData={setFormData}
                    />
                </div>
            )}
            
        </div>
    )
}

export default Navbar