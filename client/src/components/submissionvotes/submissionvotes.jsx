import React, {useEffect, useState} from 'react';
import "./submissionvotes.css"

import { TbArrowBigUp, TbArrowBigUpFilled, TbArrowBigDown, TbArrowBigDownFilled } from "react-icons/tb";
import { IsEmpty, RenameObjectKey } from '../../utils/RegularUtils';
import { toast } from 'react-toastify';

const SubmissionVotes = ({
    ftoSubmissionInfo,
    request_id,
    RefreshPageFunction,
    user_properties = {
        userId: null, 
        username: null
    },
}) => {

    const [ nFtoSubmissionId, setFtoSubmissionID ] = useState(-1);
    const [ isSubmissionUpVoted, setSubmissionVote ] = useState();
    const [ upDownVoteCount, setUpDownVoteCount ] = useState({ upvote_count: 0, downvote_count: 0});

    useEffect(() => {
        if (!IsEmpty(ftoSubmissionInfo)) {
            // Set nFtoSubmissionId
            if (nFtoSubmissionId !== ftoSubmissionInfo.request_submission_id) {
                setFtoSubmissionID(ftoSubmissionInfo.request_submission_id)
            }

            RenameObjectKey( ftoSubmissionInfo, 'request_upvotes', 'likesDislikes' );
            
            if (typeof (ftoSubmissionInfo.likesDislikes) === 'string'|| Array.isArray(ftoSubmissionInfo.likesDislikes)) {
                const objCommentLikesDislikes = (typeof (ftoSubmissionInfo.likesDislikes) == 'string') ? JSON.parse(ftoSubmissionInfo.likesDislikes) : ftoSubmissionInfo.likesDislikes;
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

        
    }, [ftoSubmissionInfo, user_properties]);

    useEffect(() => {
        RefreshPageFunction(request_id); // TODO- Make this function refresh the component in the map instead of calling everything again. So that it will always refresh the specific request instead of refreshing everything.
    }, [user_properties]);

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
            let arrSubmissionUpDownVotes = (!IsEmpty(backendSubmission.likesDislikes)) ? JSON.parse(backendSubmission['likesDislikes']) : [];
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
            RefreshPageFunction(request_id);
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
        if (IsEmpty(nUserId)) {
            toast("You must sign in to perform this operation.");
            return;
        }
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
        <div className='submission__votes-actions'>
            {(isSubmissionUpVoted === undefined) ? (
                <>
                    <div className="submission__votes-action-icon_section">
                        <TbArrowBigUp className="submission__votes-action-icon" onClick={() => likeSubmission(request_id, true)}/>
                        {(upDownVoteCount.upvote_count !== 0) && 
                            <span className="submission__votes-action-icon_text">{upDownVoteCount.upvote_count}</span>
                        }
                    </div>
                    <div className="submission__votes-action-icon_section">
                        <TbArrowBigDown className="submission__votes-action-icon" onClick={() => likeSubmission(request_id, false)}/>
                        {(upDownVoteCount.downvote_count !== 0) && 
                            <span className="submission__votes-action-icon_text">{upDownVoteCount.downvote_count}</span>
                        }
                    </div>
                </>
            ) : (
                <>
                    {(isSubmissionUpVoted === true) ? (
                        <div style={ {display: 'flex', flexDirection: 'row', gap: '5px'}}>
                            <div className="submission__votes-action-icon_section">
                                <TbArrowBigUpFilled className="submission__votes-action-icon" onClick={() => likeSubmission(request_id)}/>
                                {(upDownVoteCount.upvote_count !== 0) && 
                                    <span className="submission__votes-action-icon_text">{upDownVoteCount.upvote_count}</span>
                                }
                            </div>
                            <div className="submission__votes-action-icon_section">
                                <TbArrowBigDown className="submission__votes-action-icon" onClick={() => likeSubmission(request_id, false)}/>
                                {(upDownVoteCount.downvote_count !== 0) && 
                                    <span className="submission__votes-action-icon_text">{upDownVoteCount.downvote_count}</span>
                                }
                            </div>
                        </div>
                    ) : (
                        <div style={ {display: 'flex', flexDirection: 'row', gap: '5px'}}>
                            <div className="submission__votes-action-icon_section">
                                <TbArrowBigUp className="submission__votes-action-icon" onClick={() => likeSubmission(request_id, true)}/>
                                {(upDownVoteCount.upvote_count !== 0) && 
                                    <span className="submission__votes-action-icon_text">{upDownVoteCount.upvote_count}</span>
                                }
                            </div>
                            <div className="submission__votes-action-icon_section">
                                <TbArrowBigDownFilled className="submission__votes-action-icon" onClick={() => likeSubmission(request_id)}/>
                                {(upDownVoteCount.downvote_count !== 0) && 
                                    <span className="submission__votes-action-icon_text">{upDownVoteCount.downvote_count}</span>
                                }
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default SubmissionVotes