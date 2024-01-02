const ParseClassName = (str) => {
    return str.toLowerCase().replace(/\s/g, '_');
};

export { 
    ParseClassName, 
};