import React, {useState, useEffect} from 'react';
import { IsEmpty } from '../../utils/RegularUtils';
import { AddErrorToFtoInput } from './submission';

const SubmitTrackRemoveModal = (
    {
        setModalVisibility, 
        setPageLoading,
        setSuccessfulSubmitQuery,
        setFtoEpisodeID,
        setPageToEditMode,
        trackID,
        occurrenceID,
    }) => {

    const [ charCount_removeReasons, setCharCount_removeReasons] = useState('');
    const maxCharCountLength_removeReasons = 200;
    
    useEffect(() => {
        // Empty onmount
        setCharCount_removeReasons('');
        setPageToEditMode(false);
    }, []);

    const handleChange_TrackRemove = (event) => {
        let inputElement = HTMLElement;
        inputElement = event.target;
        const inputElementName = String(inputElement.name);
        const inputElementValue = inputElement.value;
        
        // Validate input, if its in error state
        let listOfClassNames = inputElement.className.split(" ");
        let classNameIndex = Number(listOfClassNames.findIndex(item => item === "fto_input-error"));
        if (classNameIndex > -1) {
            listOfClassNames.splice(classNameIndex, 1);

            //Update input cascade styling (via className)
            event.target.className = listOfClassNames.join(' ').trim();
        }

        // Update character count label for sceneDescription
        else if (inputElementName === 'submit_removeReason') {
            setCharCount_removeReasons(inputElementValue);
        }
    }

    const handleSubmit_TrackRemove = () => {
        setPageLoading(true);
        const currentFormValues = document.getElementById('track_remove_form');
        let bIsValid = ValidateInputs(currentFormValues);
        if (bIsValid) {
            FetchPostSubmissionTrackRemove_FTO(trackID, occurrenceID);
        }
        setPageLoading(false);
    }

    const ValidateInputs = (formElements) => {
        let strElemIdFirstInvalidInput = '';
        let inputElement = HTMLElement;

        // Validate Release Date
        inputElement = formElements[`submit_removeReason`];
        if (IsEmpty(inputElement.value)) {
            //Handle when input is empty
            AddErrorToFtoInput(inputElement);
            strElemIdFirstInvalidInput = (!IsEmpty(strElemIdFirstInvalidInput)) ? strElemIdFirstInvalidInput : inputElement.name;
        }

        // If error occurred, update latest submitted tracks variable and scroll to error input. 
        if (!IsEmpty(strElemIdFirstInvalidInput)) {
            // Focus on first input with error
            formElements[strElemIdFirstInvalidInput].scrollIntoViewIfNeeded();
            formElements[strElemIdFirstInvalidInput].focus();
            return false;
        }
        return true;
    }

    /**
     * Perform all fetches to set up the webpage.
     * @async
     * @function FetchPostSubmissionTrackRemove_FTO
     * @param {number|string}  nTrackID - Page/Anime ID from url, corresponds to FindThatOST Anime ID.
     * @param {number|string}  nFtoOccurrenceID -  Episode No track is being added to. -1 if added to no specific episode.
     * @param {object}  objUserSubmission - Object containg data submitted by user.
     * @param {number|string}  nUserId - UserId of logged in user.
     * 
     */
    const FetchPostSubmissionTrackRemove_FTO = async (nTrackID, nFtoOccurrenceID, nUserId = 1) => {
        const objUserSubmission = {};
        objUserSubmission['user_id'] = nUserId;
        objUserSubmission['submit_removeReason'] = charCount_removeReasons;
        let apiUrl_fto = `/findthatost_api/submission/submit/track_remove/${Number(nTrackID)}/occurrence_id/${nFtoOccurrenceID}`;
        console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
        const response = await fetch(apiUrl_fto, 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ objUserSubmission }),
        });

        const responseStatus = response.status;
        const responseData = await response.json();
        if (responseStatus === 200) {    
            if (!IsEmpty(responseData)) {
                setSuccessfulSubmitQuery(true);
                setFtoEpisodeID(-1);
            }
            else {
                setSuccessfulSubmitQuery(false);
            }
        } else {
            console.error('Error:', responseData);
            setSuccessfulSubmitQuery(false);
        }
    }

    const CloseModal = () => {
        setModalVisibility(false)
        setPageToEditMode(true);
    }

    return (
        <div className="fto_modal">
            <div className="fto_modal-content">
                <form id='track_remove_form'>
                    <div className='title_confirmation'>
                        <h1>
                            Confirm you would like to remove this track.
                        </h1>
                    </div>
                    <div className='body'>
                        <br />
                        <p>The next page is awesome! You should move forward, you will enjoy it.</p>
                        <textarea name='submit_removeReason' type='text' className='fto_input'
                            placeholder='Short desctription of reason for deleting track from episode.' maxLength={ maxCharCountLength_removeReasons } 
                            onChange={ handleChange_TrackRemove } value={charCount_removeReasons}
                        />
                        <div className='fto_modal-content-align_end'>
                            <span>
                                {charCount_removeReasons.length}/{maxCharCountLength_removeReasons} characters
                            </span>
                        </div>
                    </div>
                    <div className='fto_modal-content-footer'>
                        <button className='fto__button__gray' type='button' onClick={ CloseModal }>Cancel</button>
                        <button className='fto__button__pink' type='button' onClick={ handleSubmit_TrackRemove }>Continue</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SubmitTrackRemoveModal