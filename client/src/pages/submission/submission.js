import { IsEmpty } from '../../utils/RegularUtils';
import { IsFandomImageUrl, IsFandomCommunityWebsiteUrl, IsYoutubeVideoUrl, GetUrlPlatform } from '../../utils/HyperlinkUtils';

/**
 * Check if page has any errors.
 * @function ValidateInputs
 * @param {HTMLFormControlsCollection|object}  formElements - Form Elements with page inputs.
 * @param {{id: number; platform_type: string; inputString: string;}[]}  listOfPlatformInputs - List of objects for each platform input.
 * @param {Object} stateSetterFunctions - Object containing state setter functions.
 * @param {function} stateSetterFunctions.setUserSubmission - State setter function for updating the userSubmission state to send to database
 * @param {function} stateSetterFunctions.setPlatformItems - State setter function for updating platformItems state.
 * @param {function} stateSetterFunctions.setPageInputs - State setter function for updating pageInputs state.
 * @param {boolean} [submitPreExistingTrack=false] - Are we validating inputs for pre-existing track
 * @param {object} pageInputs - pageInputs
 * @returns {boolean} 
 * 
 */
const ValidateInputs = (formElements, listOfPlatformInputs, stateSetterFunctions, pageInputs, submitPreExistingTrack = false, submitEditTrack = false) => {
    const { setUserSubmission, setPlatformItems, setPageInputs } = stateSetterFunctions;
    let strElemIdFirstInvalidInput = '';
    let inputElement = HTMLElement;

    // Validate Track Name
    if (!submitEditTrack) {
        inputElement = formElements[`submit_trackName`];
        if (IsEmpty(inputElement.value)) {
            AddErrorToFtoInput(inputElement);
            strElemIdFirstInvalidInput = (!IsEmpty(strElemIdFirstInvalidInput)) ? strElemIdFirstInvalidInput : inputElement.name;
        }
    }

    // Validate Song Type
    inputElement = formElements[`submit_songType`];
    if (IsEmpty(inputElement.value)) {
        AddErrorToFtoInput(inputElement);
        strElemIdFirstInvalidInput = (!IsEmpty(strElemIdFirstInvalidInput)) ? strElemIdFirstInvalidInput : inputElement.name;
    }

    //Only validate inputs if adding a pre-existing track
    if (!submitPreExistingTrack) {
        // Validate Release Date
        inputElement = formElements[`submit_releaseDate`];
        if (IsEmpty(inputElement.value) || (new Date(inputElement.value).getTime() > new Date().getTime())) {
            //Handle when input is empty or date is bigger than current date
            AddErrorToFtoInput(inputElement);
            strElemIdFirstInvalidInput = (!IsEmpty(strElemIdFirstInvalidInput)) ? strElemIdFirstInvalidInput : inputElement.name;
        }

        //Validate Streaming Platforms Inputs
        if (!IsEmpty(listOfPlatformInputs.length)) {
            // Validate for duplicate inputs
            let listOfInputsToRemove = [];
            let setOfPlatformStrings = new Set();
            for (let i = 0; i < listOfPlatformInputs.length; i++) {
                let platformString = listOfPlatformInputs[i].inputString.trim();
                if (!IsEmpty(platformString)) {
                    if (setOfPlatformStrings.has(platformString)) {
                        //Duplicate string found, remove input
                        listOfInputsToRemove.push(listOfPlatformInputs[i].id);
                    } 
                    else {
                        setOfPlatformStrings.add(platformString);
                    }
                }
            }
            if (!IsEmpty(listOfInputsToRemove)) {
                // Remove platform objects with IDs present in idsToRemove array
                listOfPlatformInputs = listOfPlatformInputs.filter(platObj => !listOfInputsToRemove.includes(platObj.id));
                setPlatformItems(listOfPlatformInputs);

                const newInputs = { ...pageInputs };
                listOfInputsToRemove.forEach(platformID => {
                    if (pageInputs.hasOwnProperty(`streamPlat_item_section_${platformID}`)) {
                        delete newInputs[`streamPlat_item_section_${platformID}`];
                    }
                })
                setPageInputs(newInputs);
            }

            // Validate for unique streaming platforms
            const uniquePlatformNames = [...new Set(listOfPlatformInputs.map(platObj => platObj.platform_type))];
            uniquePlatformNames.forEach(platformName => {
                if (platformName !== 'non_basic') {
                    // Get sublist of objects with platform {platformName}
                    const sublist = listOfPlatformInputs.filter(platObj => platObj.platform_type === platformName);
                    if (sublist.length >= 2) {
                        sublist.forEach(platObj => {
                            // Add error to each platform duplicate 
                            inputElement = formElements[`submit_streamPlat_item_${platObj.id}`];
                            AddErrorToFtoInput(inputElement);
                            strElemIdFirstInvalidInput = (!IsEmpty(strElemIdFirstInvalidInput)) ? strElemIdFirstInvalidInput : inputElement.name;
                        });
                    }
                }
            });
        }

        // Validate Fandom Wikia Image URL
        inputElement = formElements[`submit_wikiaImgUrl`];
        if (!IsEmpty(inputElement.value)) {
            if (!IsFandomImageUrl(inputElement.value)) {
                AddErrorToFtoInput(inputElement);
                strElemIdFirstInvalidInput = (!IsEmpty(strElemIdFirstInvalidInput)) ? strElemIdFirstInvalidInput : inputElement.name;
            }
        }

        // Validate Fandom Wikia Webpage URL
        inputElement = formElements[`submit_wikiaWebpageUrl`];
        if (!IsEmpty(inputElement.value)) {
            if (!IsFandomCommunityWebsiteUrl(inputElement.value)) {
                AddErrorToFtoInput(inputElement);
                strElemIdFirstInvalidInput = (!IsEmpty(strElemIdFirstInvalidInput)) ? strElemIdFirstInvalidInput : inputElement.name;
            }
        }

        // Validate Embedded Video URL
        inputElement = formElements[`submit_embeddedYtUrl`];
        if (!IsEmpty(inputElement.value)) {
            if (!IsYoutubeVideoUrl(inputElement.value)) {
                AddErrorToFtoInput(inputElement);
                strElemIdFirstInvalidInput = (!IsEmpty(strElemIdFirstInvalidInput)) ? strElemIdFirstInvalidInput : inputElement.name;
            }
        }
    }
 
    // Validate Track Name
    if (submitEditTrack) {
        inputElement = formElements[`submit_editReason`];
        if (IsEmpty(inputElement.value)) {
            AddErrorToFtoInput(inputElement);
            strElemIdFirstInvalidInput = (!IsEmpty(strElemIdFirstInvalidInput)) ? strElemIdFirstInvalidInput : inputElement.name;
        }
    }

    // If error occurred, update latest submitted tracks variable and scroll to error input. 
    if (!IsEmpty(strElemIdFirstInvalidInput)) {
        // Update userSubmission
        setUserSubmission(prevState => {
            const updatedSubmission = { 
                ...prevState, 
            };
            
            // Loop through key-value pairs in pageInputs, updaating/inserting updatedSubmission
            for (const [key, value] of Object.entries(pageInputs)) {
                // Ignore Streaming Platform Inputs, added earlier
                if (!key.startsWith('submit_streamPlat_item_')) {
                    // Add the key-value pair to updatedSubmission
                    updatedSubmission[key] = value; 
                }
            }
            updatedSubmission['submit_streamPlat'] = listOfPlatformInputs;
            return updatedSubmission;
        });

        // Focus on first input with error
        formElements[strElemIdFirstInvalidInput].scrollIntoViewIfNeeded();
        formElements[strElemIdFirstInvalidInput].focus();
        return false;
    }
    return true;
}

/**
 * Add error border (and thus enable listener) for page input .
 * @function AddErrorToFtoInput
 * @param {HTMLElement}  ftoInputElement - Input element to add error to.
 * @returns {undefined} 
 * 
 */
const AddErrorToFtoInput = (ftoInputElement) => {
    let listOfClassNames = ftoInputElement.className.split(" ");
    if (listOfClassNames.indexOf('fto_input-error') === -1) {
        listOfClassNames.unshift('fto_input-error');
        ftoInputElement.className =  listOfClassNames.join(' ').trim();
    }
}

/**
 * Add Platform input to page.
 * @function AddPlatformInputToPage
 * @param {Object} stateSetterFunctions - Object containing state setter functions.
 * @param {function} stateSetterFunctions.setPlatformItems - State setter function for updating platformItems state.
 * @param {function} stateSetterFunctions.setNoOfPlatInputsCreated - State setter function for updating no of platformInputs state.
 * @param {Number} noOfPlatInputsCreated - Number of platform inputs present before onClick.
 * @param {String} strNewPlatform - Platform type string.
 * @returns {undefined} 
 * 
 */
const AddPlatformInputToPage = (stateSetterFunctions, noOfPlatInputsCreated, strNewPlatform = '') => {
    const { setPlatformItems, setNoOfPlatInputsCreated } = stateSetterFunctions;
    const newPlatform = { id: noOfPlatInputsCreated + 1, platform_type: 'non_basic', inputString: '' };
    setPlatformItems(prevItems => [...prevItems, newPlatform]);
    setNoOfPlatInputsCreated(count => count + 1);

    if (!IsEmpty(strNewPlatform)) {
        console.log("Created Element with ID:", `submit_streamPlat_item_${noOfPlatInputsCreated + 1}`)
    }
}

/**
 * Remove Platform input from page.
 * @function RemovePlatformInputFomPage
 * @param {Number} platformItemId - Platform Item ID for input to delete.
 * @param {Object} stateSetterFunctions - Object containing state setter functions.
 * @param {function} stateSetterFunctions.setPlatformItems - State setter function for updating platformItems state.
 * @param {function} stateSetterFunctions.setUserSubmission - State setter function for updating the userSubmission state to send to database
 * @returns {undefined} 
 * 
 */
const RemovePlatformInputFomPage = (platformItemId, stateSetterFunctions) => {
    const {setPlatformItems, setUserSubmission} = stateSetterFunctions;
    setPlatformItems(prevItems => {    
        const listOfPlatformInputs = prevItems.filter(item => item.id !== platformItemId);
        setUserSubmission(prevState => {
            // TODO - See what happens to the updatedSubmission when this is removed. Is this code needed
            const updatedSubmission = { 
                ...prevState, 
                submit_streamPlat: listOfPlatformInputs,
            }
            return updatedSubmission;
        });
        return prevItems.filter(item => item.id !== platformItemId);
    });
}


/**
 * Update Platform Input useState variables.
 * @function ListenToPlatformInput
 * @param {String} inputValue - Platform Item ID for input to delete.
 * @param {Number} item_id - Platform Item ID for input to delete.
 * @param {{id: number; platform_type: string; inputString: string;}[]}  listOfPlatformInputs - List of objects for each platform input.
 * @param {Object} stateSetterFunctions - Object containing state setter functions.
 * @param {function} stateSetterFunctions.setPlatformItems - State setter function for updating platformItems state.
 * @param {String} strInputUrl - Input url for input, to use instead of the inputValue setter function for updating platformItems state.
 * @returns {undefined} 
 * 
 */
const ListenToPlatformInput = (inputValue, item_id, listOfPlatformInputs, stateSetterFunctions, strInputUrl = '') => {
    const { setPlatformItems } = stateSetterFunctions;
    let urlString = (IsEmpty(strInputUrl)) ? inputValue : strInputUrl;
    let platformString = GetUrlPlatform(String(urlString).trim());
    console.debug("Get platform of string:", urlString, "\nPlatform is:", platformString)

    const updatedItems = listOfPlatformInputs.map(item => {
        if (item.id === item_id) {
            return { ...item, platform_type: platformString, inputString: urlString };
        }
        return item;
    });
    console.debug(`Updated Item: ${item_id}.\nDetails:`, updatedItems);
    setPlatformItems(updatedItems);
}

export { 
    ValidateInputs, 
    AddErrorToFtoInput,
    AddPlatformInputToPage,
    RemovePlatformInputFomPage,
    ListenToPlatformInput,
};