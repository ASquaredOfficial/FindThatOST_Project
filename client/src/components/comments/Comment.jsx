import { GetTimeAgoBetweenDates } from "../../utils/RegularUtils";
import userIcon from "./../../assets/user-icon.png"
import CommentForm from "./CommentForm";

const Comment = ({ 
    comment, 
    replies, 
    currentUserId, 
    deleteComment, 
    addComment,
    updateComment,
    activeComment, 
    setActiveComment, 
    parentId = null,
 }) => {

    const fiveMINS = 300000;
    const validTimePassed = new Date() - new Date(comment.createdAt) < fiveMINS;
    const canRely = Boolean(currentUserId);
    const canEdit = (currentUserId === Number(comment.userId) && validTimePassed);
    const canDelete = (currentUserId === Number(comment.userId) && validTimePassed);

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