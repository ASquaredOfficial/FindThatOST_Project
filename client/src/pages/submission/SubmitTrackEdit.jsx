import React, {useEffect, useState} from 'react';
import { useLocation, useParams } from "react-router-dom";
import './submission.css';

import { Navbar, Footer} from "../../components";
import { IoAdd, IoTrash } from "react-icons/io5";
import { GetShorthandDateFromString, IsEmpty, sortJsonObjectAlphabeticallyExceptLast } from '../../utils/RegularUtils';
import { GetUrlPlatform, GetPlatformIcon, IsFandomImageUrl, IsFandomCommunityWebsiteUrl, GetFandomImageUrlFromFullUrl, IsYoutubeVideoUrl, StandardiseTrackUrl, GetFandomWikiaIcon, GetIdFromYoutubeUrl, GetPlatformTrackBaseUrl, GeneratePlatformUrlFromID } from '../../utils/HyperlinkUtils';
import { useCustomNavigate } from '../../routing/navigation'
import { AddPlatformInputToPage, ListenToPlatformInput, RemovePlatformInputFomPage, ValidateInputs } from './submission';
import { ConvertTrackTypeToValue } from '../../utils/FTOApiUtils';

const SubmitTrackEdit = () => {
    const { navigateToEpisode, navigateToTrack } = useCustomNavigate();
    const location = useLocation();
    const { track_id } = useParams();

    const searchParams = new URLSearchParams(location.search);
    const spOccurrenceId = parseInt(searchParams.get('context_id'), 10) || -1;
    const spEpisodeNo = parseInt(searchParams.get('occurrence_id'), 10) || -1;

    const [ ftoEpisodeID, setFtoEpisodeID ] = useState(-1);
    const [ pageLoading, setPageLoading ] = useState(false);
    const [ pageInputs, setPageInputs ] = useState({});
    const [ userSubmission, setUserSubmission ] = useState({submit_streamPlat: []});
    const [ submissionContextInfo, setSubmissionContextInfo ] = useState();
    const [ platformItems, setPlatformItems ] = useState([{ id: 1, platform: 'non_basic', inputString: '', placeholder: '' }]);
    const [ noOfPlatInputsCreated, setNoOfPlatInputsCreated ] = useState(1);
    const [ selectedSongType, setSelectedSongType ] = useState('');
    const [ originalSongTypeOption, setDefaultSongTypeOption ] = useState('');
    const [ enteredReleaseDate, setEnteredReleaseDate ] = useState('');
    const [ originalReleaseDate, setOriginalReleaseDate ] = useState('');
    const [ successfulSubmitQuery, setSuccessfulSubmitQuery ] = useState();
    const [ charCount_SceneDesc, setCharCount_SceneDesc] = useState('');
    const [ charCount_editReasons, setCharCount_editReasons] = useState('');
    const maxCharCountLength_SceneDesc = 200;
    const maxCharCountLength_editReasons = 200;
    
    useEffect(() => {
        document.title = `Submit | Edit Track | TrackID(${track_id}) and OccurrenceID(${spOccurrenceId})`;
        console.log(`Render-SubmitTrackEdit (onMount): ${window.location.href}\nTrackID:${track_id}\nOccurrenceID:${spOccurrenceId}`);

        // Fetch page data for anime and corresponding epsiode
        FetchPageData(track_id, spOccurrenceId);
    }, []);

    useEffect(() => {
        let ftoPageElem = document.getElementById('fto__page');
        let listOfClassNames = ftoPageElem.className.split(" ");
        if (pageLoading === true) {
            // if page doesn't have the class, add loading class
            if (listOfClassNames.indexOf('fto_loading-cursor') === -1) {
                listOfClassNames.unshift('fto_loading-cursor');
                ftoPageElem.className =  listOfClassNames.join(' ').trim();
            }
        }
        else {
            // if page does have the class, remove loading
            if (listOfClassNames.indexOf('fto_loading-cursor') !== -1) {
                let classNameIndex = Number(listOfClassNames.findIndex(item => item === "fto_loading-cursor"));
                listOfClassNames.splice(classNameIndex, 1);
                ftoPageElem.className = listOfClassNames.join(' ').trim();
            }
        }
    }, [pageLoading]);

    useEffect(() => {
        if (submissionContextInfo !== undefined) {
            if (submissionContextInfo.hasOwnProperty('episode_id')) {
                setFtoEpisodeID(submissionContextInfo.episode_id);
            }
            
            setPageFormValues(submissionContextInfo);
        }
    }, [submissionContextInfo]);

    /**
     * Perform all fetches to set up the webpage.
     * 
     * @async
     * @function FetchPageData
     * @param {number|string}  nTrackID - Page/Track ID from url, corresponds to FindThatOST Track ID.
     * @param {number|string}  nOccurrenceID -  Occurrence ID for the episode the track was in. -1 if added to no specific episode.
     * 
     */
    const FetchPageData = async (nTrackID, nOccurrenceID = -1) => {
        try {
            // Fetch data from the backend
            const contextDataFromBackend = await FetchSubmissionContextDetails_FTO(nTrackID, nOccurrenceID);
            console.log('Context Data from backend:', contextDataFromBackend[0]);

            const submissionContext = {};
            submissionContext['submit_trackName'] = String(contextDataFromBackend[0].track_name);
            submissionContext['submit_songType'] = (!IsEmpty(contextDataFromBackend[0].release_date)) ? ConvertTrackTypeToValue(contextDataFromBackend[0].track_type) : '';
            submissionContext['submit_releaseDate'] = (!IsEmpty(contextDataFromBackend[0].release_date)) ? GetShorthandDateFromString(contextDataFromBackend[0].release_date) : '';
            submissionContext['submit_artistName'] = (!IsEmpty(contextDataFromBackend[0].artist_name)) ? String(contextDataFromBackend[0].artist_name) : '';
            submissionContext['submit_labelName'] = (!IsEmpty(contextDataFromBackend[0].label_name)) ? String(contextDataFromBackend[0].label_name) : '';
            submissionContext['submit_wikiaImgUrl'] = (!IsEmpty(contextDataFromBackend[0].fandome_image_link)) ? String(contextDataFromBackend[0].fandome_image_link) : '';
            submissionContext['submit_wikiaWebpageUrl'] = (!IsEmpty(contextDataFromBackend[0].fandom_webpage_link)) ? String(contextDataFromBackend[0].fandom_webpage_link) : '';
            submissionContext['submit_embeddedYtUrl'] = (!IsEmpty(contextDataFromBackend[0].embedded_yt_video_id)) ? String(contextDataFromBackend[0].embedded_yt_video_id) : '';
            submissionContext['submit_sceneDesc'] = (!IsEmpty(contextDataFromBackend[0].scene_description)) ? String(contextDataFromBackend[0].scene_description) : '';
            submissionContext['submit_streamPlat'] = (!IsEmpty(contextDataFromBackend[0].streaming_platform_links)) ? JSON.parse(contextDataFromBackend[0].streaming_platform_links) : {};
            setSubmissionContextInfo(submissionContext);
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    /**
     * Get track details for anime with corresponding FTO Track ID (and occurrence ID if applicable).
     * 
     * @async
     * @function FetchSubmissionContextDetails_FTO
     * @param {number|string}  nTrackID - Page/Track ID from url, corresponds to FindThatOST Track ID.
     * @param {number|string}  nOccurrenceID -  Occurrence ID for the episode the track was in. -1 if added to no specific episode.
     * @returns {Promise<Array<JSON>>|undefined} The array of json objects (max length 1) containing anime details.
     * 
     */
    const FetchSubmissionContextDetails_FTO = async (nTrackID, nOccurrenceID) => {
        try {
            let apiUrl_fto = `/findthatost_api/getSubmissionContext/track_edit/${Number(nTrackID)}`;
            if (nOccurrenceID !== -1) {
                apiUrl_fto += `/occurrence_id/${Number(nOccurrenceID)}`
            }
            console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
            const response = await fetch(apiUrl_fto);
            if (response.status === 204) {
                // TODO - Page doesn't exist, redirect to page doesnt exist page
                console.error("Response status:", response.status, "\nLikely page doesn't exist. Redirecting to page.")
            }
            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error('Error fetching data from backend.\nError:', error.message);
        }
    }

    /**
     * Handle Add Platform Input onClick.
     * @function handleAddPlatform
     * @returns {undefined} 
     * 
     */
    const handleAddPlatform = () => {
        AddPlatformInputToPage({setPlatformItems, setNoOfPlatInputsCreated}, noOfPlatInputsCreated);
    }

    /**
     * Handle Add Platform Input onClick.
     * @function handleRemovePlatform
     * @returns {undefined} 
     * 
     */
    const handleRemovePlatform = (itemId) => {
        RemovePlatformInputFomPage(itemId, {setPlatformItems, setUserSubmission})
    }

    const handleChange_TrackEdit = (event) => {
        let inputElement = HTMLElement;
        inputElement = event.target;
        const inputElementName = String(inputElement.name);
        const inputElementValue = inputElement.value;
        setPageInputs(values => ({...values, [inputElementName]: inputElementValue}));
        
        // Validate input, if its in error state
        let listOfClassNames = inputElement.className.split(" ");
        let classNameIndex = Number(listOfClassNames.findIndex(item => item === "fto_input-error"));
        if (classNameIndex > -1) {
            if (inputElementName.startsWith('submit_streamPlat_item_')) {
                //Validate for streaming platform input
                //Only way streamPlat input is error, is becuase duplicate platforms found.

                // Get platform input item id
                const platInputNamePrefix = 'submit_streamPlat_item_';
                const regex = new RegExp(`${platInputNamePrefix}(\\d+)$`);
                const match = regex.exec(inputElementName);
                const platElemId = match ? parseInt(match[1]) : null;

                if (platElemId !== null) {
                    // Get old state of input, before change
                    const foundObject = pageInputs.submit_streamPlat.find(platObj => platObj.id === platElemId);
                    console.debug(`Platform input for element Name${inputElementName} used to be:`, foundObject);

                    const inputDuplucatePlatform = foundObject.platform;
                    if (inputDuplucatePlatform !== 'non_basic') {
                        // Get check if current input is still the same platform
                        if (GetUrlPlatform(inputElementValue) === inputDuplucatePlatform) {
                            // Don't Remove error
                            return;
                        }

                        // Un-error duplicate platform inputs, if no more duplicate platforms
                        const filteredArray = pageInputs.submit_streamPlat.filter(platObj => {
                            return ((platObj.platform === inputDuplucatePlatform) && (platObj.id !== platElemId));
                        });
                        const numberOfObjects = filteredArray.length;
                        if (numberOfObjects < 2) {
                            filteredArray.forEach(platformInputDetails => {
                                console.log(`Duplicate Input:`, platformInputDetails);

                                let submissionFormElems = document.getElementById(`track_add_form`);
                                let inputElem = submissionFormElems[`submit_streamPlat_item_${platformInputDetails.id}`];
                                if (inputElem !== null) {
                                    // Variable still exists, remove error
                                    let inputClassNames = inputElem.className.split(" ");
                                    console.log(`Duplicate Input Element does exists, and has classes:`, inputClassNames);

                                    let errorClassNameIndex = Number(inputClassNames.findIndex(item => item === "fto_input-error"));
                                    inputClassNames.splice(errorClassNameIndex, 1);
                                    inputElem.className = inputClassNames.join(' ').trim();
                                    console.log(`Duplicate Input ID(submit_streamPlat_item_${platformInputDetails.id}) Element New classes:`, inputClassNames);
                                }
                            })
    
                            // Remove error from inputs that aren't duplicate anymore 
                            const listOfPlatformInputs = userSubmission.submit_streamPlat.filter(platObj => {
                                return (platObj.id !== platElemId);
                            });
                            setUserSubmission(prevState => ({...prevState, submit_streamPlat: listOfPlatformInputs}));
                        }
                    }
                }
            }
            else if (!IsEmpty(inputElementValue)) {
                //If input is not empty, check if further validation needed for some specific inputs

                //Further Validation for date input
                if(inputElement.tagName.toLowerCase() === 'input' && inputElement.type === 'date') {
                    //If date is bigger than current date, do not remove error
                    if (new Date(inputElementValue).getTime() > new Date().getTime()) {
                        return;
                    }
                }

                //Further Validation for fandom wikia image url
                if (inputElementName === 'submit_wikiaImgUrl' && !IsFandomImageUrl(inputElementValue)) {
                    return;
                }

                //Further Validation for fandom wikia webpage url
                if (inputElementName === 'submit_wikiaWebpageUrl' && !IsFandomCommunityWebsiteUrl(inputElementValue)) {
                    return;
                }

                //Further Validation for embedded youtube video url
                if (inputElementName === 'submit_embeddedYtUrl' && !IsYoutubeVideoUrl(inputElementValue)) {
                    return;
                } 
            }
            else {
                //If input is empty, check if further validation needed for the specified inputs
                let emptyInputValid = false;
                if (inputElementName === 'submit_wikiaImgUrl') {
                    //Validate for fandom wikia image url
                    emptyInputValid = true;
                }
                else if (inputElementName === 'submit_wikiaWebpageUrl') {
                    //Validate for fandom wikia webpage url
                    emptyInputValid = true;
                }
                else if (inputElementName === 'submit_embeddedYtUrl') {
                    //Validate for fandom wikia webpage url
                    emptyInputValid = true;
                }

                if (!emptyInputValid) {
                    // The input is not allowed to be empty, thus the input invalid 
                    return;
                }
            }

            //Remove error style from Input
            listOfClassNames.splice(classNameIndex, 1);

            //Update input cascade styling (via className)
            event.target.className = listOfClassNames.join(' ').trim();
        }

        // Update character count label for sceneDescription
        if (inputElementName === 'submit_sceneDesc') {
            setCharCount_SceneDesc(inputElementValue);
        }
        // Update character count label for sceneDescription
        else if (inputElementName === 'submit_editReason') {
            setCharCount_editReasons(inputElementValue);
        }
        // Update input tracker for placeholder styling
        else if (inputElementName === 'submit_songType') {
            setSelectedSongType(inputElementValue)
        }
        // Update input tracker for placeholder styling
        else if (inputElementName === 'submit_releaseDate') {
            setEnteredReleaseDate(inputElementValue)
        }
        // Update input platform icon
        else if (inputElementName.startsWith('submit_streamPlat_item_')) {
            // Get platform input item id
            const platInputNamePrefix = 'submit_streamPlat_item_';
            const regex = new RegExp(`${platInputNamePrefix}(\\d+)$`);
            const match = regex.exec(inputElementName);
            const platElemId = match ? parseInt(match[1]) : null;

            ListenToPlatformInput(inputElementValue, platElemId, platformItems, { setPlatformItems });
        }
    }

    const setPageFormValues = (pageValues) => {
        // Set original (placeholder) values to edit
        const pageform = document.getElementById('track_edit_form');
        if (!IsEmpty(pageValues.submit_trackName)) {
            pageform['submit_trackName'].placeholder = pageValues.submit_trackName;
        }
        if (!IsEmpty(pageValues.submit_songType)) {
            pageform['submit_songType'].value = pageValues.submit_songType;
            setDefaultSongTypeOption(pageform['submit_songType'].value); // Apply Setter Functions 
            setSelectedSongType(pageform['submit_songType'].value); // Apply Setter Functions 
        }
        if (!IsEmpty(pageValues.submit_releaseDate)) {
            pageform['submit_releaseDate'].value = pageValues.submit_releaseDate;
            setEnteredReleaseDate(pageform['submit_releaseDate'].value)
            setOriginalReleaseDate(pageform['submit_releaseDate'].value)
        }
        if (!IsEmpty(pageValues.submit_artistName)) {
            pageform['submit_artistName'].placeholder = pageValues.submit_artistName;
        }
        if (!IsEmpty(pageValues.submit_labelName)) {
            pageform['submit_labelName'].placeholder = pageValues.submit_labelName;
        }
        if (!IsEmpty(pageValues.submit_wikiaImgUrl)) {
            pageform['submit_wikiaImgUrl'].placeholder = pageValues.submit_wikiaImgUrl;
        }
        if (!IsEmpty(pageValues.submit_wikiaWebpageUrl)) {
            pageform['submit_wikiaWebpageUrl'].placeholder = pageValues.submit_wikiaWebpageUrl;
        }
        if (!IsEmpty(pageValues.submit_embeddedYtUrl)) {
            pageform['submit_embeddedYtUrl'].placeholder = GetPlatformTrackBaseUrl('youtube') + pageValues.submit_embeddedYtUrl;
        }
        if (!IsEmpty(pageValues.submit_sceneDesc)) {
            pageform['submit_sceneDesc'].placeholder = pageValues.submit_sceneDesc;
            setCharCount_SceneDesc(pageform['submit_sceneDesc'].value); // Apply Setter Functions 
        }
        if (!IsEmpty(pageValues['submit_streamPlat']) && typeof (pageValues['submit_streamPlat']) == 'object' && pageValues['submit_streamPlat'].hasOwnProperty('data')) {
            // Set streaming platforms page variable
            let itemId = 1;
            let trackPlatformData = pageValues['submit_streamPlat'].data;
            let streamingPlatformsItems = [];
            if (trackPlatformData.hasOwnProperty('youtube') && !IsEmpty(trackPlatformData.youtube)) {
                let plaftormLink = {
                    id: itemId++, 
                    platform: 'youtube',
                    inputString: '',
                };
                plaftormLink.placeholder = GetPlatformTrackBaseUrl(plaftormLink.platform) + trackPlatformData.youtube;
                streamingPlatformsItems.push(plaftormLink);
            } if (trackPlatformData.hasOwnProperty('youtube_music') && !IsEmpty(trackPlatformData.youtube_music)) {
                let plaftormLink = {
                    id: itemId++, 
                    platform: 'youtube_music',
                    inputString: '',
                };
                plaftormLink.placeholder = GetPlatformTrackBaseUrl(plaftormLink.platform) + trackPlatformData.youtube_music;
                streamingPlatformsItems.push(plaftormLink);
            } if (trackPlatformData.hasOwnProperty('spotify') && !IsEmpty(trackPlatformData.spotify)) {
                let plaftormLink = {
                    id: itemId++, 
                    platform: 'spotify',
                    inputString: '',
                };
                plaftormLink.placeholder = GetPlatformTrackBaseUrl(plaftormLink.platform) + trackPlatformData.spotify;
                streamingPlatformsItems.push(plaftormLink);
            } if (trackPlatformData.hasOwnProperty('shazam') && !IsEmpty(trackPlatformData.shazam)) {
                let plaftormLink = {
                    id: itemId++, 
                    platform: 'shazam',
                    inputString: '',
                };
                plaftormLink.placeholder = GetPlatformTrackBaseUrl(plaftormLink.platform) + trackPlatformData.shazam;
                streamingPlatformsItems.push(plaftormLink);
            } if (trackPlatformData.hasOwnProperty('apple_music') && !IsEmpty(trackPlatformData.apple_music)) {
                let plaftormLink = {
                    id: itemId++, 
                    platform: 'apple_music',
                    inputString: '',
                };
                plaftormLink.placeholder = GetPlatformTrackBaseUrl(plaftormLink.platform) + trackPlatformData.apple_music;
                streamingPlatformsItems.push(plaftormLink);
            } if (trackPlatformData.hasOwnProperty('amazon_music') && !IsEmpty(trackPlatformData.amazon_music)) {
                let plaftormLink = {
                    id: itemId++, 
                    platform: 'amazon_music',
                    inputString: '',
                };
                plaftormLink.placeholder = GetPlatformTrackBaseUrl(plaftormLink.platform) + trackPlatformData.amazon_music;
                streamingPlatformsItems.push(plaftormLink);
            } if (trackPlatformData.hasOwnProperty('non_basic') && !IsEmpty(trackPlatformData.non_basic)) {
                for (let i = 0; i < trackPlatformData.non_basic.length; i++) {
                    let plaftormLink = {
                        id: itemId++, 
                        platform: 'non_basic',
                        inputString: '',
                    };
                    plaftormLink.placeholder = trackPlatformData.non_basic[i].url;
                    streamingPlatformsItems.push(plaftormLink);
                }
            }
            console.log("New Streaming Links:", streamingPlatformsItems);
            setPlatformItems(streamingPlatformsItems);
            setNoOfPlatInputsCreated(streamingPlatformsItems.length)
        }
    }

    /**
     * Perform all fetches to set up the webpage.
     * @async
     * @function FetchPostSubmissionTrackEdit_FTO
     * @param {number|string}  nAnimeID - Page/Anime ID from url, corresponds to FindThatOST Anime ID.
     * @param {number|string}  nEpisodeNo -  Episode No track is being added to. -1 if added to no specific episode.
     * @param {object}  objUserSubmission - Page/Anime ID from url, corresponds to FindThatOST Anime ID.
     * @param {number|string}  nUserId - UserId of logged in user.
     * 
     */
    const FetchPostSubmissionTrackEdit_FTO = async (nAnimeID, nEpisodeNo, objUserSubmission, nUserId = 1) => {
        objUserSubmission['user_id'] = nUserId;
        let apiUrl_fto = `/findthatost_api/postSubmission/track_add/${Number(nAnimeID)}`;
        if (nEpisodeNo !== -1) {
            apiUrl_fto += `/episode_id/${Number(submissionContextInfo.episode_id)}`
        }
        console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
        const response = await fetch(apiUrl_fto, 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ objUserSubmission }),
        });

        const responseStatus = response.status;
        const responseData = await response.json();
        if (responseStatus === 200) {    
            console.debug("Response Data:", responseData);
            setSuccessfulSubmitQuery(true);
        } else {
            console.error('Error:', responseData);
            setSuccessfulSubmitQuery(false);
        }
    }

    const handleSubmit_TrackEdit = async (event) => {
        if (successfulSubmitQuery === true) {
            // Successfully added track, unauthorised attempt to submit request
            return;
        }
        event.preventDefault();
        setPageLoading(true);
        
        const formValues = event.target.elements // as HTMLFormControlsCollection;
        let inputsValid = ValidateInputs(formValues, platformItems, {setUserSubmission, setPlatformItems, setPageInputs}, pageInputs);
        if (inputsValid) {
            //Format streaming platforms json
            let jsonDataObject = {}
            let listOfNonBasicUrls = [];
            platformItems.forEach(platItem => {
                if (!IsEmpty(platItem.inputString)) {
                    if (platItem.platform !== 'non_basic') {
                        jsonDataObject[platItem.platform] = StandardiseTrackUrl(platItem.inputString, platItem.platform);
                    }
                    else {
                        let nonBasicUrlObj = {};
                        nonBasicUrlObj['url'] = platItem.inputString;
                        listOfNonBasicUrls.push(nonBasicUrlObj);
                    }
                }
            })
            if (listOfNonBasicUrls.length > 0) {
                jsonDataObject.non_basic = listOfNonBasicUrls;
            }
            const jsonSubmission = {data: sortJsonObjectAlphabeticallyExceptLast(jsonDataObject, 'non_basic')};

            // Update userSubmission
            const updatedSubmission = { 
                ...userSubmission, 
                submit_streamPlat: jsonSubmission 
            }; 
            for (const [key, value] of Object.entries(pageInputs)) {
                if (key.startsWith('submit_streamPlat')) {
                    // Skip if the key starts with 'submit_streamPlat'
                    continue;
                }
                else if (key === 'submit_songType') {
                    if (value === 'songType_OP') {
                        updatedSubmission[key] = 'OP';
                    } else if (value === 'songType_ED') {
                        updatedSubmission[key] = 'ED';
                    } else if (value === 'songType_BGM') {
                        updatedSubmission[key] = 'BGM';
                    } else {
                        updatedSubmission[key] = '';
                    }
                }
                else if (key === 'submit_embeddedYtUrl') {
                    updatedSubmission[key] = GetIdFromYoutubeUrl(value);
                }
                else if (key === 'submit_wikiaImgUrl') {
                    updatedSubmission[key] = GetFandomImageUrlFromFullUrl(value);
                }
                else {
                    updatedSubmission[key] = value;
                }
            }
            setUserSubmission(updatedSubmission);
            
            console.debug(`Fetch data:`, updatedSubmission);  
            await new Promise(resolve => setTimeout(resolve, 1000));  
            // FetchPostSubmissionTrackEdit_FTO(track_id, spEpisodeNo, updatedSubmission);
        }
        setPageLoading(false);
    }

    const handleModalOnButtonClick = () => {
        if (successfulSubmitQuery === true) {
            if (ftoEpisodeID !== -1) {
                navigateToTrack(track_id, spOccurrenceId);
            }
            else {
                //navigateToEpisode(anime_id, spEpisodeNo);
            }
        }
        else {
            setSuccessfulSubmitQuery();
        }
    }
    

    return (
        <div id='fto__page' className='fto__page__submission'>
            {pageLoading && (
                <div className='fto_loading'>
                    <div className='fto_modal_overlay-bg fto_loading-cursor' />
                    <div className={'fto_loading-text_section fto_input'} style={
                            { 
                                position: 'fixed', 
                                top: '50%', 
                                left: '50%', 
                                transform: 'translate(-50%, -50%)', 
                                padding: '20px',
                            }
                        }>
                        <p className={'fto_loading-text fto_unselectable'}>
                            Loading...
                        </p>
                        <div className="fto_loading-loader" />
                    </div>
                </div>
            )}

            <div className='gradient__bg'>
                <Navbar />

                {(submissionContextInfo !== undefined)  && (
                <div className='fto__page__submission-content section__padding'>

                    <div className='fto__page__submission-content_heading_section'>
                        <h1 className='fto__page__submission-content_header_title gradient__text'>
                            Edit Track
                            {(spEpisodeNo !== -1) ? (
                                ' in Episode ' + spEpisodeNo
                            ) : (
                                ' in Series'
                            )}
                        </h1>
                        <h4 className='fto__page__submission-content_header_subtitle'><strong>{submissionContextInfo.canonical_title}</strong></h4>
                        <hr className='fto__page__submission-horizontal_hr' />
                    </div>
                    
                    <div className='fto__page__submission-main_content'>
                        <form id='track_edit_form' onSubmit={ handleSubmit_TrackEdit }>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_trackName'>Edit Track Name<span className='fto-red__asterisk'>*</span>:</label>
                                <input id='submit_trackName' name='submit_trackName' type='text' className='fto_input' placeholder='Track Name'
                                onChange={ handleChange_TrackEdit }/>
                            </div>
                            <div className='fto__page__submission-main_content-even_split fto__page__submission-main_content-even_split_gap'>
                                <div className='fto__page__submission-main_content-input_section fto__page__submission-main_content-left'>
                                    <label htmlFor='submit_songType'>Edit Song Type<span className='fto-red__asterisk'>*</span>:</label>
                                    <select id='submit_songType' name='submit_songType' className='fto_input' value={selectedSongType}
                                    style={{ color: originalSongTypeOption === selectedSongType ? 'grey' : 'white' }}
                                    onChange={ handleChange_TrackEdit }> 
                                        <option value="" defaultValue style={{ color: originalSongTypeOption === '' ? 'grey' : 'white' }}>
                                            -- Select Song Type --
                                        </option>
                                        <option value="songType_OP" style={{ color: originalSongTypeOption === 'songType_OP' ? 'grey' : 'white' }}>
                                            Opening Theme Song
                                        </option>
                                        <option value="songType_ED" style={{ color: originalSongTypeOption === 'songType_ED' ? 'grey' : 'white' }}>
                                            Ending Theme Song
                                        </option>
                                        <option value="songType_BGM" style={{ color: originalSongTypeOption === 'songType_BGM' ? 'grey' : 'white' }}>
                                            Background Song
                                        </option>
                                    </select>
                                </div>
                                <div className='fto__page__submission-main_content-input_section fto__page__submission-main_content-right'>
                                    <label htmlFor='submit_releaseDate'>Edit Release Date:</label>
                                    <input id='submit_releaseDate' name='submit_releaseDate' type='date' className='fto_input' 
                                    max={new Date().toLocaleDateString('fr-ca')} value={enteredReleaseDate}
                                    style={{ color: originalReleaseDate === enteredReleaseDate ? 'grey' : 'white' }}
                                    onChange={ handleChange_TrackEdit }/>
                                </div>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_artistName'>Edit Artist Name:</label>
                                <input id='submit_artistName' name='submit_artistName' type='text' className='fto_input' placeholder='Artist Name'
                                onChange={ handleChange_TrackEdit }/>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_labelName'>Edit Label Name:</label>
                                <input id='submit_labelName' name='submit_labelName' type='text' className='fto_input' placeholder='Label Name'
                                onChange={ handleChange_TrackEdit }/>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_streamPlat'>Edit Streaming Platform(s):</label>
                                <div id='fto__page__submission-main_content-streamPlat_items' name='submit_streamPlat'>
                                    {platformItems.map(item => {
                                        return (
                                            <div id={`streamPlat_item_section_`+ item.id} key={item.id}
                                            className='fto__page__submission-main_content-streamPlat_item'>
                                                <div className='delete_streamPlat_item'>
                                                    <IoTrash id={`delete_streamPlat_item_`+ item.id} onClick={() => handleRemovePlatform(item.id)}/>
                                                </div>
                                                <label className='fto-input-drawableIconStart_label'>
                                                    <img src={ GetPlatformIcon( (IsEmpty(item.inputString) && !IsEmpty(item.placeholder)) ? GetUrlPlatform(item.placeholder) : item.platform ) } 
                                                    className='fto-input-drawableIconStart_img' alt='platform_img'/>
                                                    <input id={`submit_streamPlat_item_${item.id}`} name={`submit_streamPlat_item_${item.id}`} type='text' className='fto_input' 
                                                    placeholder={ !IsEmpty(item.placeholder) ? item.placeholder : 'Enter Streaming Platform URL' } value={ item.inputString }
                                                    onChange={ (ev) => { handleChange_TrackEdit(ev) } }/>
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
                                <label htmlFor='submit_wikiaImgUrl'>Edit Fandom/Wikia Image URL:</label>
                                <label className='fto-input-drawableIconStart_label'>
                                    <img src={ GetFandomWikiaIcon( 'fandom_img', (IsEmpty(pageInputs.submit_wikiaImgUrl)) ? submissionContextInfo.submit_wikiaImgUrl : pageInputs.submit_wikiaImgUrl ) } 
                                    className='fto-input-drawableIconStart_img' alt='platform_img'/>
                                    <input id='submit_wikiaImgUrl' name='submit_wikiaImgUrl' type='text' className='fto_input' 
                                        placeholder='Wikia Image URL' onChange={ handleChange_TrackEdit }/>
                                </label>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_wikiaWebpageUrl'>Edit Fandom/Wikia Webpage URL:</label>
                                <label className='fto-input-drawableIconStart_label'>
                                    <img src={ GetFandomWikiaIcon( 'fandom_web', (IsEmpty(pageInputs.submit_wikiaWebpageUrl)) ? submissionContextInfo.submit_wikiaWebpageUrl : pageInputs.submit_wikiaWebpageUrl ) }
                                    className='fto-input-drawableIconStart_img' alt='platform_img'/>
                                    <input id='submit_wikiaWebpageUrl' name='submit_wikiaWebpageUrl' type='text' className='fto_input'
                                        placeholder='Wikia Webpage URL' onChange={ handleChange_TrackEdit }/>
                                </label>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_embeddedYtUrl'>Edit Embedded YT Video URL:</label>
                                <label className='fto-input-drawableIconStart_label'>
                                    <img src={ 
                                        GetPlatformIcon( 
                                            GetUrlPlatform((IsEmpty(pageInputs.submit_embeddedYtUrl)) ? 
                                            GeneratePlatformUrlFromID(submissionContextInfo.submit_embeddedYtUrl, 'youtube') : pageInputs.submit_embeddedYtUrl), 
                                            'youtube' 
                                        ) 
                                    } 
                                    className='fto-input-drawableIconStart_img' alt='platform_img'/>
                                    <input id='submit_embeddedYtUrl' name='submit_embeddedYtUrl' type='text' className='fto_input'
                                    plaeholder='Embedded YT Video URL' onChange={ handleChange_TrackEdit }/>
                                </label>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_sceneDesc'>Edit Scene Description:</label>
                                <textarea id='submit_sceneDesc' name='submit_sceneDesc' type='text' className='fto_input'
                                placeholder='Add Scene Description' onChange={ handleChange_TrackEdit }
                                maxLength={ maxCharCountLength_SceneDesc } />
                                <div className='fto__page__submission-main_content-align_end'>
                                    <span>
                                        {charCount_SceneDesc.length}/{maxCharCountLength_SceneDesc} characters
                                    </span>
                                </div>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_editReason'>Reason For Edits:</label>
                                <textarea id='submit_editReason' name='submit_editReason' type='text' className='fto_input'
                                placeholder='Short desctription of reason for edits' onChange={ handleChange_TrackEdit }
                                maxLength={ maxCharCountLength_editReasons } />
                                <div className='fto__page__submission-main_content-align_end'>
                                    <span>
                                        {charCount_editReasons.length}/{maxCharCountLength_editReasons} characters
                                    </span>
                                </div>
                            </div>
                            
                            {(successfulSubmitQuery !== true) && (
                            <div className='fto__page__submission-main_content-submit_section'>
                                <button className='fto__button__pink' type='submit' disabled={pageLoading}>
                                    Submit
                                </button>
                                <p className='fto__pointer'>Add to drafts</p>
                            </div>
                            )}
                        </form>
                    </div>
                    
                    {(successfulSubmitQuery !== undefined) && (
                    <div className='fto__page__submission-pop_up'>
                        <div className="fto_modal">
                            <div className="fto_modal-content">
                                {(successfulSubmitQuery === true) ? (
                                    <>
                                        <h3 className='fto__page__submission-content_header_subtitle'>
                                            <strong>Add Track to '{submissionContextInfo.canonical_title}' success!</strong>
                                        </h3>
                                        <button className='fto__button__pink' onClick={ handleModalOnButtonClick }>
                                            Finish
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h3 className='fto__page__submission-content_header_subtitle'>
                                            <strong>An error occurred on submission. Please try again or save this to drafts while we look into this problem.</strong>
                                        </h3>
                                        <button className='fto__button__pink' onClick={ handleModalOnButtonClick }>
                                            Close
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    )}

                </div>
                )}
            </div>
            
            {submissionContextInfo !== undefined && (
		    <Footer />
            )}
        </div>
    )
}

export default SubmitTrackEdit