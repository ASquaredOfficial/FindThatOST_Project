import React, {useEffect} from 'react'
import { useLocation } from 'react-router-dom';

const Menu = ({FocusOnSearchBar}) => {
    const location = useLocation();
    
    useEffect(() => {
        console.log(`Render-Menu (onMount): ${location.pathname}`);
    }, []);

    return (
        <>
        <p><a href={'/home/'}>Home</a></p>
        <p><a onClick={FocusOnSearchBar}>Search</a></p>
        <p><a href={'/chatbot/'}>Ask ChatGPT</a></p> {/*href='#askchatgpt'*/}
        </>
    )
}

export default Menu