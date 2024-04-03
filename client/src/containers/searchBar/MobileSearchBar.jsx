import React, {useState, useEffect} from 'react'

import search_icon from '../../assets/Search_Icon.svg'
import { IoArrowBack } from "react-icons/io5";

const MobileSearchBar = (
    {
        setMobileSearchbarVisiblity, 
        HandleSearchbarSubmit,
        formInputData,
        setInputFormData,
    }) => {

    useEffect(() => {
        let formElements = document.getElementById('navbar_search_form');
        let inputElement = formElements['submit_animeSearch'];
        inputElement.focus()
    }, []);

    const OnFocusOutMobileSearchBar = () => {
        // console.log("Window Width:", window.innerWidth)
        setMobileSearchbarVisiblity(false);
    }

    return (
        <div className='fto__navbar-search_mobile_view'>
            <form id='navbar_search_form' onSubmit={(e) => HandleSearchbarSubmit(e)}>
                <IoArrowBack 
                    onClick={OnFocusOutMobileSearchBar} 
                    size={30}
                /> 
                <input 
                    type='search' 
                    name='submit_animeSearch'
                    placeholder='Enter Anime Title' 
                    value={formInputData} 
                    onBlur={OnFocusOutMobileSearchBar}
                    onChange= {(e) => setInputFormData(e.target.value)} 
                    tabIndex={1} // This will  make the first input field focused when page loads
                />
                <button type='submit'><img src={search_icon} alt='search'/></button>
            </form>
        </div>
    )
}

export default MobileSearchBar