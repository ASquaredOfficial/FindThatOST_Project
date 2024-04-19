import React, { useEffect, useState } from 'react';
import './comments.css';

import { RenameObjectKey } from '../../utils/RegularUtils';
import CommentForm from './CommentForm';
import Comment from './Comment';
import { toast } from 'react-toastify';

const Comments = ({ currentUserId, ftoEpisodeId}) => {

    const [ backendComments, setBackendComments ] = useState([]);
	const [ activeComment, setActiveComment ] = useState(null);
	const rootComments = backendComments
	.filter((backendComment) => 
		backendComment.parentId === null
	)
	.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	
	const props = {
		userId: 1,
		username: "Admin1012",
	}

    useEffect(() => {
		// Get comments from the server
		FetchCommentsData();
    }, []);

	const FetchCommentsData = async () => {
		const episodeComments = await Fetch_FTO_GetEpisodeComments(ftoEpisodeId);
		episodeComments.forEach( episodeComment => RenameObjectKey( episodeComment, 'comment_id', 'id' ) );
		episodeComments.forEach( episodeComment => RenameObjectKey( episodeComment, 'comment_content', 'body' ) );
		episodeComments.forEach( episodeComment => RenameObjectKey( episodeComment, 'user_username', 'username' ) );
		episodeComments.forEach( episodeComment => RenameObjectKey( episodeComment, 'fto_user_id', 'userId' ) );
		episodeComments.forEach( episodeComment => RenameObjectKey( episodeComment, 'comment_parent_id', 'parentId' ) );
		episodeComments.forEach( episodeComment => RenameObjectKey( episodeComment, 'comment_date', 'createdAt' ) );
		console.debug("Episode Comments:", episodeComments)
		setBackendComments(episodeComments)
	}

    /**
     * Get episode comments for anime episode with corresponding FTO episode ID.
     * 
     * @async
     * @function Fetch_FTO_GetEpisodeComments
     * @param {number|string}  ftoAnimeID - FindThatOST Episode ID.
     * @returns {Promise<Array<JSON>>|undefined} The array of json objects (max length 1) containing anime details.
     * 
     */
    const Fetch_FTO_GetEpisodeComments = async (ftoEpisodeId) => {
        let apiUrl_fto = `/findthatost_api/episode_comments/getEpisodeComments/episode/${Number(ftoEpisodeId)}`
        console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
        try {
            const response = await fetch(apiUrl_fto); // Replace with your actual backend endpoint
            const data = await response.json();
            return data;
        } catch (error) {
            toast('An internal error has occurred with the FindThatOST server. Please try again later.');
            throw new Error('Error fetching data from backend:', error);
        }
    } 

	const getReplies = (commentId) => {
		const commentReplies = backendComments
			.filter(backendComment => {
				return Number(backendComment.parentId) === Number(commentId)
			})
			.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
		// console.log("Getting replies for comment ID:", commentId, "\nReplies are:", commentReplies)
		return commentReplies;
	}

	const addComment = (text, parentId = null) => {
		if (text !== null) {
			Fetch_FTO_PostEpisodeComment(ftoEpisodeId, text, parentId, currentUserId)
		}
		else {
			// Cancel Add Comment
			setActiveComment(null); // Hide the reply textbox after success
		}
	}
	
	/**
	* Perform post request to add episode comment.
	* @async
	* @function Fetch_FTO_PostEpisodeComment
	* @param {number|string}  nFtoEpisodeId - Episode ID corresponds to FindThatOST Episode ID.
	* @param {string}  strCommentBody - Comment To Add.
	* @param {number}  [nCommentParentId=null] - Comment Parent Id being responded to.
	* @param {number|string}  nUserId - UserId of logged in user.
     * @returns {undefined}
	* 
	*/
   	const Fetch_FTO_PostEpisodeComment = async (nFtoEpisodeId, strCommentBody, nCommentParentId = null, nUserId = 1) => {
		const objUserSubmission = {
			userId: nUserId,
			body: strCommentBody,
			parentId: nCommentParentId,
		};
		let apiUrl_fto = `/findthatost_api/episode_comments/postEpisodeComment/episode/${Number(nFtoEpisodeId)}`
		console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
		const response = await fetch(apiUrl_fto, {
			method: 'POST',
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
		else {
			console.debug("Response Data:", responseData);
			let newComment = {
				id: responseData.insertId,
				body: strCommentBody,
				parentId: nCommentParentId,
				userId: nUserId,
				username: props.username,
				createdAt: new Date().toISOString(),
			};
			// await FetchCommentsData(ftoEpisodeId); // refresh comments after
			setBackendComments([ ...backendComments, newComment ])
			setActiveComment(null); // Hide the reply textbox after success
		}
	}

	const deleteComment = (commentId) => {
		if (window.confirm(`Delete the comment?`)) {
			Fetch_FTO_DeleteEpisodeComment(commentId, props.userId)
		}
	}
	
	/**
	* Perform post request to update episode comment.
	* @async
	* @function Fetch_FTO_DeleteEpisodeComment
	* @param {number|string}  nFtoCommentId - Comment ID corresponds to FindThatOST comment ID.
	* @param {number|string}  nUserId - UserId of logged in user.
     * @returns {undefined}
	* 
	*/
	const Fetch_FTO_DeleteEpisodeComment = async (nFtoCommentId, nUserId) => {
		const objUserSubmission = {
			userId: nUserId,
		};
		let apiUrl_fto = `/findthatost_api/episode_comments/deleteEpisodeComment/comment_id/${Number(nFtoCommentId)}`
		console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
		const response = await fetch(apiUrl_fto, {
			method: 'POST',
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
			toast('Failed to delete comment.\nInvalid parameters detected.');
			console.warn("Response status:", responseStatus);
			console.warn("Error fetching data from backend:", responseData);
		}
		else {
			console.debug("Response Data:", responseData);
			const updatedBackendComments = backendComments.filter(backendComment => {
				return backendComment.id !== nFtoCommentId;
			});
			setBackendComments(updatedBackendComments);
		}
	}

	const updateComment = (text, commentId) => {
		if (text !== null) {
			Fetch_FTO_PatchEpisodeComment(commentId, text, props.userId)
		}
		else {
			// Cancel Add Comment
			setActiveComment(null); // Hide the reply textbox after success
		}
	}
	
	/**
	* Perform post request to update episode comment.
	* @async
	* @function Fetch_FTO_PatchEpisodeComment
	* @param {number|string}  nFtoCommentId - Comment ID corresponds to FindThatOST comment ID.
	* @param {string}  strCommentBody - Updated Comment.
	* @param {number|string}  nUserId - UserId of logged in user.
     * @returns {undefined}
	* 
	*/
   	const Fetch_FTO_PatchEpisodeComment = async (nFtoCommentId, strCommentBody, nUserId) => {
		const objUserSubmission = {
			userId: nUserId,
			body: strCommentBody,
		};
		let apiUrl_fto = `/findthatost_api/episode_comments/patchEpisodeComment/comment_id/${Number(nFtoCommentId)}`
		console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
		const response = await fetch(apiUrl_fto, {
			method: 'POST',
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
			const updatedComments = backendComments.map(backendComment => {
				if (backendComment.id === nFtoCommentId) {
					return { ...backendComment, body: strCommentBody}
				}
				return backendComment;
			});
			setBackendComments(updatedComments)
			setActiveComment(null);
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
								currentUserId={props.userId}
								deleteComment = {deleteComment}
								addComment={addComment}
								updateComment={updateComment}
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