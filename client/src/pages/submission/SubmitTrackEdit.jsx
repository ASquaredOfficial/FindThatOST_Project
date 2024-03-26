import React, {useEffect, useState} from 'react';
import { useLocation, useParams } from "react-router-dom";
import { AddPlatformInputToPage, ListenToPlatformInput, RemovePlatformInputFomPage, ValidateInputs } from './submission';
import './submission.css';

import { Navbar, Footer} from "../../components";
import { IoAdd, IoTrash } from "react-icons/io5";
import { FindObjectDifferenceWithArrays, FormatStreamingPlatformsToJson, FormatStreamingPlatformsToList, GetShorthandDateFromString, IsEmpty } from '../../utils/RegularUtils';
import { GetUrlPlatform, GetPlatformIcon, IsFandomImageUrl, IsFandomCommunityWebsiteUrl, GetFandomImageUrlFromFullUrl, IsYoutubeVideoUrl, GetFandomWikiaIcon, GetIdFromYoutubeUrl, GetPlatformTrackBaseUrl } from '../../utils/HyperlinkUtils';
import { useCustomNavigate } from '../../routing/navigation'
import { ConvertTrackTypeToValue } from '../../utils/FTOApiUtils';
import SubmitTrackRemoveModal from './SubmitTrackRemoveModal';

const SubmitTrackEdit = () => {
    const { navigateToEpisode, navigateToTrack } = useCustomNavigate();
    const { track_id } = useParams();
    const { occurrence_id } = useParams();

    const [ ftoEpisodeID, setFtoEpisodeID ] = useState(-1);
    const [ ftoEpisodeContext, setFtoEpisodeContext ] = useState({ anime_id: -1, episode_id: -1, episode_no: -1, episode_title: -1,});
    const [ pageLoading, setPageLoading ] = useState(false);
    const [ pageInEditMode, setPageToEditMode ] = useState(true);
    const [ pageRemoveTrackModalVisibility, setPageRemoveTrackModalVisibility ] = useState(false);
    const [ pageInputs, setPageInputs ] = useState({
        submit_trackName: '',
        submit_songType: '',
        submit_releaseDate: '',
        submit_artistName: '',
        submit_labelName: '',
        submit_wikiaImgUrl: '',
        submit_wikiaWebpageUrl: '',
        submit_embeddedYtUrl: '',
        submit_sceneDesc: '',
        submit_streamPlat: [{}],
    });
    const [ orginalPageInputs, setOriginalPageInputs ] = useState({});
    const [ userSubmission, setUserSubmission ] = useState({submit_streamPlat: []});
    const [ submissionContextInfo, setSubmissionContextInfo ] = useState();
    const [ platformItems, setPlatformItems ] = useState([{ id: 1, platform_type: 'non_basic', inputString: '', placeholder: '' }]);
    const [ noOfPlatInputsCreated, setNoOfPlatInputsCreated ] = useState(1);
    const [ successfulSubmitQuery, setSuccessfulSubmitQuery ] = useState();
    const [ charCount_SceneDesc, setCharCount_SceneDesc] = useState('');
    const [ charCount_editReasons, setCharCount_editReasons] = useState('');
    const maxCharCountLength_SceneDesc = 200;
    const maxCharCountLength_editReasons = 200;
    
    useEffect(() => {
        document.title = `Submit | Edit Track | TrackID(${track_id}) and OccurrenceID(${occurrence_id})`;
        console.log(`Render-SubmitTrackEdit (onMount): ${window.location.href}\nTrackID:${track_id}\nOccurrenceID:${occurrence_id}`);

        // Fetch page data for anime and corresponding epsiode
        FetchPageData(track_id, occurrence_id);
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
            console.log("Submssion Context Info:", submissionContextInfo);
            setPageInputValues(submissionContextInfo);
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
            console.log("Submssion Context Info0:", contextDataFromBackend[0]);
            const submissionContext = {};
            submissionContext['submit_trackName'] = String(contextDataFromBackend[0].track_name);
            submissionContext['submit_songType'] = (!IsEmpty(contextDataFromBackend[0].track_type)) ? contextDataFromBackend[0].track_type : '';
            submissionContext['submit_releaseDate'] = (!IsEmpty(contextDataFromBackend[0].release_date)) ? GetShorthandDateFromString(contextDataFromBackend[0].release_date) : '';
            submissionContext['submit_artistName'] = (!IsEmpty(contextDataFromBackend[0].artist_name)) ? String(contextDataFromBackend[0].artist_name) : '';
            submissionContext['submit_labelName'] = (!IsEmpty(contextDataFromBackend[0].label_name)) ? String(contextDataFromBackend[0].label_name) : '';
            submissionContext['submit_wikiaImgUrl'] = (!IsEmpty(contextDataFromBackend[0].fandom_image_link)) ? String(contextDataFromBackend[0].fandom_image_link) : '';
            submissionContext['submit_wikiaWebpageUrl'] = (!IsEmpty(contextDataFromBackend[0].fandom_webpage_link)) ? String(contextDataFromBackend[0].fandom_webpage_link) : '';
            submissionContext['submit_embeddedYtUrl'] = (!IsEmpty(contextDataFromBackend[0].embedded_yt_video_id)) ? String(contextDataFromBackend[0].embedded_yt_video_id) : '';
            submissionContext['submit_sceneDesc'] = (!IsEmpty(contextDataFromBackend[0].scene_description)) ? String(contextDataFromBackend[0].scene_description) : '';
            submissionContext['submit_streamPlat'] = (!IsEmpty(contextDataFromBackend[0].streaming_platform_links)) ? JSON.parse(contextDataFromBackend[0].streaming_platform_links) : {};
            setSubmissionContextInfo(submissionContext);
            // TODO - investigate why no image url translates to showing nothing instead of the default image

            if (contextDataFromBackend[0].hasOwnProperty('fto_episode_id')) {
                setFtoEpisodeID(contextDataFromBackend[0].fto_episode_id);
                setFtoEpisodeContext({
                    anime_id: contextDataFromBackend[0].fto_anime_id,
                    episode_id: contextDataFromBackend[0].episode_id,
                    episode_no: contextDataFromBackend[0].episode_no,
                    episode_title: contextDataFromBackend[0].episode_title,
                })
            }
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

                    const inputDuplucatePlatform = foundObject.platform_type;
                    if (inputDuplucatePlatform !== 'non_basic') {
                        // Get check if current input is still the same platform
                        if (GetUrlPlatform(inputElementValue) === inputDuplucatePlatform) {
                            // Don't Remove error
                            return;
                        }

                        // Un-error duplicate platform inputs, if no more duplicate platforms
                        const filteredArray = pageInputs.submit_streamPlat.filter(platObj => {
                            return ((platObj.platform_type === inputDuplucatePlatform) && (platObj.id !== platElemId));
                        });
                        const numberOfObjects = filteredArray.length;
                        if (numberOfObjects < 2) {
                            filteredArray.forEach(platformInputDetails => {
                                console.debug(`Duplicate Input:`, platformInputDetails);

                                let submissionFormElems = document.getElementById(`track_edit_form`);
                                let inputElem = submissionFormElems[`submit_streamPlat_item_${platformInputDetails.id}`];
                                if (inputElem !== null) {
                                    // Variable still exists, remove error
                                    let inputClassNames = inputElem.className.split(" ");

                                    let errorClassNameIndex = Number(inputClassNames.findIndex(item => item === "fto_input-error"));
                                    inputClassNames.splice(errorClassNameIndex, 1);
                                    inputElem.className = inputClassNames.join(' ').trim();
                                    console.debug(`Duplicate Input ID(submit_streamPlat_item_${platformInputDetails.id}) Element New classes:`, inputClassNames);
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

    const setPageInputValues = (pageValues) => {
        // Set original (placeholder) values to edit
        if (!IsEmpty(pageValues.submit_trackName)) {
            setPageInputs(values => { return { ...values, submit_trackName: pageValues.submit_trackName } });
            setOriginalPageInputs(values => { return { ...values, submit_trackName: pageValues.submit_trackName } });
        }
        if (!IsEmpty(pageValues.submit_songType)) {
            setPageInputs(values => { return { ...values, submit_songType: ConvertTrackTypeToValue(pageValues.submit_songType) } });
            setOriginalPageInputs(values => { return { ...values, submit_songType: ConvertTrackTypeToValue(pageValues.submit_songType) } });
        }
        if (!IsEmpty(pageValues.submit_releaseDate)) {
            setPageInputs(values => { return { ...values, submit_releaseDate: pageValues.submit_releaseDate } });
            setOriginalPageInputs(values => { return { ...values, submit_releaseDate: pageValues.submit_releaseDate } });
        }
        if (!IsEmpty(pageValues.submit_artistName)) {
            setPageInputs(values => { return { ...values, submit_artistName: pageValues.submit_artistName } });
            setOriginalPageInputs(values => { return { ...values, submit_artistName: pageValues.submit_artistName } });
        }
        if (!IsEmpty(pageValues.submit_labelName)) {
            setPageInputs(values => { return { ...values, submit_labelName: pageValues.submit_labelName } });
            setOriginalPageInputs(values => { return { ...values, submit_labelName: pageValues.submit_labelName } });
        }
        if (!IsEmpty(pageValues.submit_wikiaImgUrl)) {
            setPageInputs(values => { return { ...values, submit_wikiaImgUrl: pageValues.submit_wikiaImgUrl } });
            setOriginalPageInputs(values => { return { ...values, submit_wikiaImgUrl: pageValues.submit_wikiaImgUrl } });
        }
        if (!IsEmpty(pageValues.submit_wikiaWebpageUrl)) {
            setPageInputs(values => { return { ...values, submit_wikiaWebpageUrl: pageValues.submit_wikiaWebpageUrl } });
            setOriginalPageInputs(values => { return { ...values, submit_wikiaWebpageUrl: pageValues.submit_wikiaWebpageUrl } });
        }
        if (!IsEmpty(pageValues.submit_embeddedYtUrl)) {
            setPageInputs(values => { return { ...values, submit_embeddedYtUrl: GetPlatformTrackBaseUrl('youtube') + pageValues.submit_embeddedYtUrl } });
            setOriginalPageInputs(values => { return { ...values, submit_embeddedYtUrl: GetPlatformTrackBaseUrl('youtube') + pageValues.submit_embeddedYtUrl } });
        }
        if (!IsEmpty(pageValues.submit_sceneDesc)) {
            setPageInputs(values => { return { ...values, submit_sceneDesc: pageValues.submit_sceneDesc } });
            setOriginalPageInputs(values => { return { ...values, submit_sceneDesc: pageValues.submit_sceneDesc } });
            setCharCount_SceneDesc(pageValues.submit_sceneDesc); // Apply Setter Functions 
        }
        if (!IsEmpty(pageValues['submit_streamPlat']) && typeof (pageValues['submit_streamPlat']) == 'object' && pageValues['submit_streamPlat'].hasOwnProperty('data')) {
            // Set streaming platforms page variable
            let streamingPlatformsItems = FormatStreamingPlatformsToList(pageValues['submit_streamPlat'].data, true);
            setPlatformItems(streamingPlatformsItems);
            setNoOfPlatInputsCreated(streamingPlatformsItems.length);
            setPageInputs(values => { return { ...values, submit_streamPlat: streamingPlatformsItems } });
        }
    }

    /**
     * Perform all fetches to set up the webpage.
     * @async
     * @function FetchPostSubmissionTrackEdit_FTO
     * @param {number|string}  nTrackID - Page/Track ID from url, corresponds to FindThatOST Track ID.
     * @param {number|string}  nOccurrenceID -  Occurrence ID for the episode the track was in. -1 if added to no specific episode.
     * @param {object}  objUserSubmission - Page/Anime ID from url, corresponds to FindThatOST Anime ID.
     * @param {number|string}  nUserId - UserId of logged in user.
     * 
     */
    const FetchPostSubmissionTrackEdit_FTO = async (nTrackID, nFtoOccurrenceID, objUserSubmission, nUserId = 1) => {
        objUserSubmission['user_id'] = nUserId;
        let apiUrl_fto = `/findthatost_api/postSubmission/track_edit/${Number(nTrackID)}`;
        if (nFtoOccurrenceID !== -1) {
            apiUrl_fto += `/occurrence_id/${nFtoOccurrenceID}`;
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
            if (!IsEmpty(responseData)) {
                setSuccessfulSubmitQuery(true);
            }
            else {
                setSuccessfulSubmitQuery(false);
            }
        } else {
            console.error('Error:', responseData);
            setSuccessfulSubmitQuery(false);
        }
    }

    /**
     * Check differences between original inputs and new inputs. Returns filtered inputs.
     * @function GetFormDifferences
     * @param {JSON}  objUserSubmission - Object containing all the user entered page edit details.
     * @param {JSON}  originalDetails - Object containing original page details.
     * @returns {boolean} Returns whether changes have been made
     * 
     */
    const GetFormDifferences = (objUserSubmission, originalDetails) => {
        let bTrackNameChanged = false;
        if (objUserSubmission.hasOwnProperty('submit_trackName')) {
            // User entered something different
            bTrackNameChanged = objUserSubmission['submit_trackName'] !== originalDetails['submit_trackName'];
            if (!bTrackNameChanged) { delete objUserSubmission['submit_trackName']; }
            else { console.log("TrackName Difference \n1: " +objUserSubmission['submit_trackName']+ "\nOG: " +originalDetails['submit_trackName']) }
        }

        let bTrackTypeChanged = false;
        if (objUserSubmission.hasOwnProperty('submit_songType')) {
            bTrackTypeChanged = objUserSubmission['submit_songType'] !== originalDetails['submit_songType'];
            if (!bTrackTypeChanged) { delete objUserSubmission['submit_songType']; }
            else { console.log("TrackType Difference \n1: " +objUserSubmission['submit_songType']+ "\nOG: " +originalDetails['submit_songType']) }
        }

        let bReleaseDateChanged = false;
        if (objUserSubmission.hasOwnProperty('submit_releaseDate')) {
            bReleaseDateChanged = objUserSubmission['submit_releaseDate'] !== originalDetails['submit_releaseDate'];
            if (!bReleaseDateChanged) { delete objUserSubmission['submit_releaseDate']; }
            else { console.log("ReleaseDate Difference \n1: " +objUserSubmission['submit_releaseDate']+ "\nOG: " +originalDetails['submit_releaseDate']) }
        }

        let bArtistNameChanged = false;
        if (objUserSubmission.hasOwnProperty('submit_artistName')) {
            bArtistNameChanged = objUserSubmission['submit_artistName'] !== originalDetails['submit_artistName'];
            if (!bArtistNameChanged) { delete objUserSubmission['submit_artistName']; }
            else { console.log("ArtistName Difference \n1: " +objUserSubmission['submit_artistName']+ "\nOG: " +originalDetails['submit_artistName'])}
        }

        let bLabelNameChanged = false;
        if (objUserSubmission.hasOwnProperty('submit_labelName')) {
            bLabelNameChanged = objUserSubmission['submit_labelName'] !== originalDetails['submit_labelName'];
            if (!bLabelNameChanged) { delete objUserSubmission['submit_labelName']; }
            else { console.log("LabelName Difference \n1: " +objUserSubmission['submit_labelName']+ "\nOG: " +originalDetails['submit_labelName']) }
        }

        let bFandomImageUrlChanged = false;
        if (objUserSubmission.hasOwnProperty('submit_wikiaImgUrl')) {
            bFandomImageUrlChanged = objUserSubmission['submit_wikiaImgUrl'] !== originalDetails['submit_wikiaImgUrl'];
            if (!bFandomImageUrlChanged) { delete objUserSubmission['submit_wikiaImgUrl']; }
            else { console.log("FandomImageUrl Difference \n1: " +objUserSubmission['submit_wikiaImgUrl']+ "\nOG: " +originalDetails['submit_wikiaImgUrl']) }
        }

        let bFandomWebpageUrlChanged = false;
        if (objUserSubmission.hasOwnProperty('submit_wikiaWebpageUrl')) {
            bFandomWebpageUrlChanged = objUserSubmission['submit_wikiaWebpageUrl'] !== originalDetails['submit_wikiaWebpageUrl'];
            if (!bFandomWebpageUrlChanged) { delete objUserSubmission['submit_wikiaWebpageUrl']; }
            else { console.log("FandomWebpageUrl Difference \n1: " +objUserSubmission['submit_wikiaWebpageUrl']+ "\nOG: " +originalDetails['submit_wikiaWebpageUrl']) }
        }

        let bEmbeddedYTVideoUrlChanged = false;
        if (objUserSubmission.hasOwnProperty('submit_embeddedYtUrl')) {
            bEmbeddedYTVideoUrlChanged = objUserSubmission['submit_embeddedYtUrl'] !== originalDetails['submit_embeddedYtUrl'];
            if (!bEmbeddedYTVideoUrlChanged) { delete objUserSubmission['submit_embeddedYtUrl']; }
            else { console.log("EmbeddedYTLinkUrl Difference \n1: " +objUserSubmission['submit_embeddedYtUrl']+ "\nOG: " +originalDetails['submit_embeddedYtUrl']) }
        }

        let bSceneDescriptionChanged = false;
        if (objUserSubmission.hasOwnProperty('submit_sceneDesc')) {
            bSceneDescriptionChanged = objUserSubmission['submit_sceneDesc'] !== originalDetails['submit_sceneDesc'];
            if (!bSceneDescriptionChanged) { delete objUserSubmission['submit_sceneDesc']; }
            else { console.log("bSceneDescriptionChanged Difference \n1: " +objUserSubmission['submit_sceneDesc']+ "\nOG: " +originalDetails['submit_sceneDesc']) }
        }
        
        let bStreamingLinksChanged = false;
        if (objUserSubmission.hasOwnProperty('submit_streamPlat')) {
            const { diff1, diff2 } = FindObjectDifferenceWithArrays(objUserSubmission['submit_streamPlat'].data, originalDetails['submit_streamPlat'].data);
            const addedTracks = diff1;
            const removedTracks = diff2;
            bStreamingLinksChanged = !IsEmpty(addedTracks) || !IsEmpty(removedTracks);
            if (!bStreamingLinksChanged) { delete objUserSubmission['submit_streamPlat']; }
            else { console.log('Added Tracks obj1:', addedTracks, '\nRemoved Tracks obj2:', removedTracks); }
        }

        let bSomethingHasChanged = !(bTrackNameChanged || bArtistNameChanged || bLabelNameChanged || bReleaseDateChanged || bTrackTypeChanged ||
                bSceneDescriptionChanged || bStreamingLinksChanged || bFandomImageUrlChanged || bFandomWebpageUrlChanged || bEmbeddedYTVideoUrlChanged);
        return !bSomethingHasChanged;
    }

    const handleSubmit_TrackEdit = async (event) => {
        if (successfulSubmitQuery === true) {
            // Successfully added track, unauthorised attempt to submit request
            return;
        }
        event.preventDefault();
        setPageLoading(true);
        
        const formValues = event.target.elements // as HTMLFormControlsCollection;
        let inputsValid = ValidateInputs(formValues, platformItems, {setUserSubmission, setPlatformItems, setPageInputs}, pageInputs, false, true);
        if (inputsValid) {
            // Update user Submission
            const updatedSubmission = { 
                ...userSubmission, 
                submit_streamPlat: FormatStreamingPlatformsToJson(platformItems), 
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
                    updatedSubmission[key] = !IsEmpty(GetIdFromYoutubeUrl(value)) ?  GetIdFromYoutubeUrl(value) : '';
                }
                else if (key === 'submit_wikiaImgUrl') {
                    updatedSubmission[key] = !IsEmpty(GetFandomImageUrlFromFullUrl(value)) ? GetFandomImageUrlFromFullUrl(value) : '';
                }
                else {
                    updatedSubmission[key] = value;
                }
            }
            
            // Get Form Differences 
            let bChangesPresent = GetFormDifferences(updatedSubmission, submissionContextInfo);
            setUserSubmission(updatedSubmission);
            
            console.log(`Fetch data:`, updatedSubmission); 
            if (bChangesPresent) { 
                await new Promise(resolve => setTimeout(resolve, 1000));  
                FetchPostSubmissionTrackEdit_FTO(track_id, occurrence_id, updatedSubmission);
            }
            else {
                alert("No changes have been made");
            }
        }
        setPageLoading(false);
    }

    const handleModalOnButtonClick = () => {
        if (successfulSubmitQuery === true) {
            if (ftoEpisodeID !== -1) {
                navigateToTrack(track_id, occurrence_id);
            }
            else {
                navigateToEpisode(ftoEpisodeContext.anime_id, ftoEpisodeContext.episode_no);
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

                {pageRemoveTrackModalVisibility && (
                    <SubmitTrackRemoveModal 
                        setModalVisibility={setPageRemoveTrackModalVisibility}
                        setPageLoading={setPageLoading}
                        setSuccessfulSubmitQuery={setSuccessfulSubmitQuery}
                        trackID={track_id}
                        occurrenceID={occurrence_id}
                        setFtoEpisodeID={setFtoEpisodeID}
                        setPageToEditMode={setPageToEditMode}
                    />
                )}

                {(submissionContextInfo !== undefined)  && (
                <div className='fto__page__submission-content section__padding'>

                    <div className='fto__page__submission-content_heading_section'>
                        <h1 className='fto__page__submission-content_header_title gradient__text'>
                            Edit Track
                            {(ftoEpisodeContext.episode_no !== -1) ? (
                                ' in Episode ' + ftoEpisodeContext.episode_no
                            ) : (
                                ' in Series'
                            )}
                        </h1>
                        <h4 className='fto__page__submission-content_header_subtitle'><strong>{ftoEpisodeContext.episode_title}</strong></h4>
                        <hr className='fto__page__submission-horizontal_hr' />
                    </div>
                    
                    <div className='fto__page__submission-main_content'>
                        <button className='fto__button__pink fto__button__right fto__pointer' type='button'
                            onClick={() => setPageRemoveTrackModalVisibility(true)}>
                            <div className='fto__page__submission-main_content-align_end'>
                                <span style={{margin: '0px 5px'}}>
                                    Remove Track From Episode
                                </span>
                            </div>
                        </button>
                        <form id='track_edit_form' onSubmit={ handleSubmit_TrackEdit }>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_trackName'>Edit Track Name:</label>
                                <input id='submit_trackName' name='submit_trackName' type='text' className='fto_input' value={pageInputs['submit_trackName']}
                                    style={{ color: orginalPageInputs['submit_trackName'] === pageInputs['submit_trackName'] ? 'grey' : 'white' }}
                                    placeholder='Track Name' onChange={ handleChange_TrackEdit }/>
                            </div>
                            <div className='fto__page__submission-main_content-even_split fto__page__submission-main_content-even_split_gap'>
                                <div className='fto__page__submission-main_content-input_section fto__page__submission-main_content-left'>
                                    <label htmlFor='submit_songType'>Edit Song Type:</label>
                                    <select id='submit_songType' name='submit_songType' className='fto_input' value={pageInputs['submit_songType']}
                                        style={{ color: orginalPageInputs['submit_songType'] === pageInputs['submit_songType'] ? 'grey' : 'white' }}
                                        onChange={ handleChange_TrackEdit }> 

                                        <option value="" defaultValue style={{ color: orginalPageInputs['submit_songType'] === '' ? 'grey' : 'white' }}>
                                            -- Select Song Type --
                                        </option>
                                        <option value="songType_OP" style={{ color: orginalPageInputs['submit_songType'] === 'songType_OP' ? 'grey' : 'white' }}>
                                            Opening Theme Song
                                        </option>
                                        <option value="songType_ED" style={{ color: orginalPageInputs['submit_songType'] === 'songType_ED' ? 'grey' : 'white' }}>
                                            Ending Theme Song
                                        </option>
                                        <option value="songType_BGM" style={{ color: orginalPageInputs['submit_songType'] === 'songType_BGM' ? 'grey' : 'white' }}>
                                            Background Song
                                        </option>
                                    </select>
                                </div>
                                <div className='fto__page__submission-main_content-input_section fto__page__submission-main_content-right'>
                                    <label htmlFor='submit_releaseDate'>Edit Release Date:</label>
                                    <input id='submit_releaseDate' name='submit_releaseDate' type='date' className='fto_input' value={pageInputs['submit_releaseDate']}
                                        style={{ color: orginalPageInputs['submit_releaseDate'] === pageInputs['submit_releaseDate'] ? 'grey' : 'white' }}
                                        max={new Date().toLocaleDateString('fr-ca')} onChange={ handleChange_TrackEdit }/>
                                </div>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_artistName'>Edit Artist Name:</label>
                                <input id='submit_artistName' name='submit_artistName' type='text' className='fto_input' value={pageInputs['submit_artistName']}
                                    style={{ color: orginalPageInputs['submit_artistName'] === pageInputs['submit_artistName'] ? 'grey' : 'white' }}
                                    placeholder='Artist Name' onChange={ handleChange_TrackEdit }/>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_labelName'>Edit Label Name:</label>
                                <input id='submit_labelName' name='submit_labelName' type='text' className='fto_input' value={pageInputs['submit_labelName']}
                                    style={{ color: orginalPageInputs['submit_labelName'] === pageInputs['submit_labelName'] ? 'grey' : 'white' }}
                                    placeholder='Label Name' onChange={ handleChange_TrackEdit }/>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_streamPlat'>Edit Streaming Platform(s):</label>
                                <div id='fto__page__submission-main_content-streamPlat_items' name='submit_streamPlat'>
                                    {platformItems.map(item => {
                                        return (
                                            <div id={`streamPlat_item_section_`+ item.id} key={item.id}
                                            className='fto__page__submission-main_content-streamPlat_item'>
                                                <div className='delete_streamPlat_item' tabIndex='0'>
                                                    <IoTrash id={`delete_streamPlat_item_`+ item.id} onClick={() => handleRemovePlatform(item.id)}/>
                                                </div>
                                                <label className='fto-input-drawableIconStart_label'>
                                                    <img src={ GetPlatformIcon( (IsEmpty(item.inputString) && !IsEmpty(item.placeholder)) ? GetUrlPlatform(item.placeholder) : item.platform_type ) } 
                                                    className='fto-input-drawableIconStart_img' alt='platform_img'/>
                                                    <input id={`submit_streamPlat_item_${item.id}`} name={`submit_streamPlat_item_${item.id}`} type='text' className='fto_input' 
                                                        readOnly={!IsEmpty(item.placeholder) ? true : false}
                                                        placeholder={ !IsEmpty(item.placeholder) ? item.placeholder : 'Enter Streaming Platform URL' } value={ item.inputString }
                                                        onChange={ (ev) => { handleChange_TrackEdit(ev) } }/>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div>
                                <button className='fto__button__pink fto__button__right fto__pointer' type='button' onClick={handleAddPlatform}>
                                    <div className='fto__page__submission-main_content-align_end'>
                                        <span style={{margin: '0px 5px'}}>
                                            Add platform 
                                        </span>
                                        <IoAdd />
                                    </div>
                                </button>
                                </div>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_wikiaImgUrl'>Edit Fandom/Wikia Image URL:</label>
                                <label className='fto-input-drawableIconStart_label'>
                                    <img src={ GetFandomWikiaIcon( 'fandom_img', (IsEmpty(pageInputs.submit_wikiaImgUrl)) ? submissionContextInfo.submit_wikiaImgUrl : pageInputs.submit_wikiaImgUrl ) } 
                                        className='fto-input-drawableIconStart_img' alt='platform_img'/>
                                    <input id='submit_wikiaImgUrl' name='submit_wikiaImgUrl' type='text' className='fto_input' value={pageInputs['submit_wikiaImgUrl']}
                                        style={{ color: orginalPageInputs['submit_wikiaImgUrl'] === pageInputs['submit_wikiaImgUrl'] ? 'grey' : 'white' }}
                                        placeholder='Wikia Album Image URL' onChange={ handleChange_TrackEdit }/>
                                </label>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_wikiaWebpageUrl'>Edit Fandom/Wikia Webpage URL:</label>
                                <label className='fto-input-drawableIconStart_label'>
                                    <img src={ GetFandomWikiaIcon( 'fandom_web', (IsEmpty(pageInputs.submit_wikiaWebpageUrl)) ? submissionContextInfo.submit_wikiaWebpageUrl : pageInputs.submit_wikiaWebpageUrl ) }
                                        className='fto-input-drawableIconStart_img' alt='platform_img'/>
                                    <input id='submit_wikiaWebpageUrl' name='submit_wikiaWebpageUrl' type='text' className='fto_input' value={pageInputs['submit_wikiaWebpageUrl']}
                                        style={{ color: orginalPageInputs['submit_wikiaWebpageUrl'] === pageInputs['submit_wikiaWebpageUrl'] ? 'grey' : 'white' }}
                                        placeholder='Wikia Album Webpage URL' onChange={ handleChange_TrackEdit }/>
                                </label>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_embeddedYtUrl'>Edit Embedded YT Video URL:</label>
                                <label className='fto-input-drawableIconStart_label'>
                                    <img src={ 
                                        GetPlatformIcon( 
                                            GetUrlPlatform(
                                                pageInputs.submit_embeddedYtUrl
                                            ), 
                                            'youtube' 
                                        ) 
                                    } 
                                    className='fto-input-drawableIconStart_img' alt='platform_img'/>
                                    <input id='submit_embeddedYtUrl' name='submit_embeddedYtUrl' type='text' className='fto_input' value={pageInputs['submit_embeddedYtUrl']}
                                        style={{ color: orginalPageInputs['submit_embeddedYtUrl'] === pageInputs['submit_embeddedYtUrl'] ? 'grey' : 'white' }}
                                        placeholder='Embedded YT Video URL' onChange={ handleChange_TrackEdit }/>
                                </label>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_sceneDesc'>Edit Scene Description:</label>
                                <textarea id='submit_sceneDesc' name='submit_sceneDesc' type='text' className='fto_input' value={pageInputs['submit_sceneDesc']}
                                    style={{ color: orginalPageInputs['submit_sceneDesc'] === pageInputs['submit_sceneDesc'] ? 'grey' : 'white' }}
                                    placeholder='Add Scene Description' maxLength={ maxCharCountLength_SceneDesc } onChange={ handleChange_TrackEdit }/>
                                <div className='fto__page__submission-main_content-align_end'>
                                    <span>
                                        {charCount_SceneDesc.length}/{maxCharCountLength_SceneDesc} characters
                                    </span>
                                </div>
                            </div>
                            <div className='fto__page__submission-main_content-input_section'>
                                <label htmlFor='submit_editReason'>Reason For Edits:</label>
                                <textarea id='submit_editReason' name='submit_editReason' type='text' className='fto_input'
                                placeholder='Short desctription of reason for edits' maxLength={ maxCharCountLength_editReasons } onChange={ handleChange_TrackEdit }/>
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
                                            {(pageInEditMode) ? (
                                                <strong>Edit Track for episode {ftoEpisodeID} success!</strong>
                                            ) : (
                                                <strong>Removed Track for track '{ftoEpisodeContext.episode_title}' success!</strong>
                                            )}
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