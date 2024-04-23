import React, {useEffect, useState} from 'react';
import { useParams } from "react-router-dom";
import './requestview.css';

import { Navbar, Footer, Comments, } from "../../components";
import { ParseAnimePosterImage } from '../../utils/MalApiUtils';
import { MapTrackType } from '../../utils/FTOApiUtils';
import { FormatStreamingPlatformsToList, GetTimeAgoBetweenDates, IsEmpty, RenameObjectKey } from '../../utils/RegularUtils';
import StreamingPlatformLinksList from '../../components/streamingplatformlinkslist/StreamingPlatformLinksList';
import {
	Fetch_FTO_GetRequestComments as getCommentsApi,
	Fetch_FTO_PostRequestComment as createCommentApi,
	Fetch_FTO_DeleteRequestComment as deleteCommentApi,
	Fetch_FTO_PatchRequestComment as updateCommentApi,
	Fetch_FTO_PatchRequestCommentLikes as updateCommentLikesApi,
} from './request_comments_api';
import SubmissionVotes from '../../components/submissionvotes/submissionvotes';

const TrackRequestView = () => {
    const { request_id } = useParams();
    const user_properties = {userId: 1, username: "Admin1012"};
    
    const [ ftoSubmissionInfo, setFTOSubmissionInfo] = useState();
    const [ ftoAnimeInfo, setFTOAnimeInfo ] = useState();
    const [ malAnimeInfo, setMALAnimeInfo ] = useState();
    const [ isSubmissionUpVoted, setSubmissionVote ] = useState();
    const [ upDownVoteCount, setUpDownVoteCount ] = useState({ upvote_count: 0, downvote_count: 0});

    useEffect(() => {
        document.title = `Submission ${request_id} View | FindThatOST`;
        FetchPageData(request_id);
    }, []);

    useEffect(() => {
        if (!IsEmpty(ftoSubmissionInfo)) {
            RenameObjectKey( ftoSubmissionInfo, 'request_upvotes', 'likesDislikes' );
            console.debug("Episode Comments:", ftoSubmissionInfo)
            
            if (typeof (ftoSubmissionInfo.likesDislikes) == 'string') {
                const objCommentLikesDislikes = JSON.parse(ftoSubmissionInfo.likesDislikes);
                if (Array.isArray(objCommentLikesDislikes) && Object.keys(objCommentLikesDislikes).length >= 0) {
                    let nNoOfUpVotes = 0;
                    let nNoOfDownVotes = 0;
                    let bIsSubmissionUpVoted = undefined;
                    for (let it = 0; it < Object.keys(objCommentLikesDislikes).length; it++ ) {
                        if (objCommentLikesDislikes[it]['is_upvote'] === true) {
                            nNoOfUpVotes++;
    
                            // Check if Comment is liked
                            if (objCommentLikesDislikes[it]['user_id'] === user_properties.userId) {
                                bIsSubmissionUpVoted = true;
                            }
                        }
                        else if (objCommentLikesDislikes[it]['is_upvote'] === false) {
                            nNoOfDownVotes++;
    
                            // Check if Comment is disliked
                            if (objCommentLikesDislikes[it]['user_id'] === user_properties.userId) {
                                bIsSubmissionUpVoted = false;
                            }
                        }
                    }
                    setSubmissionVote(bIsSubmissionUpVoted);
                    setUpDownVoteCount({upvote_count: nNoOfUpVotes, downvote_count: nNoOfDownVotes})
                }
            }
        }
        
    }, [ftoSubmissionInfo])

    /**
     * Perform all fetches to set up the webpage.
     * 
     * @async
     * @function FetchPageData
     * @param {number|string}  pageId - Page ID from url, corresponds to FindThatOST Submission ID.
     * 
     */
    const FetchPageData = async (pageId) => {
        try {
            // Fetch data from the backend
            const dataFromBackend = await FetchSubmissionData_FTO(pageId);
            if (dataFromBackend.submission_type === 'TRACK_ADD'  && !IsEmpty(dataFromBackend.submission_details.streaming_platform_links)) {
                let streamingPlatformsLinks = FormatStreamingPlatformsToList(dataFromBackend.submission_details.streaming_platform_links.data);
                const updatedStreamingLinksArray = streamingPlatformsLinks.map(obj => {
                    // Destructure the object to keep existing keys and rename 'abc' to 'xyz'
                    const { inputString: link_url, ...rest } = obj;
                    
                    // Create a new object with updated key name and other existing keys
                    return { link_url, ...rest };
                });
                dataFromBackend.submission_details.streaming_platform_links = updatedStreamingLinksArray;
            }
            console.log('Data from backend:', dataFromBackend);
            setFTOSubmissionInfo(dataFromBackend);
            
            // Fetch data from the backend
            const animeDataFromBackend = await FetchAnimeData_FTO(dataFromBackend.fto_anime_id);
            console.debug('Anime Data from backend:', animeDataFromBackend);
        
            // Use data from the backend to make the second fetch to the external API
            const dataFromExternalAPI_MAL = await FetchFullAnimeData_MAL(dataFromBackend.mal_id);
            console.debug('Anime Data from external MAL API:', dataFromExternalAPI_MAL);
            
            setFTOAnimeInfo(dataFromBackend);
            document.title = `Submission ${pageId} View | ${dataFromBackend.submission_type} | FindThatOST`;
            setMALAnimeInfo(dataFromExternalAPI_MAL.data);
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    /**
     * Get anime details for anime with corresponding FTO Submissin ID.
     * 
     * @async
     * @function FetchAnimeData_FTO
     * @param {number|string}  ftoAnimeID - FindThatOST Anime ID.
     * @returns {Promise<Array<JSON>>|undefined} The array of json objects (max length 1) containing submission details.
     * 
     */
    const FetchSubmissionData_FTO = async (ftoSubmissionID) => {
        let apiUrl_fto = `/findthatost_api/submission/details/${Number(ftoSubmissionID)}/full`
        console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
        try {
            const response = await fetch(apiUrl_fto);
            const data = await response.json();
            return data;
        } catch (error) {
            toast('An internal error has occurred in FindThatOST Server. Please try again later.');
            throw new Error('Error fetching data from backend');
        }
    }

    /**
     * Get anime details for anime with corresponding FTO Anime ID.
     * 
     * @async
     * @function FetchAnimeData_FTO
     * @param {number|string}  ftoAnimeID - FindThatOST Anime ID.
     * @returns {Promise<Array<JSON>>|undefined} The array of json objects (max length 1) containing anime details.
     * 
     */
    const FetchAnimeData_FTO = async (ftoAnimeID) => {
        let apiUrl_fto = `/findthatost_api/anime/${Number(ftoAnimeID)}/full`
        console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
        try {
            const response = await fetch(apiUrl_fto);
            const data = await response.json();
            return data;
        } catch (error) {
            toast('An internal error has occurred in FindThatOST Server. Please try again later.');
            throw new Error('Error fetching data from backend');
        }
    }
    
    /**
     * Get anime details from MyAnimeList API using MAL ID mapped from the FTOAnimeID from backend response.
     * 
     * @async
     * @function FetchFullAnimeData_MAL
     * @param {Array<JSON>}  dataFromBackend - The array of json objects (max length 1) containing anime details.
     * @returns {Promise<Array<JSON>|undefined} - JSON Object containing anime info from MAL API.
     * 
     */
    const FetchFullAnimeData_MAL = async (nMalId) => {
        let apiUrl_mal = `https://api.jikan.moe/v4/anime/${nMalId}/full`;
        console.debug(`Fetch data from External API, url: '${apiUrl_mal}'`);
        try {
            const response = await fetch(apiUrl_mal);
            const externalData = await response.json();
            return externalData;
        } catch (error) {
            throw new Error('Error fetching data from external API (MyAnimeList)');
        }
    }

    /**
	 * Updates the like status of a submission and sends a PATCH request to the backend.
	 * @function likeSubmission
	 * @param {number} nFtoSubmissionId - The ID of the submission to update.
	 * @param {boolean|undefined} bUpVoteSubmission - The like status of the submission. 
	 *                                           If true, sets the submission as liked. 
	 *                                           If false, sets the submission as disliked. 
	 *                                           If undefined, removes the like/dislike of the user.
	 * @returns {undefined}
	 */
	const likeSubmission = (nFtoSubmissionId, bUpVoteSubmission) => {
		let backendSubmission  = ftoSubmissionInfo;
		if (backendSubmission.hasOwnProperty('likesDislikes')) {
            let arrSubmissionUpDownVotes = JSON.parse(backendSubmission['likesDislikes']);
			if (bUpVoteSubmission === undefined) {
				// Remove user's like entry from state, if the user state exists
				if (Array.isArray(arrSubmissionUpDownVotes)) {
					let objExistingUpDownVoteEntry = arrSubmissionUpDownVotes.find(voteEntry => voteEntry['user_id'] === user_properties.userId);
					if (objExistingUpDownVoteEntry !== undefined) {
						// User entry exists
						const filteredArray = arrSubmissionUpDownVotes.filter(voteEntry => voteEntry['user_id'] !== user_properties.userId);
						arrSubmissionUpDownVotes = filteredArray;
					}
					else { return }
				}
			} 
			else if (bUpVoteSubmission === true) {
				// Set user's entry to like or add like entry to state
				if (IsEmpty(arrSubmissionUpDownVotes) || !Array.isArray(arrSubmissionUpDownVotes)) {
					// Create new array object, then add new user
					arrSubmissionUpDownVotes = [{user_id: user_properties.userId, is_upvote: true}]
				}
				else {
					if (Array.isArray(arrSubmissionUpDownVotes)) {
						let objExistingUpDownVoteEntry = arrSubmissionUpDownVotes.find(voteEntry => voteEntry['user_id'] === user_properties.userId);
						if (objExistingUpDownVoteEntry === undefined) {
							// User entry does not exist
							objExistingUpDownVoteEntry = { user_id: user_properties.userId, is_upvote: true };
							arrSubmissionUpDownVotes.push(objExistingUpDownVoteEntry); // Add new entry to array
						}
						else {
							// User entry exists
							if (objExistingUpDownVoteEntry['is_upvote'] !== true) {
								objExistingUpDownVoteEntry['is_upvote'] = true;	// Change existing dislike to a like
							}
							else {
								console.debug("Value already set to true");
							}
						}
						// Update the array with the modified entry
						arrSubmissionUpDownVotes = arrSubmissionUpDownVotes.map(entry => {
							if (entry.user_id === user_properties.userId) {
								return objExistingUpDownVoteEntry;
							}
							return entry;
						});
					}
					else { return }
				}
			} 
			else if (bUpVoteSubmission === false) {
				// Set user's entry to dislike or add dislike entry to state
				if (IsEmpty(arrSubmissionUpDownVotes) || !Array.isArray(arrSubmissionUpDownVotes)) {
					// Create new array object, then add new user
					arrSubmissionUpDownVotes = [{user_id: user_properties.userId, is_upvote: false}]
				}
				else {
					if (Array.isArray(arrSubmissionUpDownVotes)) {
						let objExistingUpDownVoteEntry = arrSubmissionUpDownVotes.find(voteEntry => voteEntry['user_id'] === user_properties.userId);
						if (objExistingUpDownVoteEntry === undefined) {
							// User entry does not exist
							objExistingUpDownVoteEntry = { user_id: user_properties.userId, is_upvote: false };
							arrSubmissionUpDownVotes.push(objExistingUpDownVoteEntry); // Add new entry to array
						}
						else {
							// User entry exists
							if (objExistingUpDownVoteEntry['is_upvote'] !== false) {
								objExistingUpDownVoteEntry['is_upvote'] = false; // Change existing dislike to a like
							}
							else {
								console.debug("Value already set to false");
							}
						}
						// Update the array with the modified entry
						arrSubmissionUpDownVotes = arrSubmissionUpDownVotes.map(entry => {
							if (entry.user_id === user_properties.userId) {
								return objExistingUpDownVoteEntry;
							}
							return entry;
						});
					}
					else { return }
				}
			} 

			// Update Comment Likes
			Fetch_FTO_PatchRequestUpVotes(nFtoSubmissionId, arrSubmissionUpDownVotes, user_properties.userId);
			FetchPageData(nFtoSubmissionId);
		}
	}

    /**
     * Perform post request to update episode comment.
     * @async
     * @function Fetch_FTO_PatchEpisodeCommentLikes
     * @param {number|string}  nFtoSubmissionId - Comment ID corresponds to FindThatOST comment ID.
     * @param {Array}  likesDislikesObject - Updated Comment.
     * @param {number|string}  nUserId - UserId of logged in user.
     * @returns {undefined}
     * 
     */
    const Fetch_FTO_PatchRequestUpVotes = async (nFtoSubmissionId, arrUpvotesDownvotes, nUserId) => {
        const objUserSubmission = {
            userId: nUserId,
            arrUpvotesDownvotes: arrUpvotesDownvotes,
        };
        let apiUrl_fto = `/findthatost_api/submission/comment_likes/${Number(nFtoSubmissionId)}`;
        console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
        const response = await fetch(apiUrl_fto, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ objUserSubmission }),
        });
    
        const responseStatus = response.status;
        const responseData = await response.json();
        if (responseStatus === 500) {
            console.error("Response status:", responseStatus);
            toast('An internal error has occurred with the FindThatOST server. Please try again later.');
            throw new Error('Error fetching data from backend:', responseData);
        }
        else if (responseStatus === 400) {
            toast('Failed to update message.\nInvalid parameters detected.');
            console.warn("Response status:", responseStatus);
            console.warn("Error fetching data from backend:", responseData);
        }
        else {
            console.debug("Response Data:", responseData);
        }
    }

    return (
        <div className='fto__page__requestview'>
            <div className='gradient__bg'>
                <Navbar />

                {ftoSubmissionInfo && (
                <div className='fto__page__requestview-content section__padding' style={{paddingBottom: 0}}>
                    <div className='fto__page__requestview-content_heading_section'>
                        <h1 className='fto__page__requestview-content_header_title gradient__text'>
                            Submission {ftoSubmissionInfo.request_submission_id}
                        </h1>
                        
                        <h4 className='fto__page__requestview-content_header_subtitle'>
                            <strong>
                            Request Type - {ftoSubmissionInfo.submission_type}
                            </strong>
                        </h4>
                        
                        <hr className='fto__page__episode-horizontal_hr' />
                        {malAnimeInfo !== undefined && (
                            <h4 className='fto__page__requestview-content_header_subheading'>
                                <a href={'/anime/' + ftoSubmissionInfo.fto_anime_id}>
                                    <strong>{malAnimeInfo.titles[0].title}</strong>
                                </a>
                            </h4>
                        )}
                    </div>
                    <hr className='fto_horizontal_hr' />

                    <div className='fto__page__requestview-main_content'>
                        {malAnimeInfo !== undefined && (
                            <div className='fto__page__requestview-main_content_left'>
                                <img alt='Anime Thumbnail' className='fto__page__requestview-main_content_left-anime_image' src={ParseAnimePosterImage(malAnimeInfo)}/>
                                
                                <div className='fto__page__requestview-main_content-main_info'>
                                    <div className='fto__page__requestview-main_content_left-more_info'>
                                        <h3 className='fto__page__requestview-main_content-header'>Information</h3>
                                        <p className='fto__page__requestview-main_content-text'><strong>Episode Count: </strong>{malAnimeInfo.episodes}</p>
                                        <p className='fto__page__requestview-main_content-text'><strong>Air Date: </strong>{malAnimeInfo.aired.string}</p>
                                        <p className='fto__page__requestview-main_content-text'><strong>Status: </strong>{malAnimeInfo.status}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className='fto__page__requestview-main_content_right'>
                            {(String(ftoSubmissionInfo.submission_type).toLowerCase() === 'track_add') && (
                                <>
                                    <h2><u>Added New Track Details</u></h2>
                                    <h4 style={{color: 'gray'}}>Added Track to {(!IsEmpty(ftoSubmissionInfo.fto_occurrence_id) && !IsEmpty(ftoSubmissionInfo.submission_details.episode_no)) ? 
                                        (
                                            <a className='fto_text_hyperlink fto__pointer' href={'/anime/' + ftoSubmissionInfo.fto_anime_id + '/episode/' + ftoSubmissionInfo.submission_details.episode_no}>
                                                Episode {ftoSubmissionInfo.submission_details.episode_no}
                                            </a>
                                            
                                        ) : (
                                            'Series'
                                        )}
                                    </h4>
                                    <br />
                                    
                                    <h3><u>Track Information</u></h3>
                                    {!IsEmpty(ftoSubmissionInfo.submission_details.artist_name) && (
                                        <p className='fto__page__requestview-main_content-text'><b>Artist(s): </b>{ftoSubmissionInfo.submission_details.artist_name}</p>
                                    )}
                                    {!IsEmpty(ftoSubmissionInfo.submission_details.label_name) && (
                                        <p className='fto__page__requestview-main_content-text'><b>Label: </b>{ftoSubmissionInfo.submission_details.label_name}</p>
                                    )}
                                    {!IsEmpty(ftoSubmissionInfo.submission_details.release_date) && (
                                        <p className='fto__page__requestview-main_content-text'><b>Release Date: </b>{ftoSubmissionInfo.submission_details.release_date}</p>
                                    )}
                                    {!IsEmpty(ftoSubmissionInfo.submission_details.track_type) && (
                                        <p className='fto__page__requestview-main_content-text'><b>Track Type: </b>{MapTrackType(ftoSubmissionInfo.submission_details.track_type)}</p>
                                    )}
                                    {!IsEmpty(ftoSubmissionInfo.submission_details.scene_description) && (
                                        <>
                                            <p className='fto__page__requestview-main_content-text'><b>Scene Description:</b></p>
                                            <p className='fto__page__requestview-main_content-text'>{ftoSubmissionInfo.submission_details.scene_description}</p>
                                        </>
                                    )}
                                    {!IsEmpty(ftoSubmissionInfo.submission_details.streaming_platform_links) && Array.isArray(ftoSubmissionInfo.submission_details.streaming_platform_links) && (
                                        <div className='fto__page__requestview--streaming_platform_section'>
                                            <p className='fto__page__requestview-main_content-text' style={{marginTop : '3px'}}><u>Streaming Links Platform(s):</u></p>
                                            <StreamingPlatformLinksList 
                                                streamingPlatformsLinks={ftoSubmissionInfo.submission_details.streaming_platform_links} />
                                        </div>
                                    )}
                                </>
                            )}
                            {(String(ftoSubmissionInfo.submission_type).toLowerCase() === 'track_add_pre') && (
                                <>
                                    <h2><u>Added Pre-Existing Track Details</u></h2>
                                    <h4 style={{color: 'gray'}}>Added Track to {(!IsEmpty(ftoSubmissionInfo.fto_occurrence_id) && !IsEmpty(ftoSubmissionInfo.submission_details.episode_no)) ? 
                                        (
                                            <a className='fto_text_hyperlink fto__pointer' href={'/anime/' + ftoSubmissionInfo.fto_anime_id + '/episode/' + ftoSubmissionInfo.submission_details.episode_no}>
                                                Episode {ftoSubmissionInfo.submission_details.episode_no}
                                            </a>
                                            
                                        ) : (
                                            'Series'
                                        )}
                                    </h4>
                                    <br />
                                    
                                    <h3><u>Track Information</u></h3>
                                    <p className='fto__page__requestview-main_content-text'><b>Track Type: </b>{MapTrackType(ftoSubmissionInfo.submission_details.track_type)}</p>
                                    {!IsEmpty(ftoSubmissionInfo.submission_details.scene_description) && (
                                        <>
                                            <p className='fto__page__requestview-main_content-text'><b>Scene Description:</b></p>
                                            <p className='fto__page__requestview-main_content-text'>{ftoSubmissionInfo.submission_details.scene_description}</p>
                                        </>
                                    )}
                                    <br/>
                                </>
                            )}
                            {(String(ftoSubmissionInfo.submission_type).toLowerCase() === 'track_remove') && (
                                <>
                                    <h2><u>Remove Track Details</u></h2>
                                    <h4 style={{color: 'gray'}}>Removed Track from 
                                        <a className='fto_text_hyperlink fto__pointer' href={'/anime/' + ftoSubmissionInfo.fto_anime_id + '/episode/' + ftoSubmissionInfo.submission_details.episode_no}>
                                            {` Episode ` + ftoSubmissionInfo.submission_details.episode_no}
                                        </a>
                                    </h4>
                                    
                                    {!IsEmpty(ftoSubmissionInfo.submission_details.track_remove_reason) && (
                                        <>
                                            <p className='fto__page__requestview-main_content-text' style={{marginTop : '10px'}}><u>Remove Reason</u></p>
                                            <p className='fto__page__requestview-main_content-text'>{ftoSubmissionInfo.submission_details.track_remove_reason}</p>
                                        </>
                                    )}
                                    <br/>
                                </>
                            )}
                            {(String(ftoSubmissionInfo.submission_type).toLowerCase() === 'track_edit') && (
                                <>
                                    <h2><u>Edit Track Details</u></h2>
                                    <h4 style={{color: 'gray'}}>Edited Track {(!IsEmpty(ftoSubmissionInfo.fto_occurrence_id) && !IsEmpty(ftoSubmissionInfo.submission_details.episode_no)) ? 
                                        (
                                            <a className='fto_text_hyperlink fto__pointer' href={'/anime/' + ftoSubmissionInfo.fto_anime_id + '/episode/' + ftoSubmissionInfo.submission_details.episode_no}>
                                                in Episode {ftoSubmissionInfo.submission_details.episode_no}
                                            </a>
                                            
                                        ) : (
                                            'in Series'
                                        )}
                                    </h4>
                                    <br />
                                    
                                    <h3><u>Changed Track Information</u></h3>
                                    {!IsEmpty(ftoSubmissionInfo.submission_details.artist_name) && (
                                        <p className='fto__page__requestview-main_content-text'><b>Artist(s): </b>{ftoSubmissionInfo.submission_details.artist_name}</p>
                                    )}
                                    {!IsEmpty(ftoSubmissionInfo.submission_details.label_name) && (
                                        <p className='fto__page__requestview-main_content-text'><b>Label: </b>{ftoSubmissionInfo.submission_details.label_name}</p>
                                    )}
                                    {!IsEmpty(ftoSubmissionInfo.submission_details.release_date) && (
                                        <p className='fto__page__requestview-main_content-text'><b>Release Date: </b>{ftoSubmissionInfo.submission_details.release_date}</p>
                                    )}
                                    {IsEmpty(ftoSubmissionInfo.submission_details.track_type) && (
                                        <p className='fto__page__requestview-main_content-text'><b>Track Type: </b>{MapTrackType(ftoSubmissionInfo.submission_details.track_type)}</p>
                                    )}
                                    {!IsEmpty(ftoSubmissionInfo.submission_details.scene_description) && (
                                        <>
                                            <p className='fto__page__requestview-main_content-text'><b>Scene Description:</b></p>
                                            <p className='fto__page__requestview-main_content-text'>{ftoSubmissionInfo.submission_details.scene_description}</p>
                                        </>
                                    )}
                                    {!IsEmpty(ftoSubmissionInfo.submission_details.streaming_platform_links) && Array.isArray(ftoSubmissionInfo.submission_details.streaming_platform_links) && (
                                        <div className='fto__page__requestview--streaming_platform_section'>
                                            <p className='fto__page__requestview-main_content-text' style={{marginTop : '3px'}}><u>Streaming Links Platform(s):</u></p>
                                            <StreamingPlatformLinksList 
                                                streamingPlatformsLinks={ftoSubmissionInfo.submission_details.streaming_platform_links} />
                                        </div>
                                    )}
                                    {!IsEmpty(ftoSubmissionInfo.submission_details.track_edit_reason) && (
                                        <>
                                            <p className='fto__page__requestview-main_content-text' style={{marginTop : '10px'}}><u>Track Edit Reason</u></p>
                                            <p className='fto__page__requestview-main_content-text'>{ftoSubmissionInfo.submission_details.track_edit_reason}</p>
                                        </>
                                    )}
                                    <br />
                                </>
                            )}
                            <div className='fto__page__requestview-main_content_right-request_user'>
                                <p><b>By {ftoSubmissionInfo.user_username}</b></p>
                                <p style={{color: 'gray'}}>
                                    {GetTimeAgoBetweenDates(new Date(ftoSubmissionInfo.request_date), new Date())}
                                </p>
                            </div>

                            <SubmissionVotes
                                isSubmissionUpVoted={isSubmissionUpVoted}
                                likeSubmission={likeSubmission}
                                upDownVoteCount={upDownVoteCount}
                                request_id={request_id}/>
                            
                    </div>
                    </div>
                    <hr className='fto_horizontal_hr' />
                    
                    <Comments 
                        ftoPageId={ftoSubmissionInfo.request_submission_id}
                        currentUserId={user_properties}
                        getCommentsApi={getCommentsApi}  
                        createCommentApi={createCommentApi} 
                        deleteCommentApi={deleteCommentApi} 
                        updateCommentApi={updateCommentApi} 
                        updateCommentLikesApi={updateCommentLikesApi} />
                </div>
                )}
            </div>
		    <Footer />
        </div>
    )
}

export default TrackRequestView