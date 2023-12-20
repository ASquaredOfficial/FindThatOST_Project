/**
 * Formats a date string provided my MAL API to a localized date representation.
 * If not null, returns suitable string.
 *
 * @param {string} dateString - The input date string in ISO format.
 * @returns {string} - The formatted date string (e.g., "Apr 3, 2016" or '-').
 */
const FormatDateToMidDateString = ( dateString ) => {
    if (dateString != null) {
        const formattedDate = new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
        return formattedDate;
    }
    else {
        return '-';
    }
};

/**
 * Adds a translated title as subtitle to the page based on anime titles.
 *
 * @param {Array} animetitles - An array of anime title objects.
 * @returns {JSX.Element|null} - JSX element representing the subtitle or null if conditions are not met.
 */
const AddSubtitle = ( animetitles ) => {
    var animeTitle_default = '';
    var animeTitle_english = '';

    animetitles.map((animeTitleObject) => {
        if (animeTitleObject.type == "Default") {
            animeTitle_default = animeTitleObject.title;
        }
        else if (animeTitleObject.type == "English") {
            animeTitle_english = animeTitleObject.title;
        }
    })

    if (animeTitle_default != animeTitle_english 
        && animeTitle_english != '' && animeTitle_english != null) {
            return <p className='fto__page__search-content_english_date'>{animeTitle_english}</p>;
    }
}

/**
 * Retrieves the episode count based on air status, MyAnimeList episode count, and MyAnimeList anime ID.
 *
 * @param {string} airStatus - The air status of the anime.
 * @param {number|null} malEpCount - The episode count from MyAnimeList (null if unknown).
 * @param {number} malAnimeID - The MyAnimeList anime ID (null if unknown).
 * @returns {string} - The episode count or a dash ('-') based on air status and availability of data.
 */
const GetEpisodeCount = ( airStatus, malEpCount, malAnimeID) => {
    if (airStatus == "Currently Airing") { 
        //GetAniListAnime(malAnimeID)   
        return '-';
    }
    else if (airStatus == "Not yet aired") {
        return '-';
    }
    else {
        return malEpCount;
    }
}


export { FormatDateToMidDateString, AddSubtitle, GetEpisodeCount };