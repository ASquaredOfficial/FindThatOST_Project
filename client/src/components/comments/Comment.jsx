import { useEffect, useState } from "react";
import { GetTimeAgoBetweenDates } from "../../utils/RegularUtils";
import userIcon from "./../../assets/user-icon.png"
import CommentForm from "./CommentForm";

import { BiLike, BiDislike, BiSolidLike, BiSolidDislike } from "react-icons/bi";

const Comment = ({ 
    comment, 
    replies, 
    currentUserId, 
    deleteComment, 
    addComment,
    updateComment,
    likeComment,
    activeComment, 
    setActiveComment,
    parentId = null,
 }) => {

    const fiveMINS = 300000;
    const validTimePassed = new Date() - new Date(comment.createdAt) < fiveMINS;
    const canRely = Boolean(currentUserId);
    const canEdit = (currentUserId === Number(comment.userId) && validTimePassed);
    const canDelete = (currentUserId === Number(comment.userId) && validTimePassed);
    const [ isCommentLiked, setCommentLiked ] = useState();
    const [ likeDislikeCount, setLikeDislikeCount ] = useState({ like_count: 0, dislike_count: 0});
    
    useEffect(()=>{
        if (typeof (comment.likesDislikes) == 'string') {
            const objCommentLikesDislikes = JSON.parse(comment.likesDislikes);
            if (Array.isArray(objCommentLikesDislikes) && Object.keys(objCommentLikesDislikes).length >= 0) {
                let nNoOfLikes = 0;
                let nNoOfDislikes = 0;
                let bIsCommentLiked = undefined;
                for (let it = 0; it < Object.keys(objCommentLikesDislikes).length; it++ ) {
                    if (objCommentLikesDislikes[it]['is_like'] === true) {
                        nNoOfLikes++;

                        // Check if Comment is liked
                        if (objCommentLikesDislikes[it]['user_id'] === currentUserId) {
                            bIsCommentLiked = true;
                        }
                    }
                    else if (objCommentLikesDislikes[it]['is_like'] === false) {
                        nNoOfDislikes++;

                        // Check if Comment is disliked
                        if (objCommentLikesDislikes[it]['user_id'] === currentUserId) {
                            bIsCommentLiked = false;
                        }
                    }
                }
                setCommentLiked(bIsCommentLiked);
                setLikeDislikeCount({like_count: nNoOfLikes, dislike_count: nNoOfDislikes})
            }
        }
    }, [comment]);

    const isReplying = (
        activeComment && 
        activeComment.type === "replying" && 
        activeComment.id === comment.id
    );
    const isEditing = (
        activeComment && 
        activeComment.type === "editing" && 
        activeComment.id === comment.id
    );
    const replyId = parentId ? parentId : comment.id;

    return (
        <div key={comment.id} className="comment">
            <div className="comment-image-container">
                <img src={userIcon} />
            </div>
            <div className="comment-right-part">
                <div className="comment-header">
                    <div className="comment-author">{comment.username}</div>
                    <div>•</div>
                    <div>{GetTimeAgoBetweenDates(new Date(comment.createdAt), new Date())}</div>
                </div>
                {!isEditing && <div className="comment-text">{comment.body}</div>}
                {isEditing && (
                <CommentForm
                    submitLabel="Update"
                    placeholderLabel="Update comment..."
                    handleSubmit={(text) => updateComment(text, comment.id)}
                    cancelable={true}
                    initialText={comment.body}
                />
                )}
                <div className="comment-actions">
                    {(isCommentLiked === undefined) ? (
                        <>
                            <div className="comment-action-icon_section">
                                <BiLike className="comment-action-icon" onClick={() => likeComment(comment.id, true)}/>
                                {(likeDislikeCount.like_count !== 0) && 
                                    <span className="comment-action-icon_text">{likeDislikeCount.like_count}</span>
                                }
                            </div>
                            <div className="comment-action-icon_section">
                                <BiDislike className="comment-action-icon" onClick={() => likeComment(comment.id, false)}/>
                                {(likeDislikeCount.dislike_count !== 0) && 
                                    <span className="comment-action-icon_text">{likeDislikeCount.dislike_count}</span>
                                }
                            </div>
                        </>
                    ) : (
                        <>
                            {(isCommentLiked === true) ? (
                                <div style={ {display: 'flex', flexDirection: 'row', gap: '5px'}}>
                                    <div className="comment-action-icon_section">
                                        <BiSolidLike className="comment-action-icon" onClick={() => likeComment(comment.id)}/>
                                        {(likeDislikeCount.like_count !== 0) && 
                                            <span className="comment-action-icon_text">{likeDislikeCount.like_count}</span>
                                        }
                                    </div>
                                    <div className="comment-action-icon_section">
                                        <BiDislike className="comment-action-icon" onClick={() => likeComment(comment.id, false)}/>
                                        {(likeDislikeCount.dislike_count !== 0) && 
                                            <span className="comment-action-icon_text">{likeDislikeCount.dislike_count}</span>
                                        }
                                    </div>
                                </div>
                            ) : (
                                <div style={ {display: 'flex', flexDirection: 'row', gap: '5px'}}>
                                    <div className="comment-action-icon_section">
                                        <BiLike className="comment-action-icon" onClick={() => likeComment(comment.id, true)}/>
                                        {(likeDislikeCount.like_count !== 0) && 
                                            <span className="comment-action-icon_text">{likeDislikeCount.like_count}</span>
                                        }
                                    </div>
                                    <div className="comment-action-icon_section">
                                        <BiSolidDislike className="comment-action-icon" onClick={() => likeComment(comment.id)}/>
                                        {(likeDislikeCount.dislike_count !== 0) && 
                                            <span className="comment-action-icon_text">{likeDislikeCount.dislike_count}</span>
                                        }
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    {canRely && (
                        <div className="comment-action"
                            onClick={() => 
                                setActiveComment({id: comment.id, type: "replying"})
                            }
                        >
                            Reply
                        </div>
                    )}
                    {canEdit && (
                        <div className="comment-action"
                            onClick={() => 
                                setActiveComment({id: comment.id, type: "editing"})
                            }
                        >
                            Edit
                        </div>
                    )}
                    {canDelete && (
                        <div className="comment-action" 
                            onClick={() => deleteComment(comment.id)}
                        >
                            Delete
                        </div>
                    )}
                </div>
                {isReplying && (
                    <CommentForm
                        submitLabel="Reply"
                        placeholderLabel="Add a reply..."
                        handleSubmit={(text) => addComment(text, replyId)}
                        cancelable={true}
                    />
                )}
                
                
                {replies.length > 0 && (
                    <div className="replies">
                        {replies.map((reply) => {
                            return (
                                <div key={reply.id}>
                                    <Comment 
                                        key={reply.id} 
                                        comment={reply} 
                                        replies={[]} 
                                        currentUserId={currentUserId}    
                                        deleteComment={deleteComment}
                                        addComment={addComment}
                                        updateComment={updateComment}
                                        likeComment={likeComment}
                                        activeComment={activeComment}
                                        setActiveComment={setActiveComment}
                                        parentId={comment.id}
                                        />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Comment;