import { GetIdFromTrackUrl, GetPlatformTrackBaseUrl } from './HyperlinkUtils';

const _ = require('lodash');

/**
 * Parses a class name string by converting it to lowercase and replacing spaces with underscores.
 * @param {string} str - The class name string to be parsed.
 * @returns {string} - The parsed class name.
 */
const ParseClassName = (str) => {
    return str.toLowerCase().replace(/\s/g, '_');
};

/**
 * Checks if a value is empty or null.
 * @function IsEmpty
 * @param {*} value - The value to be checked.
 * @returns {boolean} - True if the value is empty or null, false otherwise.
 */
const IsEmpty = (value) => {
    if ((value == null) || (value === undefined)) {
        return true;
    }
    if (typeof value == 'object') {
        return Object.keys(value).length === 0;
    }
    else if (typeof value === "string") {
        return value.trim().length === 0
    }
    return false;
}

/**
 * Sorts a JSON object based on keys in alphabetical order, excluding a special key to be placed last.
 * @function SortJsonObjectAlphabeticallyExceptLast
 * @param {Object} jsonData - The JSON object to be sorted.
 * @param {string} specialKey - The key to be placed last in the sorted JSON object.
 * @returns {Object} The sorted JSON object.
 */
const SortJsonObjectAlphabeticallyExceptLast = (jsonData, specialKey) => {
    // Extract keys
    const keys = Object.keys(jsonData);
    const sortedKeys = keys.filter(key => key !== specialKey).sort();
  
    // Append special key
    if (keys.includes(specialKey)) {
      sortedKeys.push(specialKey);
    }
  
    // Reconstruct JSON object using sorted keys
    const sortedJsonObject = {};
    sortedKeys.forEach(key => {
      sortedJsonObject[key] = jsonData[key];
    });
    return sortedJsonObject;
};

/**
 * Converts a string date to a shorthand string representation.
 * @function GetShorthandDateFromString
 * @param {string} dateString - The string date to convert (in format 'YYYY-MM-DDTHH:MM:SS.SSSZ').
 * @returns {string} A shorthand string representation of the date ('YYYY-MM-DD').
 */
const GetShorthandDateFromString = (dateString) => {
  // Create a Date object from the input string
  const date = new Date(dateString);

  // Get the individual components of the date
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Add 1 to month since it's zero-based
  const day = date.getDate();

  // Format the date components into a shorthand string
  const shorthandDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
  return shorthandDate;
}

/**
 * Compares two objects, including arrays of objects, and finds differences.
 * @function FindObjectDifferenceWithArrays
 * @param {Object} obj1 - The first object.
 * @param {Object} obj2 - The second object.
 * @returns {Object} An object containing the differences found in both objects.
 */
const FindObjectDifferenceWithArrays = (obj1, obj2) => {
    const diff1 = {};
    const diff2 = {};

    // Find differences in obj1
    for (const key in obj1) {
        if (_.isArray(obj1[key])) {
            if (!_.isEqual(obj1[key], obj2[key])) {
                diff1[key] = obj1[key];
            }
        } else if (!_.isEqual(obj1[key], obj2[key])) {
            diff1[key] = obj1[key];
        }
    }

    // Find differences in obj2
    for (const key in obj2) {
        if (_.isArray(obj2[key])) {
            if (!_.isEqual(obj2[key], obj1[key])) {
                diff2[key] = obj2[key];
            }
            } else if (!_.isEqual(obj2[key], obj1[key])) {
            diff2[key] = obj2[key];
        }
    }

    return { diff1, diff2 };
}

/**
 * Format streaming platforms array of inputs into JSON
 * @function FormatStreamingPlatformsToJson
 * @param {{id: number; platform_type: string; inputString: string; placeholder: string;}[]}  listOfPlatformInputs - List of objects for each platform input.
 * @returns {Object} 
 * 
 */
const FormatStreamingPlatformsToJson = (listOfPlatformInputs) => {
    //Format streaming platforms json
    let jsonDataObject = {}
    let listOfNonBasicUrls = [];
    listOfPlatformInputs.forEach(platItem => {
        if (!IsEmpty(platItem.inputString)) {
            if (platItem.platform_type !== 'non_basic') {
                jsonDataObject[platItem.platform_type] = GetIdFromTrackUrl(platItem.inputString);
            }
            else {
                let nonBasicUrlObj = {};
                nonBasicUrlObj['url'] = platItem.inputString;
                listOfNonBasicUrls.push(nonBasicUrlObj);
            }
        }
        else {
            // Input is empty, check if it has a placeholder string saved
            if (!IsEmpty(platItem.placeholder)) {
                if (platItem.platform_type !== 'non_basic') {
                    jsonDataObject[platItem.platform_type] = GetIdFromTrackUrl(platItem.placeholder);
                }
                else {
                    let nonBasicUrlObj = {};
                    nonBasicUrlObj['url'] = platItem.placeholder;
                    listOfNonBasicUrls.push(nonBasicUrlObj);
                }
            }
        }
    })
    if (listOfNonBasicUrls.length > 0) {
        jsonDataObject.non_basic = listOfNonBasicUrls;
    }
    const jsonSubmission = {data: SortJsonObjectAlphabeticallyExceptLast(jsonDataObject, 'non_basic')};
    return jsonSubmission;
}

/**
 * Format streaming platforms JSON of inputs into array
 * @function FormatStreamingPlatformsToList
 * @param {Object}   trackPlatformData - List of objects for each platform input.
 * @returns {{id: number; platform_type: string; inputString: string; placeholder: string;}[]}  streamingPlatformsItems - List of objects for each platform input
 * 
 */
const FormatStreamingPlatformsToList = (trackPlatformData, strSetValuesToPlaceholder = false) => {
    // Set streaming platforms page variable
    let itemId = 1;
    let streamingPlatformsItems = [];
    if (trackPlatformData.hasOwnProperty('youtube') && !IsEmpty(trackPlatformData.youtube)) {
        let plaftormLink = {
            id: itemId++, 
            platform_type: 'youtube',
            inputString: '',
            placeholder: '',
        };
        if (strSetValuesToPlaceholder) {
            plaftormLink.placeholder = GetPlatformTrackBaseUrl(plaftormLink.platform_type) + trackPlatformData.youtube;
        } else {
            plaftormLink.inputString = GetPlatformTrackBaseUrl(plaftormLink.platform_type) + trackPlatformData.youtube;
        }
        streamingPlatformsItems.push(plaftormLink);
    } if (trackPlatformData.hasOwnProperty('youtube_music') && !IsEmpty(trackPlatformData.youtube_music)) {
        let plaftormLink = {
            id: itemId++, 
            platform_type: 'youtube_music',
            inputString: '',
            placeholder: '',
        };
        if (strSetValuesToPlaceholder) {
            plaftormLink.placeholder = GetPlatformTrackBaseUrl(plaftormLink.platform_type) + trackPlatformData.youtube_music;
        } else {
            plaftormLink.inputString = GetPlatformTrackBaseUrl(plaftormLink.platform_type) + trackPlatformData.youtube_music;
        }
        streamingPlatformsItems.push(plaftormLink);
    } if (trackPlatformData.hasOwnProperty('spotify') && !IsEmpty(trackPlatformData.spotify)) {
        let plaftormLink = {
            id: itemId++, 
            platform_type: 'spotify',
            inputString: '',
            placeholder: '',
        };
        if (strSetValuesToPlaceholder) {
            plaftormLink.placeholder = GetPlatformTrackBaseUrl(plaftormLink.platform_type) + trackPlatformData.spotify;
        } else {
            plaftormLink.inputString = GetPlatformTrackBaseUrl(plaftormLink.platform_type) + trackPlatformData.spotify;
        }
        streamingPlatformsItems.push(plaftormLink);
    } if (trackPlatformData.hasOwnProperty('shazam') && !IsEmpty(trackPlatformData.shazam)) {
        let plaftormLink = {
            id: itemId++, 
            platform_type: 'shazam',
            inputString: '',
            placeholder: '',
        };
        if (strSetValuesToPlaceholder) {
            plaftormLink.placeholder = GetPlatformTrackBaseUrl(plaftormLink.platform_type) + trackPlatformData.shazam;
        } else {
            plaftormLink.inputString = GetPlatformTrackBaseUrl(plaftormLink.platform_type) + trackPlatformData.shazam;
        }
        streamingPlatformsItems.push(plaftormLink);
    } if (trackPlatformData.hasOwnProperty('deezer') && !IsEmpty(trackPlatformData.deezer)) {
        let plaftormLink = {
            id: itemId++, 
            platform_type: 'deezer',
            inputString: '',
            placeholder: '',
        };
        if (strSetValuesToPlaceholder) {
            plaftormLink.placeholder = GetPlatformTrackBaseUrl(plaftormLink.platform_type) + trackPlatformData.deezer;
        } else {
            plaftormLink.inputString = GetPlatformTrackBaseUrl(plaftormLink.platform_type) + trackPlatformData.deezer;
        }
        streamingPlatformsItems.push(plaftormLink);
    } if (trackPlatformData.hasOwnProperty('apple_music') && !IsEmpty(trackPlatformData.apple_music)) {
        let plaftormLink = {
            id: itemId++, 
            platform_type: 'apple_music',
            inputString: '',
            placeholder: '',
        };
        if (strSetValuesToPlaceholder) {
            plaftormLink.placeholder = GetPlatformTrackBaseUrl(plaftormLink.platform_type) + trackPlatformData.apple_music;
        } else {
            plaftormLink.inputString = GetPlatformTrackBaseUrl(plaftormLink.platform_type) + trackPlatformData.apple_music;
        }
        streamingPlatformsItems.push(plaftormLink);
    } if (trackPlatformData.hasOwnProperty('amazon_music') && !IsEmpty(trackPlatformData.amazon_music)) {
        let plaftormLink = {
            id: itemId++, 
            platform_type: 'amazon_music',
            inputString: '',
            placeholder: '',
        };
        if (strSetValuesToPlaceholder) {
            plaftormLink.placeholder = GetPlatformTrackBaseUrl(plaftormLink.platform_type) + trackPlatformData.amazon_music;
        } else {
            plaftormLink.inputString = GetPlatformTrackBaseUrl(plaftormLink.platform_type) + trackPlatformData.amazon_music;
        }
        streamingPlatformsItems.push(plaftormLink);
    } if (trackPlatformData.hasOwnProperty('non_basic') && !IsEmpty(trackPlatformData.non_basic)) {
        for (let i = 0; i < trackPlatformData.non_basic.length; i++) {
            let plaftormLink = {
                id: itemId++, 
                platform_type: 'non_basic',
                inputString: '',
                placeholder: '',
            };
            if (strSetValuesToPlaceholder) {
                plaftormLink.placeholder = trackPlatformData.non_basic[i].url;
            } else {
                plaftormLink.inputString = trackPlatformData.non_basic[i].url;
            }
            streamingPlatformsItems.push(plaftormLink);
        }
    }
    return streamingPlatformsItems;
}

const AreObjectsEqual = (obj1, obj2) => {
    return _.isEqual(obj1, obj2);
}
export { 
    ParseClassName, 
    IsEmpty, 
    SortJsonObjectAlphabeticallyExceptLast,
    GetShorthandDateFromString,
    FindObjectDifferenceWithArrays,
    FormatStreamingPlatformsToJson,
    FormatStreamingPlatformsToList,
    AreObjectsEqual,
};