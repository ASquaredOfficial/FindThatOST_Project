import React, { useEffect, useState } from 'react';
import './comments.css';

import { IsEmpty } from '../../utils/RegularUtils';
import CommentForm from './CommentForm';
import Comment from './Comment';

const Comments = ({ 
	ftoPageId, //ftoEpisodeId or ftoSubmissionId
	getCommentsApi,
	createCommentApi,
	deleteCommentApi,
	updateCommentApi,
	updateCommentLikesApi,
    user_properties = {
        userId: null, 
        username: null
    }
}) => {

    const [ backendComments, setBackendComments ] = useState([]);
	const [ activeComment, setActiveComment ] = useState(null);
	const rootComments = backendComments
	.filter((backendComment) => 
		backendComment.parentId === null
	)
	.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	

    useEffect(() => {
		// Get comments from the server
		FetchCommentsData();
    }, []);

	const FetchCommentsData = async () => {
		const episodeComments = await getCommentsApi(ftoPageId);
		setBackendComments(episodeComments)
	}

	const getReplies = (commentId) => {
		const commentReplies = backendComments
			.filter(backendComment => {
				return Number(backendComment.parentId) === Number(commentId)
			})
			.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
		return commentReplies;
	}

	const addComment = (text, parentId = null) => {
		if (text !== null) {
			createCommentApi(ftoPageId, text, parentId, user_properties, { setActiveComment });
			FetchCommentsData(ftoPageId); // refresh comments after
		}
		else {
			// Cancel Add Comment
			setActiveComment(null); // Hide the reply textbox after success
		}
	}

	const deleteComment = (commentId) => {
		if (window.confirm(`Delete the comment?`)) {
			deleteCommentApi(commentId, user_properties.userId, {setBackendComments})
		}
	}

	const updateComment = (text, commentId) => {
		if (text !== null) {
			updateCommentApi(commentId, text, user_properties.userId, {setBackendComments, setActiveComment})
		}
		else {
			// Cancel Add Comment
			setActiveComment(null); // Hide the reply textbox after success
		}
	}
	
	/**
	 * Updates the like status of a comment and sends a PATCH request to the backend.
	 * @function likeComment
	 * @param {number} nFtoCommentId - The ID of the comment to update.
	 * @param {boolean|undefined} bLikeComment - The like status of the comment. 
	 *                                           If true, sets the comment as liked. 
	 *                                           If false, sets the comment as disliked. 
	 *                                           If undefined, removes the like/dislike of the user.
	 * @returns {undefined}
	 */
	const likeComment = (nFtoCommentId, bLikeComment) => {
		let backendComment = backendComments.find(comment => comment.id === nFtoCommentId);
		if (backendComment.hasOwnProperty('likesDislikes')) {
            let arrCommentLikesDislikes = JSON.parse(backendComment['likesDislikes']);
			if (bLikeComment === undefined) {
				// Remove user's like entry from state, if the user state exists
				if (Array.isArray(arrCommentLikesDislikes)) {
					let objExistingLikesDislikeEntry = arrCommentLikesDislikes.find(likeEntry => likeEntry['user_id'] === user_properties.userId);
					if (objExistingLikesDislikeEntry !== undefined) {
						// User entry exists
						const filteredArray = arrCommentLikesDislikes.filter(likeEntry => likeEntry['user_id'] !== user_properties.userId);
						arrCommentLikesDislikes = filteredArray;
					}
					else { return }
				}
			} 
			else if (bLikeComment === true) {
				// Set user's entry to like or add like entry to state
				if (IsEmpty(arrCommentLikesDislikes) || !Array.isArray(arrCommentLikesDislikes)) {
					// Create new array object, then add new user
					arrCommentLikesDislikes = [{user_id: user_properties.userId, is_like: true}]
				}
				else {
					if (Array.isArray(arrCommentLikesDislikes)) {
						let objExistingLikesDislikeEntry = arrCommentLikesDislikes.find(likeEntry => likeEntry['user_id'] === user_properties.userId);
						if (objExistingLikesDislikeEntry === undefined) {
							// User entry does not exist
							objExistingLikesDislikeEntry = { user_id: user_properties.userId, is_like: true };
							arrCommentLikesDislikes.push(objExistingLikesDislikeEntry); // Add new entry to array
						}
						else {
							// User entry exists
							if (objExistingLikesDislikeEntry['is_like'] !== true) {
								objExistingLikesDislikeEntry['is_like'] = true;	// Change existing dislike to a like
							}
							else {
								console.debug("Value already set to true");
							}
						}
						// Update the array with the modified entry
						arrCommentLikesDislikes = arrCommentLikesDislikes.map(entry => {
							if (entry.user_id === user_properties.userId) {
								return objExistingLikesDislikeEntry;
							}
							return entry;
						});
					}
					else { return }
				}
			} 
			else if (bLikeComment === false) {
				// Set user's entry to dislike or add dislike entry to state
				if (IsEmpty(arrCommentLikesDislikes) || !Array.isArray(arrCommentLikesDislikes)) {
					// Create new array object, then add new user
					arrCommentLikesDislikes = [{user_id: user_properties.userId, is_like: false}]
				}
				else {
					if (Array.isArray(arrCommentLikesDislikes)) {
						let objExistingLikesDislikeEntry = arrCommentLikesDislikes.find(likeEntry => likeEntry['user_id'] === user_properties.userId);
						if (objExistingLikesDislikeEntry === undefined) {
							// User entry does not exist
							objExistingLikesDislikeEntry = { user_id: user_properties.userId, is_like: false };
							arrCommentLikesDislikes.push(objExistingLikesDislikeEntry); // Add new entry to array
						}
						else {
							// User entry exists
							if (objExistingLikesDislikeEntry['is_like'] !== false) {
								objExistingLikesDislikeEntry['is_like'] = false; // Change existing dislike to a like
							}
							else {
								console.debug("Value already set to false");
							}
						}
						// Update the array with the modified entry
						arrCommentLikesDislikes = arrCommentLikesDislikes.map(entry => {
							if (entry.user_id === user_properties.userId) {
								return objExistingLikesDislikeEntry;
							}
							return entry;
						});
					}
					else { return }
				}
			} 

			// Update Comment Likes
			updateCommentLikesApi(nFtoCommentId, arrCommentLikesDislikes, user_properties.userId);
			FetchCommentsData();
		}
	}

	return (
		<div className='fto__comments' style={ { color: 'white'}}>
			<h3 className='fto__comments-title'>Comments</h3>
			<hr className='fto_horizontal_hr' />
			<div className='fto__comments-main_form_title'>Write Comment</div>
            <CommentForm handleSubmit={addComment}
                        submitLabel="Comment"
                        placeholderLabel="Add a comment..." />
			<div className='fto__comments-container'>
				{rootComments.map(rootComment => {
					return (
						<div key={rootComment.id}>
							<Comment 
								key={rootComment.id} 
								comment={rootComment} 
								replies={getReplies(rootComment.id)}
								currentUserId={user_properties.userId}
								deleteComment = {deleteComment}
								addComment={addComment}
								updateComment={updateComment}
								likeComment={likeComment}
								activeComment={activeComment}
								setActiveComment={setActiveComment}
							/>
						</div>
					);
				})}
			</div>
		</div>
	)
}

export default Comments