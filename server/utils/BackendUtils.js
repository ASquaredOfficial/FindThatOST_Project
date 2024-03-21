/**
 * Checks if a value is empty or null.
 * @function IsEmpty
 * @param {*} value - The value to be checked.
 * @returns {boolean} - True if the value is empty or null, false otherwise.
 */
function IsEmpty(value) {
    return (value == null || (typeof value === "string" && value.trim().length === 0));
}

/**
 * Constructs and returns an object containing relevant SQL error properties, removing 
 * all the extra unnecessary sql function paths fluff.
 * @function GetSqlErrorObj
 * @param {mysql.MysqlError} sqlError - The SQL error object to extract properties from.
 * @returns {object} An object containing relevant SQL error properties, 
 *                  including 'code', 'errno', 'sqlMessage', 'sqlState', 'index', and 'sql'.
 */
function GetSqlErrorObj(sqlError, strFileLineNumber = '') {
    let sqlErrorObject = {}
    if (!IsEmpty(strFileLineNumber)) {
        sqlErrorObject['filename'] = strFileLineNumber;
    }
    if (sqlError.hasOwnProperty('code')) {
        sqlErrorObject['code'] = sqlError.code;
    }
    if (sqlError.hasOwnProperty('errno')) {
        sqlErrorObject['errno'] = sqlError.errno;
    }
    if (sqlError.hasOwnProperty('sqlMessage')) {
        sqlErrorObject['sqlMessage'] = sqlError.sqlMessage;
    }
    if (sqlError.hasOwnProperty('sqlState')) {
        sqlErrorObject['sqlState'] = sqlError.sqlState;
    }
    if (sqlError.hasOwnProperty('index')) {
        sqlErrorObject['index'] = sqlError.index;
    }
    if (sqlError.hasOwnProperty('sql')) {
        sqlErrorObject['sql'] = sqlError.sql;
    }
    return sqlErrorObject;
}

/**
 * Performs XOR operation on two boolean values.
 * @function MyXOR
 * @param {boolean} a - The first boolean operand.
 * @param {boolean} b - The second boolean operand.
 * @returns {boolean} The result of the XOR operation between the two operands.
 */
function MyXOR(a, b) {
    return ( a || b ) && !( a && b );
}

/**
 * Computes the XNOR (exclusive NOR) of two boolean values.
 * Returns true if both operands have the same boolean value (both true or both false), and false otherwise.
 * @function MyXNOR
 * @param {boolean} a - The first boolean operand.
 * @param {boolean} b - The second boolean operand.
 * @returns {boolean} The XNOR result of the two operands.
 */
function MyXNOR(a, b) {
    return !MyXOR(a, b);
}

/**
 * Retrieves the line number from where the LineNumber function is called in the source code.
 * Note: This function relies on Error.stack to determine the caller's frame, which may vary across
 * browsers and browser versions.
 * @function LineNumber
 * @returns {number} The line number of the caller's frame in the source code.
 */
function LineNumber() {
    let e = new Error();
    if (!e.stack) try {
        // IE requires the Error to actually be throw or else the Error's 'stack'
        // property is undefined.
        throw e;
    } catch (e) {
        if (!e.stack) {
            return 0; // IE < 10, likely
        }
    }
    let stack = e.stack.toString().split(/\r\n|\n/);
    // We want our caller's frame. It's index into |stack| depends on the
    // browser and browser version, so we need to search for the second frame:
    let frameRE = /:(\d+):(?:\d+)[^\d]*$/;
    do {
        let frame = stack.shift();
    } while (!frameRE.exec(frame) && stack.length);

    return frameRE.exec(stack.shift())[1];
}

module.exports = {
    IsEmpty, 
    GetSqlErrorObj,
    MyXOR,
    MyXNOR,
    LineNumber,
};