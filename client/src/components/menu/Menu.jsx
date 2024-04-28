import React, {useEffect} from 'react'
import './menu.css';

import { useLocation } from 'react-router-dom';
import { useCustomNavigate } from './../../routing/navigation';

const Menu = ({FocusOnSearchBar}) => {
    const location = useLocation();
    const { navigateToHome, navigateToChatBot } = useCustomNavigate();
    
    useEffect(() => {
        console.log(`Render-Menu (onMount): ${location.pathname}`);
    }, []);

    return (
        <>
        <p><a href={'/home/'} onClick={(e) => { e.preventDefault(); navigateToHome()}}>Home</a></p>
        <p><a href={'/chatbot/'} onClick={(e) => { e.preventDefault(); navigateToChatBot()}}>Ask ChatGPT</a></p>
        <p className='fto__menu-search'><a onClick={FocusOnSearchBar}>Search</a></p>
        </>
    )
}

export default Menu