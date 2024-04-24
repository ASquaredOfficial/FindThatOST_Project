import React, {useEffect} from 'react';
import './home.css';

import { Navbar, Footer, } from "../../components";
import { Header, AskChatGPT} from "../../containers";

const Home = ({
    SignInFunction,
    SignOutFunction,
    user_properties = {
        userId: null, 
        username: null
    }
}) => {
    
    useEffect(() => {
        document.title = `Home | FindThatOST`;
    }, []);

    return (
        <div className='fto__page__home'>
            <div className='gradient__bg'>
                <Navbar 
                    SignInFunction={SignInFunction} 
                    SignOutFunction={SignOutFunction} 
                    user_properties={user_properties} />

                <div className='fto__page__home-content'>
                    <Header/>
                    <AskChatGPT />
                </div>
            </div>
		    <Footer />
        </div>
    )
}

export default Home