
/**
 * Format Episode Title Subheader, depending on whPerform all fetches to set up the webpage.
 * 
 * @async
 * @function MapTrackType
 * @param {string}  strShorthandTrackType - Shorthand of the FTO Track Types.
 * @returns {string} The full track type stirng.
 * 
 */
const MapTrackType = (strShorthandTrackType) => {
    switch (strShorthandTrackType) {
        case ('OP'):
            return 'Opening';
        case ('ED'):
            return 'Ending';
        case ('IM'):
            return 'Insert Song';
        case ('BGM'):
            return 'Background Music';
        case ('OST'):
            return 'Original SoundTrack';
        default:
            return '';
    };
}

const ConvertTrackTypeToValue = (strShorthandTrackType) => {
    switch (strShorthandTrackType) {
        case ('OP'):
            return 'songType_OP';
        case ('ED'):
            return 'songType_ED';
        case ('IM'):
            return 'songType_IM';
        case ('BGM'):
            return 'songType_BGM';
        case ('OST'):
            return 'songType_OST';
        default:
            return '';
    };
}
export { 
    MapTrackType, 
    ConvertTrackTypeToValue,
};