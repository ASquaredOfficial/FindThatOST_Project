import React, {useEffect} from 'react';
import "./submissionvotes.css"

import { TbArrowBigUp, TbArrowBigUpFilled, TbArrowBigDown, TbArrowBigDownFilled } from "react-icons/tb";

const SubmissionVotes = ({
    isSubmissionUpVoted,
    likeSubmission, 
    upDownVoteCount,
    request_id}) => {

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