import React, {useEffect} from 'react';
import './home.css';


import { Navbar, Footer, } from "../../components";
import { Header, AskChatGPT} from "../../containers";

const Home = () => {
    
    useEffect(() => {
        document.title = `Home`;
    }, []);

    return (
        <div className='fto__page__home'>
            <div className='gradient__bg'>
                <Navbar />
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