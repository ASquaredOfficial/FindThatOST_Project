import React from 'react';
import './askChatGPT.css';

import ai_img from '../../assets/ai.png';
import { useCustomNavigate } from '../../routing/navigation'
import { IsEmpty } from '../../utils/RegularUtils';

const AskChatGPT = () => {
    const { navigateToChatBot } = useCustomNavigate();

    const SubmitAskChatGPT = (event) => {
        event.preventDefault();
    
        const formElements = event.target.elements
        let inputElement = HTMLElement
        inputElement = formElements[`submit_userQuery`];
        if (!IsEmpty(inputElement.value)) {
            navigateToChatBot(inputElement.value);  // Call the function to send user query to Chatbot API and display response in chat window
        }
    }

    return (
        <div className='fto__askChatGPT' id='askchatgpt'>
            <div className='fto__askChatGPT-image'>
                <img src={ai_img} alt='ai' /> 
            </div>
            
            <div className='fto__askChatGPT-content'>
                <h1 className='gradient__text'>
                    Ask ChatGPT
                </h1>
                <p>
                    We have utilised AI technologies to revolutionise your search using ChatGPT to query our records for you. Give it a try!
                </p>

                <div className='fto__askChatGPT-content__input-section'>
                    <form id='ask_gpt_form' onSubmit={e => SubmitAskChatGPT(e)}>
                        <div className='fto__askChatGPT-content__input'>
                            <input name='submit_userQuery' type='search' placeholder='Enter question for ChatGPT' />
                            <button type='submit'>Ask ChatGPT</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AskChatGPT