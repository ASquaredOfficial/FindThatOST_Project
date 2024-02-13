const ParseClassName = (str) => {
    return str.toLowerCase().replace(/\s/g, '_');
};

const IsEmpty = (value) => {
    return (value == null || (typeof value === "string" && value.trim().length === 0));
}

export { 
    ParseClassName, 
    IsEmpty, 
};