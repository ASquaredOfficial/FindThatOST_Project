import React from 'react';

import { Navbar, Footer, } from "../../components";
import { Header, AskChatGPT} from "../../containers";

export default function Home() {
    return (
        <div className='fto__page__home'>
            { /*<div className='fto__navbar-bg'>
            </div>*/}
            Hello I am here
            <div className='gradient__bg'>
                <Navbar />
                <Header />
                <AskChatGPT />
            </div>
		    <Footer />
        </div>
    )
}