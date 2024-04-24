import { RenameObjectKey, IsEmpty } from "../../utils/RegularUtils";
import { toast } from 'react-toastify';

/**
 * Get episode comments for anime episode with corresponding FTO episode ID.
 * 
 * @async
 * @function Fetch_FTO_GetEpisodeComments
 * @param {number|string}  ftoEpisodeId - FindThatOST Episode ID.
 * @returns {Promise<Array<JSON>>|undefined} The array of json objects (max length 1) containing anime details.
 * 
 */
const Fetch_FTO_GetEpisodeComments = async (ftoEpisodeId) => {
    let apiUrl_fto = `/findthatost_api/episode_comments/${Number(ftoEpisodeId)}`
    console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
    try {
        const response = await fetch(apiUrl_fto); // Replace with your actual backend endpoint
        const episodeCommentsData = await response.json();
        episodeCommentsData.forEach( episodeComment => RenameObjectKey( episodeComment, 'comment_id', 'id' ) );
        episodeCommentsData.forEach( episodeComment => RenameObjectKey( episodeComment, 'comment_content', 'body' ) );
        episodeCommentsData.forEach( episodeComment => RenameObjectKey( episodeComment, 'user_username', 'username' ) );
        episodeCommentsData.forEach( episodeComment => RenameObjectKey( episodeComment, 'fto_user_id', 'userId' ) );
        episodeCommentsData.forEach( episodeComment => RenameObjectKey( episodeComment, 'comment_parent_id', 'parentId' ) );
        episodeCommentsData.forEach( episodeComment => RenameObjectKey( episodeComment, 'comment_date', 'createdAt' ) );
        episodeCommentsData.forEach( episodeComment => RenameObjectKey( episodeComment, 'comment_likes', 'likesDislikes' ) );
        console.debug("Episode Comments:", episodeCommentsData)
        return episodeCommentsData;
    } catch (error) {
        toast('An internal error has occurred with the FindThatOST server. Please try again later.');
        throw new Error('Error fetching data from backend:', error);
    }
} 
	
/**
 * Perform put request to add episode comment.
 * @async
 * @function Fetch_FTO_PostEpisodeComment
 * @param {number|string}  nFtoEpisodeId - Episode ID corresponds to FindThatOST Episode ID.
 * @param {string}  strCommentBody - Comment To Add.
 * @param {Object} stateSetterFunctions - Object containing state setter functions.
 * @param {function} stateSetterFunctions.setActiveComment - State setter function for comment acteve state
 * @param {number}  [nCommentParentId=null] - Comment Parent Id being responded to.
 * @param {{userId: number, username: string}} user_props - User Properties of logged in user.
 * @returns {undefined}
 * 
 */
const Fetch_FTO_PostEpisodeComment = async (nFtoEpisodeId, strCommentBody, nCommentParentId = null, user_props, stateSetterFunctions) => {
    const { setActiveComment } = stateSetterFunctions;
    const objUserSubmission = {
        userId: user_props.userId,
        body: strCommentBody,
        parentId: nCommentParentId,
    };
    let apiUrl_fto = `/findthatost_api/episode_comments/${Number(nFtoEpisodeId)}`;
    console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
    const response = await fetch(apiUrl_fto, {
        method: 'PUT',
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
            userId: user_props.userId,
            username: user_props.username,
            createdAt: new Date().toISOString(),
        };
        // await FetchCommentsData(nFtoEpisodeId); // refresh comments after
        // setBackendComments((backendComments) => [ ...backendComments, newComment ])
        setActiveComment(null); // Hide the reply textbox after success
    }
}
	
/**
 * Perform post request to update episode comment.
 * @async
 * @function Fetch_FTO_DeleteEpisodeComment
 * @param {number|string}  nFtoCommentId - Comment ID corresponds to FindThatOST comment ID.
 * @param {number|string}  nUserId - UserId of logged in user.
 * @param {Object} stateSetterFunctions - Object containing state setter functions.
 * @param {function} stateSetterFunctions.setBackendComments - State setter function for updating the frontend local comments
 * @returns {undefined}
 * 
 */
const Fetch_FTO_DeleteEpisodeComment = async (nFtoCommentId, nUserId, stateSetterFunctions) => {
    const {setBackendComments} = stateSetterFunctions;
    const objUserSubmission = {
        userId: nUserId,
    };
    let apiUrl_fto = `/findthatost_api/episode_comments/${Number(nFtoCommentId)}`;
    console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
    const response = await fetch(apiUrl_fto, {
        method: 'DELETE',
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
        return;
    }
    else {
        console.debug("Response Data:", responseData);
        setBackendComments((backendComments) => {
            const updatedBackendComments = backendComments.filter(backendComment => {
                return backendComment.id !== nFtoCommentId;
            });
            return updatedBackendComments;
        });
    }
}
	
/**
 * Perform post request to update episode comment.
 * @async
 * @function Fetch_FTO_PatchEpisodeComment
 * @param {number|string}  nFtoCommentId - Comment ID corresponds to FindThatOST comment ID.
 * @param {string}  strCommentBody - Updated Comment.
 * @param {number|string}  nUserId - UserId of logged in user.
 * @param {Object} stateSetterFunctions - Object containing state setter functions.
 * @param {function} stateSetterFunctions.setBackendComments - State setter function for updating the frontend local comments
 * @param {function} stateSetterFunctions.setActiveComment - State setter function for comment acteve state
 * @returns {undefined}
 * 
 */
const Fetch_FTO_PatchEpisodeComment = async (nFtoCommentId, strCommentBody, nUserId, stateSetterFunctions) => {
    const {setBackendComments, setActiveComment} = stateSetterFunctions;
    const objUserSubmission = {
        userId: nUserId,
        body: strCommentBody,
    };
    let apiUrl_fto = `/findthatost_api/episode_comments/${Number(nFtoCommentId)}`;
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
        setBackendComments((backendComments) => {
            const updatedComments = backendComments.map(backendComment => {
                if (backendComment.id === nFtoCommentId) {
                    return { ...backendComment, body: strCommentBody}
                }
                return backendComment;
            });
            return updatedComments;
        });
        setActiveComment(null);
    }
}

/**
 * Perform post request to update episode comment.
 * @async
 * @function Fetch_FTO_PatchEpisodeCommentLikes
 * @param {number|string}  nFtoCommentId - Comment ID corresponds to FindThatOST comment ID.
 * @param {Array}  likesDislikesObject - Updated Comment.
 * @param {number|string}  nUserId - UserId of logged in user.
 * @param {Object} stateSetterFunctions - Object containing state setter functions.
 * @param {function} stateSetterFunctions.setBackendComments - State setter function for updating the frontend local comments
 * @returns {undefined}
 * 
 */
const Fetch_FTO_PatchEpisodeCommentLikes = async (nFtoCommentId, objLikesDislikes, nUserId) => {
    if (IsEmpty(nUserId)) {
        toast("You must sign in to perform this operation.");
        return;
    }
    const objUserSubmission = {
        userId: nUserId,
        likesDislikes: objLikesDislikes,
    };
    let apiUrl_fto = `/findthatost_api/episode_comments/comment_likes/${Number(nFtoCommentId)}`;
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

export { 
    Fetch_FTO_GetEpisodeComments, 
    Fetch_FTO_PostEpisodeComment,
    Fetch_FTO_DeleteEpisodeComment,
    Fetch_FTO_PatchEpisodeComment,
    Fetch_FTO_PatchEpisodeCommentLikes,
};