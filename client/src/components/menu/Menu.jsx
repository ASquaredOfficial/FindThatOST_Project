import React from 'react'

import { useCustomNavigate } from './../../routing/navigation'

const Menu = () => {

    const { navigateToHome, navigateToSearch } = useCustomNavigate();

    const HandleMenuOnClick_Search = () => {
        navigateToSearch('')
    }

    return (
        <>
        <p onClick={navigateToHome}><a>Home</a></p>
        <p onClick={HandleMenuOnClick_Search}><a>Search</a></p>
        <p><a href='#askchatgpt'>Ask ChatGPT</a></p>
        </>
    )
}

export default Menu