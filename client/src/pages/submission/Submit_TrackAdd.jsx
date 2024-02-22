import React, {useEffect, useState, createElement} from 'react';
import { useLocation, useParams } from "react-router-dom";
import './submission.css';

import { Navbar, Footer} from "../../components";
import { IoAdd, IoTrash } from "react-icons/io5";
import { IsEmpty } from '../../utils/RegularUtils';
import { GetUrlPlatform, GetPlatformIcon } from '../../utils/PlatformUtils';

const Submit_TrackAdd = () => {
    const location = useLocation();
    const { anime_id } = useParams();

    const searchParams = new URLSearchParams(location.search);
    const spEpisodeNo = parseInt(searchParams.get('episode_no'), 10) || -1;

    const [ inputs, setInputs ] = useState({});
    const [ userSubmission, setUserSubmission ] = useState({submit_streamPlat: []});
    const [ submissionContextInfo, setSubmissionContextInfo ] = useState();
    const [ platformItems, setPlatformItems ] = useState([{ id: 1, platform: 'non_basic' }]);
    const [ noOfPlatInputsCreated, setNoOfPlatInputsCreated ] = useState(1);
    const [ charCount_SceneDesc, setCharCount_SceneDesc] = useState('');
    const maxCharCountLength_SceneDesc = 200;
    
    useEffect(() => {
        document.title = `Submit | Add Track | AnimeID(${anime_id}) and EpisodeNo(${spEpisodeNo})`;
        console.log(`Render-Submit_TrackAdd (onMount): ${location.href}\nAnimeID:${anime_id}\nEpisodeNo:${spEpisodeNo}`);

        // Fetch page data for anime and corresponding epsiode
        FetchPageData(anime_id, spEpisodeNo);
    }, []);

    /**
     * Perform all fetches to set up the webpage.
     * 
     * @async
     * @function FetchPageData
     * @param {number|string}  nAnimeID - Page/Anime ID from url, corresponds to FindThatOST Anime ID.
     * @param {number|string}  nEpisodeNo -  Episode No track is being added to. -1 if added to no specific episode.
     * 
     */
    const FetchPageData = async (nAnimeID, nEpisodeNo = -1) => {
        try {
            // Fetch data from the backend
            const contextDataFromBackend = await FetchSubmissionContextDetails_FTO(nAnimeID, nEpisodeNo);
            console.log('Context Data from backend:', contextDataFromBackend[0]);
            setSubmissionContextInfo(contextDataFromBackend[0]);
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    /**
     * Get anime details for anime with corresponding FTO Anime ID.
     * 
     * @async
     * @function FetchSubmissionContextDetails_FTO
     * @param {number|string}  nAnimeID - Page/Anime ID from url, corresponds to FindThatOST Anime ID.
     * @param {number|string}  nEpisodeNo -  Episode No track is being added to. -1 if added to no specific episode.
     * @returns {Promise<Array<JSON>>|undefined} The array of json objects (max length 1) containing anime details.
     * 
     */
    const FetchSubmissionContextDetails_FTO = async (nAnimeID, nEpisodeNo) => {
        try {
            var apiUrl_fto = `/getSubmissionContext/track_add/${Number(nAnimeID)}`;
            if (nEpisodeNo != -1) {
                apiUrl_fto += `/episode_no/${Number(nEpisodeNo)}`
            }
            console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
            const response = await fetch(apiUrl_fto);
            if (response.status === 204) {
                // Page doesn't exist, redirect to page doesnt exist page
                console.error("Response status:", response.status, "\nLikely page doesn't exist. Redirecting to page.")
            }
            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error('Error fetching data from backend.');
        }
    }

    const handleAddPlatform = () => {
        const newPlatform = { id: noOfPlatInputsCreated + 1, platform: 'non_basic' };
        setPlatformItems(prevItems => [...prevItems, newPlatform]);
        setNoOfPlatInputsCreated(count => count + 1)
    }
    const handleRemovePlatform = (itemId) => {
        if (inputs.hasOwnProperty(`submit_streamPlat_item_${itemId}`)) {
            const newInputs = { ...inputs };
            delete newInputs[`submit_streamPlat_item_${itemId}`];
            setInputs(newInputs);
        }
        setPlatformItems(prevItems => prevItems.filter(item => item.id !== itemId));
    }
    const handlePlatformInputListener = (event, item_id) => {
        let platformString = GetUrlPlatform(String(event.target.value));

        const updatedItems = platformItems.map(item => {
            if (item.id === item_id) {
                return { ...item, platform: platformString };
            }
            return item;
        });
        setPlatformItems(updatedItems);
    }

    const handleChange_TrackAdd = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
    }
    const handleChange_TrackAdd_SceneDec = (event) => {
        // Update character count label
        setCharCount_SceneDesc(event.target.value);

        // Handle input character change
        handleChange_TrackAdd(event);
    }
    const handleChange_TrackAdd_StramPlat = (event, item_id) => {
        // Update input platform icon
        handlePlatformInputListener(event, item_id);

        // Handle input character change
        handleChange_TrackAdd(event)
    }
    const handleSubmit_TrackAdd = (event) => {
        event.preventDefault();
        console.log(inputs);
    }

    const ValidateInputs = () => {
        
    }

    /**
     * Perform all fetches to set up the webpage.
     * 
     * @async
     * @function FetchPostSubmissionTrackAdd_FTO
     * @param {number|string}  nAnimeID - Page/Anime ID from url, corresponds to FindThatOST Anime ID.
     * @param {number|string}  nEpisodeNo -  Episode No track is being added to. -1 if added to no specific episode.
     * @param {number|string}  nUserId - UserId of logged in user.
     * @param {object}  objUserSubmission - Page/Anime ID from url, corresponds to FindThatOST Anime ID.
     * 
     */
    const FetchPostSubmissionTrackAdd_FTO = async (nAnimeID, nEpisodeNo, nUserId, objUserSubmission) => {
        
        var apiUrl_fto = `/postSubmission/track_add/${Number(nAnimeID)}`;
        if (nEpisodeNo != -1) {
            apiUrl_fto += `/episode_no/${Number(nEpisodeNo)}`
        }
        console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
        const response = await fetch(apiUrl_fto, 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userSubmission }),
        });
        const responseStatus = response.status;
        const responseData = await response.json();
        return responseStatus;
    }

    return (
        <div className='fto__page__submission'>

            <div className='gradient__bg'>
                <Navbar />

                {submissionContextInfo !== undefined && (
                <div className='fto__page__submission-conten section__padding'>

                    <div className='fto__page__submission-content_heading_section'>
                        <h1 className='fto__page__submission-content_header_title gradient__text'>
                            Add Track
                            {(spEpisodeNo !== -1) ? (
                                ' to Episode ' + spEpisodeNo
                            ) : (
                                'to series'
                            )}
                        </h1>
                        <h4 className='fto__page__submission-content_header_subtitle'><strong>{submissionContextInfo.canonical_title}</strong></h4>
                        <hr className='fto__page__submission-horizontal_hr' />
                    </div>

                    <div className='fto__page__submission-main_content'>
                        <form onSubmit={ handleSubmit_TrackAdd }>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_trackName'>Enter Track Name<span className='fto-red__asterisk'>*</span>:</label>
                                <input id='submit_trackName' name='submit_trackName' type='text' className='fto_input' placeholder='Track Name'
                                onChange={ handleChange_TrackAdd }/>
                                <div className='fto__page__submission-main_content-align_end fto__pointer'>
                                    <IoAdd />
                                    <span>
                                        Add track from series archive 
                                    </span>
                                </div>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_artistName'>Enter Artist Name:</label>
                                <input id='submit_artistName' name='submit_artistName' type='text' className='fto_input' placeholder='Artist Name'
                                onChange={ handleChange_TrackAdd }/>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_labelName'>Enter Label Name:</label>
                                <input id='submit_labelName' name='submit_labelName' type='text' className='fto_input' placeholder='Label Name'
                                onChange={ handleChange_TrackAdd }/>
                            </div>
                            <div className='fto__page__submission-main_content-even_split'>
                                <div className='fto__page__submission-main_content-input_section fto__page__submission-main_content-left'>
                                    <label htmlFor='submit_releaseDate'>Enter Release Date:</label>
                                    <input id='submit_releaseDate' name='submit_releaseDate' type='date' className='fto_input' max={new Date().toLocaleDateString('fr-ca')}
                                    onChange={ handleChange_TrackAdd }/>
                                </div>
                                <div className='fto__page__submission-main_content-input_section fto__page__submission-main_content-right'>
                                    <label htmlFor='submit_songType'>Enter Song Type:</label>
                                    <select id='submit_songType' name='submit_songType' className='fto_input'
                                    onChange={ handleChange_TrackAdd }> 
                                        <option value="" defaultValue>-- Select Song Type --</option>
                                        <option value="submit_songType_OP">Opening Theme Song</option>
                                        <option value="submit_songType_ED">Ending Theme Song</option>
                                        <option value="submit_songType_BG">Background Song</option>
                                    </select>
                                </div>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_streamPlat'>Add Streaming Platform(s):</label>
                                <div id='fto__page__submission-main_content-streamPlat_items'>
                                    {platformItems.map(item => {
                                        return (
                                            <div id={`submit_streamPlat_item_`+ item.id} key={item.id}
                                            className='fto__page__submission-main_content-streamPlat_item'>
                                                <div className='delete_streamPlat_item'>
                                                    <IoTrash id={`delete_streamPlat_item_`+ item.id} onClick={() => handleRemovePlatform(item.id)}/>
                                                </div>
                                                <label className='ftoInput__streamPlat_label'>
                                                    <input id={`input_streamPlat_item_${item.id}`} name={`submit_streamPlat_item_${item.id}`} type='text' className='fto_input'  placeholder='Enter Streaming Platform URL'
                                                    onChange={ (ev) => { handleChange_TrackAdd_StramPlat(ev, item.id)}}/>
                                                    <img src={ GetPlatformIcon( item.platform ) } className='ftoInput__streamPlatIcon' alt='platform_img'/>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className='fto__page__submission-main_content-align_end fto__pointer' onClick={handleAddPlatform}>
                                    <span>
                                        Add platform 
                                    </span>
                                    <IoAdd />
                                </div>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_wikiaImgUrl'>Enter Fandom/Wikia Image URL:</label>
                                <input id='submit_wikiaImgUrl' name='submit_wikiaImgUrl' type='text' className='fto_input' 
                                placeholder='Wikia Image URL' onChange={ handleChange_TrackAdd }/>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_wikiaWebpageUrl'>Enter Fandom/Wikia Webpage URL:</label>
                                <input id='submit_wikiaWebpageUrl' name='submit_wikiaWebpageUrl' type='text' className='fto_input'
                                placeholder='Wikia Webpage URL' onChange={ handleChange_TrackAdd }/>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_embeddedYtUrl'>Enter Embedded YT Video URL:</label>
                                <input id='submit_embeddedYtUrl' name='submit_embeddedYtUrl' type='text' className='fto_input'
                                placeholder='Embedded YT Video URL' onChange={ handleChange_TrackAdd }/>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_sceneDesc'>Enter Scene Description:</label>
                                <textarea id='submit_sceneDesc' name='submit_sceneDesc' type='text' className='fto_input'
                                placeholder='Add Scene Description' onChange={ handleChange_TrackAdd_SceneDec }
                                maxLength={maxCharCountLength_SceneDesc} />
                                <div className='fto__page__submission-main_content-align_end'>
                                    <span>
                                        {charCount_SceneDesc.length}/{maxCharCountLength_SceneDesc} characters
                                    </span>
                                </div>
                            </div>
                            <div className='fto__page__submission-main_content-submit_section'>
                                <button className='fto__button__pink' type='submit'>
                                    Submit
                                </button>
                                <p className='fto__pointer'>Add to drafts</p>
                            </div>
                        </form>
                    </div>

                </div>
                )}

            </div>
		    <Footer />
        </div>
    )
}

export default Submit_TrackAdd