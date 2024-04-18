import React, { useEffect, useState } from 'react';
import './comments.css';

import { IsEmpty } from '../../utils/RegularUtils';
import CommentForm from './CommentForm';
import Comment from './Comment';
import { 
	getComments as getCommentsApi,
	createComment as createCommentAPI,
	deleteComment as deleteCommentAPI,
	updateComment as updateCommentAPI,
} from './commentsApi';

const Comments = ({currentUserId}) => {

    const [ backendComments, setBackendComments ] = useState([]);
	const [ activeComment, setActiveComment ] = useState(null);
	const rootComments = backendComments.filter((backendComment) => 
		backendComment.parentId === null
	);
	const props = {
		userId: 1,
		username: "John",
	}

    useEffect(() => {
        getCommentsApi().then((data) => {
            console.debug('Got comments data: ', data);
            setBackendComments(data);
        });
    }, []);

	// useEffect(() => {
	// 	if (!IsEmpty(backendComments)) {
	// 		let newRootComments = backendComments.filter((backendComment) => 
	// 				backendComment.parentId === null
	// 		);
	// 		console.log("Root Comments:", newRootComments);
	// 		// setRootComments(newRootComments);
	// 	}
    // }, [backendComments]);

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
			createCommentAPI(text, parentId)
			.then((comment) => {
				setBackendComments([comment, ...backendComments]);
				setActiveComment(null); // Hide the reply textbox after success
			});
		}
		else {
			// Cancel Add Comment
			setActiveComment(null); // Hide the reply textbox after success
		}
	}

	const deleteComment = (commentId) => {
		if (window.confirm(`Delete the comment?`)) {
			deleteCommentAPI(commentId)
			.then(() => {
				const updatedBackendComments = backendComments.filter(backendComment => {
					return backendComment.id !== commentId;
				});
				setBackendComments(updatedBackendComments);
			})
		}
	}

	const updateComment = (text, commentId) => {
		if (text !== null) {
			updateCommentAPI(text, commentId)
			.then(() => {
				const updatedComments = backendComments.map(backendComment => {
					if (backendComment.id === commentId) {
						return { ...backendComment, body: text}
					}
					return backendComment;
				});
				setBackendComments(updatedComments)
				setActiveComment(null); // Hide the reply textbox after success
			});
		}
		else {
			// Cancel Add Comment
			setActiveComment(null); // Hide the reply textbox after success
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