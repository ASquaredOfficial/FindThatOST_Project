import React, {useEffect, useState} from 'react';
import './chatgptbot.css';

import { Navbar } from "../../components";
import { useLocation } from 'react-router-dom';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, MessageInput, TypingIndicator, Message} from '@chatscope/chat-ui-kit-react';
import { IsEmpty } from '../../utils/RegularUtils';
import { toast } from 'react-toastify';

const ChatGPTBot = ({
    SignInFunction,
    SignOutFunction,
    user_properties = {
        userId: null, 
        username: null
    }
}) => {
    // Get the location object
    const location = useLocation();

    const [ stateRequestedQuery, setStateRequestedQuery ]= useState()
    const [ contentHeight, setContentHeight ] = useState('100vh');
    const [ typing, setTyping ] = useState(false)
    const [ messages, setMessages ] = useState([
        { 
            message: "Hello, I am the FindThatOST Chatbot Assistant!\nAsk me a question about any anime tracks?",
            sender: "ChatGPT",
            direction: 'incoming',
        },
    ]);

    useEffect(() => {
        console.debug(`Render-ChatGPTBot (onMount): ${window.location.href}`);
        document.title = `ChatBOT`;

        // Access the state information
        const chatbotQuery = location.state?.chatbot_query;
        setStateRequestedQuery(chatbotQuery);

        // Resize screen when page height grows bigger than viewport height
        const pageContent = document.getElementById('fto__page__chatgptbot');
        const handleResize = () => {
            if (pageContent.scrollHeight > window.innerHeight) {
                setContentHeight('auto');
            } else {
                setContentHeight('100vh');
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Call initially to set the height
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (!typing) {
            FocusOnMessageInput();
        }
    }, [typing]);

    useEffect(() => {
        if (!IsEmpty(stateRequestedQuery)) {
            handleSendMessage(stateRequestedQuery)
        }
    }, [stateRequestedQuery]);

    const handleSendMessage = async (message) => {
        const newMessage = {
            message: message,
            sender: "user",
            direction: "outgoing"
        };

        // Update our messages state
        const updatedMessages = [...messages, newMessage]; // all the old messages, + the new message
        setMessages(updatedMessages);

        // Set a typing indicator (chatgpt is typing)
        setTyping(true);

        // Process message to ChatGPT (send it over and see the response)
        await FetchPostMessageToChatGPT_FTO(updatedMessages);

        // Remove a typing indicator (chatgpt is not typing anymore)
        setTyping(false);
    }

    /**
     * Get anime details for anime with corresponding FTO Anime ID.
     * 
     * @async
     * @function FetchPostMessageToChatGPT
     * @param {{ message:String, sender:String, direction:String }[]}  chatMessages - Page/Anime ID from url, corresponds to FindThatOST Anime ID.
     * @param {number|string}  [nUserId=1] -  Context/Occurrence ID (search param) from url,for API query.
     * @returns {Promise<>|undefined} The array of json objects (max length 1) containing anime details.
     * 
     */
    async function FetchPostMessageToChatGPT_FTO(chatMessages) {
        let objMsgHistory = chatMessages.map((messageObject) => {
            let role = '';
            if (messageObject.sender === 'ChatGPT') {
                role = 'assistant';
            }
            else if (messageObject.sender === 'user'){
                role = 'user';
            }
            return { role: role, content: messageObject.message};
        })


        const objChatGPTQuery = {
            msg_history: objMsgHistory,
        };
        let apiUrl_fto = `/findthatost_api/openai/assistant`;
        console.debug(`Fetch gpt response, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
        const chatGptReponse = await fetch(apiUrl_fto, 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ objChatGPTQuery }),
        });
    
        console.log("ChatGPT Response:", chatGptReponse)
        const responseJson = await chatGptReponse.json()
        if (chatGptReponse.status === 200) {
            const chatGptReponseMessage = {
                message: responseJson.message,
                sender: "ChatGPT",
                direction: "incoming"
            };
            chatMessages.push(chatGptReponseMessage)
            setMessages(chatMessages);
        } else {
            console.error('Error response:', responseJson)
            toast("An internal error has occurred with the FindThatOST server. Please try again later.",{
                theme: 'dark'
            })
        }
    }

    const FocusOnMessageInput = () => {
        const msgInputParentDiv = document.getElementById('fto__page__chatgptbot-content-msg_input').getElementsByClassName('cs-message-input__content-editor');
        const msgInputDiv = msgInputParentDiv[0]
        msgInputDiv.focus();
    }

    return (
        <div id='fto__page__chatgptbot' className='fto__page__chatgptbot gradient__bg' style={{ height: contentHeight}}>
            <Navbar 
                SignInFunction={SignInFunction} 
                SignOutFunction={SignOutFunction} 
                user_properties={user_properties} />

            <div className='fto__page__chatgptbot-content section__padding' style={{paddingBottom: 0}}>
                <h3 style={{ fontFamily: 'var(--font-family-manrope)', color: 'white'}}>
                    FTO Chatbot Assistant
                </h3>
                <MainContainer className='fto__page__chatgptbot-content-main_container' 
                    style={{ borderTop: '0px', borderBottom: '0px', borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}}>
                    
                    <ChatContainer 
                        style={{background: 'linear-gradient(180deg, var(--color-bg-navbar_search_border), transparent)', paddingTop:'5px'}}>
                        
                        <MessageList 
                            style={{background: 'transparent'}}
                            typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing" style={{ width: '100%' }}/> : null}>
                            
                            {messages.map((message, i) => {
                                return (
                                    <Message key={i} model={message}/>
                                )
                            })}
                        </MessageList>
                        
                        <MessageInput id='fto__page__chatgptbot-content-msg_input' placeholder='Type your message...' onSend={ handleSendMessage } disabled={typing} tabIndex={0}
                            style={{ background: 'var(--color-bg-navbar_search_border)' }} attachDisabled={true} attachButton={false}/>
                    </ChatContainer>
                </MainContainer>
            </div>
        </div>
    )
}

export default ChatGPTBot