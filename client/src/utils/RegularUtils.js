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

export { 
    ParseClassName, 
    IsEmpty, 
    sortJsonObjectAlphabeticallyExceptLast,
};