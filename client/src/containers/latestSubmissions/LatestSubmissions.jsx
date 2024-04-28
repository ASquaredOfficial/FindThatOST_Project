import React, {useEffect, useState} from 'react';
import './latestsubmissions.css';

import SubmissionVotes from '../../components/submissionvotes/submissionvotes';
import { useCustomNavigate } from './../../routing/navigation';
import { IsEmpty } from '../../utils/RegularUtils';
import { toast } from "react-toastify";

const LatestSubmissions = ({
    user_properties = {
        userId: null, 
        username: null
    }
}) => {
    const { navigateToTrackRequest } = useCustomNavigate();

    const [ ftoLatestSubmissions, setFTOLatestSubmissions ] = useState();
    const latestSubmissionsCount = 5;
    
    useEffect(() => {
        FetchComponentData();
        user_properties
    }, []);

    /**
     * Perform all fetches to set up the webpage.
     * 
     * @async
     * @function FetchComponentData
     * 
     */
    const FetchComponentData = async () => {
        try {
            // Fetch data from the backend
            const dataFromBackend = await FetchLatestSubmissionData_FTO(latestSubmissionsCount);
            console.debug('Latest Submissions Data from backend:', dataFromBackend);
            setFTOLatestSubmissions(dataFromBackend);
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    /**
     * Get anime details for anime with corresponding FTO Submissin ID.
     * 
     * @async
     * @function FetchLatestSubmissionData_FTO
     * @param {number|string}  latestCount - No of latest anime
     * @returns {Promise<Array<JSON>>|undefined} The array of json objects containing latest submission details.
     * 
     */
    const FetchLatestSubmissionData_FTO = async (latestCount) => {
        let apiUrl_fto = `/findthatost_api/submission/details/latest/${Number(latestCount)}`;
        console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
        try {
            const response = await fetch(apiUrl_fto);
            if (response.status === 204) {
                return [];
            }
            const data = await response.json();
            return data;
        } catch (error) {
            toast('An internal error has occurred in FindThatOST Server. Please try again later.');
            throw new Error('Error fetching data from backend. Error:', error);
        }
    }

    const ConvertSubmissionTypeToString = (strSubmissionType) => {
        if (strSubmissionType.toLowerCase() === 'track_add') {
            return  "Added New Track";
        }
        else if (strSubmissionType.toLowerCase() === 'track_add_pre') {
            return  "Added Pre-existing Track";
        }
        else if (strSubmissionType.toLowerCase() === 'track_edit') {
            return  "Edited Track";
        }
        else if (strSubmissionType.toLowerCase() === 'track_remove') {
            return  "Removed Track From Episode";
        }
    }
    
    return (
        <div className='fto__latest__submissions-info_list'>
            {(!IsEmpty(ftoLatestSubmissions) && Array.isArray(ftoLatestSubmissions)) && (
                <>
                <div className='fto__latest__submissions-info_list-header_section'>
                    <h4 className='fto__latest__submissions-main_content-header'>
                        Latest Submissions
                    </h4>
                </div>
                <hr />

                <div className='fto__latest__submissions-main_content--list_items'>
                    {ftoLatestSubmissions.map((submissionInfo, it) => {
                        return (
                            <div className='fto__latest__submissions-main_content--list_item' key={it}>
                                <div className='fto__latest__submissions-main_content--track_item-header'>
                                    <a href={'/request/' + submissionInfo.request_submission_id} onClick={(e) => { e.preventDefault(); navigateToTrackRequest(submissionInfo.request_submission_id)}}
                                        key={it} style={{flex: '1'}}>
                                        <div className='fto__latest__submissions-main_content--track_item-header_left'>
                                            <h4>{ConvertSubmissionTypeToString(submissionInfo.submission_type)}</h4>
                                            <h5 className='fto__latest__submissions-subheader_color'>{submissionInfo.user_username}</h5>
                                        </div>
                                    </a>
                                    <div className='fto__latest__submissions-main_content--track_item-header_right'>
                                        <SubmissionVotes
                                            ftoSubmissionInfo={submissionInfo}
                                            request_id={submissionInfo.request_submission_id}
                                            RefreshPageFunction={FetchComponentData}
                                            user_properties={user_properties}/>
                                    </div>
                                </div>
                                
                                <div className='fto__latest__submissions-main_content--track_item-submission_description'>
                                    <p><b>Submssion Description:</b></p>
                                    {(submissionInfo.submission_type.toLowerCase() === 'track_add') && (
                                        <p className='fto__latest__submissions-main_content--track_item-submission_description_text' >
                                            Added New Track called <b>'{submissionInfo.submission_details.track_name}'</b> to <b>{submissionInfo.canonical_title}</b>
                                            {(Number(submissionInfo.submission_details.episode_no) > 0) && (
                                                <>
                                                    {` Episode ${submissionInfo.submission_details.episode_no}`}
                                                </>
                                            )}
                                        </p>
                                    )}
                                    {(submissionInfo.submission_type.toLowerCase() === 'track_add_pre') && (
                                        <p className='fto__latest__submissions-main_content--track_item-submission_description_text' >
                                            Added Track <b>'{submissionInfo.submission_details.track_name}'</b> to <b>{submissionInfo.canonical_title}</b> Episode {submissionInfo.submission_details.episode_no}
                                        </p>
                                    )}
                                    {(submissionInfo.submission_type.toLowerCase() === 'track_edit') && (
                                        <p className='fto__latest__submissions-main_content--track_item-submission_description_text' >
                                            Edited Track in <b>{submissionInfo.canonical_title}</b> Episode {submissionInfo.submission_details.episode_no}
                                        </p>
                                    )}
                                    {(submissionInfo.submission_type.toLowerCase() === 'track_remove') && (
                                        <p className='fto__latest__submissions-main_content--track_item-submission_description_text' >
                                            Removed Track <b>'{submissionInfo.submission_details.track_name}'</b> from <b>{submissionInfo.canonical_title}</b> Episode {submissionInfo.submission_details.episode_no}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <br/>
                </>
            )}
        </div>
    )
}

export default LatestSubmissions