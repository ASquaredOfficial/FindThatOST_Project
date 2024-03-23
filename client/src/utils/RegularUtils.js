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
    return (value == null || (typeof value === "string" && value.trim().length === 0));
}

/**
 * Sorts a JSON object based on keys in alphabetical order, excluding a special key to be placed last.
 * @function sortJsonObjectAlphabeticallyExceptLast
 * @param {Object} jsonData - The JSON object to be sorted.
 * @param {string} specialKey - The key to be placed last in the sorted JSON object.
 * @returns {Object} The sorted JSON object.
 */
const sortJsonObjectAlphabeticallyExceptLast = (jsonData, specialKey) => {
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

export { 
    ParseClassName, 
    IsEmpty, 
    sortJsonObjectAlphabeticallyExceptLast,
    GetShorthandDateFromString,
};