import React from 'react'

const Menu = () => {

    return (
        <>
        <p><a href={'/home/'}>Home</a></p>
        <p><a href={'/search/'}>Search</a></p>
        <p><a href={'/chatbot/'}>Ask ChatGPT</a></p> {/*href='#askchatgpt'*/}
        </>
    )
}

export default Menu