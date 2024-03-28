import { IsEmpty } from "./RegularUtils";

import icon_platform_amazon_music from '../assets/drawables/ic_platform_amazon_music.svg';
import icon_platform_apple from '../assets/drawables/ic_platform_apple.svg';
import icon_platform_deezer from '../assets/drawables/ic_platform_deezer.svg';
import icon_platform_shazam from '../assets/drawables/ic_platform_shazam.svg';
import icon_platform_soundcloud from '../assets/drawables/ic_platform_soundcloud.svg';
import icon_platform_spotify from '../assets/drawables/ic_platform_spotify.svg';
import icon_platform_youtube from '../assets/drawables/ic_platform_youtube.svg';
import icon_platform_youtube_music from '../assets/drawables/ic_platform_youtube_music.svg';
import icon_platform_non_basic from '../assets/drawables/ic_platform_non_basic.svg';
import icon_platform_fandom_wikia from '../assets/drawables/ic_fandom_wikia.svg';

/**
 * Check if url is for platform 'youtube'.
 * @function IsYoutubeVideoUrl
 * @param {String}  youTubeURl - String supposedly a url for youtube platform.
 * @returns {Boolean} True/False if the string is for platform 'youtube'.
 * 
 */
const IsYoutubeVideoUrl = (youTubeURl) => {
    const pattern = /^(http(s)?:\/\/)?(?:www\.)?(?:youtube\.com|m\.youtube\.com|youtu.be|youtube-nocookie\.com)(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/;
    if (!IsEmpty(youTubeURl) && youTubeURl.match(pattern)) {
        return true;
    }
    else { 
        // Not Valid youtube URL
        return false;
    }
}

/**
 * Check if url is for platform 'youtube music'.
 * @function IsYoutubeMusicUrl
 * @param {String}  youTubeMusicURl - String supposedly a url for youtube music platform.
 * @returns {Boolean} True/False if the string is for platform 'youtube music'.
 * 
 */
const IsYoutubeMusicUrl = (youTubeMusicURl) => {
    const pattern = /^(http(s)?:\/\/)?music\.youtube\.com+\/.+/;
    if (!IsEmpty(youTubeMusicURl) && youTubeMusicURl.match(pattern)) {
        return true;
    }
    else { 
        // Not Valid youtube music URL
        return false;
    }
}

/**
 * Check if url is for platform 'spotify'.
 * @function IsSpotifyUrl
 * @param {String}  spotifyMuiscURl - String supposedly a url for spotify platform.
 * @returns {Boolean} True/False if the string is for platform 'spotify'.
 * 
 */
const IsSpotifyUrl = (spotifyMuiscURl) => {
    const pattern = /^(http(s)?:\/\/)?(?:open\.|play\.)?spotify\.com\/.+/;
    const pattern2 = String('^spotify:') + String('.+');
    if (!IsEmpty(spotifyMuiscURl)) {
        if (spotifyMuiscURl.match(pattern)) {
            return true;
        }
        else if (spotifyMuiscURl.match(pattern2)) {
            return true;
        }
        else { 
            return false;
        }
    }
    else { 
        // Not Valid spotify URL
        return false;
    }
}

/**
 * Check if url is for platform 'spotify'.
 * @function IsSpotifyTrackUrl
 * @param {String}  spotifyMuiscURl - String supposedly a url for spotify platform.
 * @returns {Boolean} True/False if the string is for platform 'spotify'.
 * 
 */
const IsSpotifyTrackUrl = (spotifyMuiscURl) => {
    const pattern = /^(http(s)?:\/\/)?(?:open\.|play\.)?spotify\.com\/(?:track\/).+/;
    const pattern2 = String('^spotify:track:') + String('.+');
    if (!IsEmpty(spotifyMuiscURl)) {
        if (spotifyMuiscURl.match(pattern)) {
            return true;
        }
        else if (spotifyMuiscURl.match(pattern2)) {
            return true;
        }
        else { 
            return false;
        }
    }
    else { 
        // Not Valid spotify URL
        return false;
    }
}

/**
 * Check if url is for platform 'shazam'.
 * @function IsShazamUrl
 * @param {String}  shazamMuiscURl - String supposedly a url for shazam platform.
 * @returns {Boolean} True/False if the string is for platform 'shazam'.
 * 
 */
const IsShazamUrl = (shazamMuiscURl) => {
    const pattern = /^(http(s)?:\/\/)?(www\.)?shazam\.com\/.+/;
    if (!IsEmpty(shazamMuiscURl) && shazamMuiscURl.match(pattern)) {
        return true;
    }
    else { 
        // Not Valid shazam URL
        return false;
    }
}

/**
 * Check if url is for platform 'shazam'.
 * @function IsShazamTrackUrl
 * @param {String}  shazamMuiscURl - String supposedly a url for shazam platform.
 * @returns {Boolean} True/False if the string is for platform 'shazam'.
 * 
 */
const IsShazamTrackUrl = (shazamMuiscURl) => {
    const pattern = /^(http(s)?:\/\/)?(www\.)?shazam\.com\/([A-z]{2}\/)?(?:track\/).+/;
    if (!IsEmpty(shazamMuiscURl) && shazamMuiscURl.match(pattern)) {
        return true;
    }
    else { 
        // Not Valid shazam URL
        return false;
    }
}

/**
 * Check if url is for platform 'apple music'.
 * @function IsAppleMusicUrl
 * @param {String}  appleMuiscURl - String supposedly a url for apple music platform.
 * @returns {Boolean} True/False if the string is for platform 'apple music'.
 * 
 */
const IsAppleMusicUrl = (appleMuiscURl) => {
    const pattern = /^(http(s)?:\/\/)?music\.apple\.com\/.+/;
    if (!IsEmpty(appleMuiscURl) && appleMuiscURl.match(pattern)) {
        return true;
    }
    else { 
        // Not Valid apple music URL
        return false;
    }
}

/**
 * Check if url is for platform 'apple music'.
 * @function IsAppleMusicTrackUrl
 * @param {String}  appleMuiscURl - String supposedly a url for apple music platform.
 * @returns {Boolean} True/False if the string is for platform 'apple music'.
 * 
 */
const IsAppleMusicTrackUrl = (appleMuiscURl) => {
    const pattern = /^(http(s)?:\/\/)?music\.apple\.com\/(?:[A-z]{2}\/)*(?:song\/(?:[^#&?\n/]*\/)*([0-9]+)|album\/(?:[^#&?\n/]*\/)*([0-9]+)\?i=([0-9]+))+.*/;
    if (!IsEmpty(appleMuiscURl) && appleMuiscURl.match(pattern)) {
        return true;
    }
    else { 
        // Not Valid apple music URL
        return false;
    }
}

/**
 * Check if url is for platform 'amazon music'.
 * @function IsAmazonMusicUrl
 * @param {String}  amazonMuiscURl - String supposedly a url for amazon music platform.
 * @returns {Boolean} True/False if the string is for platform 'amazon music'.
 * 
 */
const IsAmazonMusicUrl = (amazonMuiscURl) => {
    const pattern = /^(http(s)?:\/\/)?music\.amazon\.(?:com|co\.uk|de|fr|es|it|co\.jp|ca|com\.au|nl|com\.mx|com\.br|in)+\/.+/;
    if (!IsEmpty(amazonMuiscURl) && amazonMuiscURl.match(pattern)) {
        return true;
    }
    else { 
        // Not Valid amazon music URL
        return false;
    }
}

/**
 * Check if url is for platform 'amazon music'.
 * @function IsAmazonMusicTrackUrl
 * @param {String}  amazonMuiscURl - String supposedly a url for amazon music platform.
 * @returns {Boolean} True/False if the string is for platform 'amazon music'.
 * 
 */
const IsAmazonMusicTrackUrl = (amazonMuiscURl) => {
    const regexPattern = /^(http(s)?:\/\/)?(music\.amazon\.(?:com|co\.uk|de|fr|es|it|co\.jp|ca|com\.au|nl|com\.mx|com\.br|in)+\/albums\/([A-z0-9]+)\?(?:[^#&?\n/]+&)*trackAsin=([A-z0-9]+))(?:&[^#&?\n/]*)*/
    if (!IsEmpty(amazonMuiscURl) && amazonMuiscURl.match(regexPattern)) {
        return true;
    }
    else { 
        // Not Valid amazon music URL
        return false;
    }
}

/**
 * Check if url is for platform 'deezer'.
 * @function IsDeezerTrackUrl
 * @param {String}  deezerTrackUrl - String supposedly a url for deezer platform.
 * @returns {Boolean} True/False if the string is for platform 'deezer'.
 * 
 */
const IsDeezerTrackUrl = (deezerTrackUrl) => {
    const pattern = /^(http(s)?:\/\/)?(www\.)?deezer\.com\/([A-Za-z]{2}\/)?track\/\d+([?#].*)?$/;

    if (deezerTrackUrl && deezerTrackUrl.match(pattern)) {
        return true;
    } else {
        // Not a valid Deezer track URL
        return false;
    }
};

/**
 * Get track/video ID from 'youtube' url.
 * @function GetIdFromYoutubeUrl
 * @param {String}  youTubeURl - String supposedly a url for youtube platform.
 * @returns {String|null} ID of URL or null.
 * 
 */
const GetIdFromYoutubeUrl = (youTubeUrl) => {
    /*
        Possibile Youtube urls.
        http://www.youtube.com/watch?v=WK0YhfKqdaI
        http://www.youtube.com/embed/WK0YhfKqdaI
        http://www.youtube.com/e/WK0YhfKqdaI
        http://www.youtube.com/v/WK0YhfKqdaI
        http://www.youtube-nocookie.com/v/WK0YhfKqdaI?version=3&hl=en_US&rel=0
        http://www.youtube.com/watch?feature=player_embedded&v=WK0YhfKqdaI
        http://youtu.be/WK0YhfKqdaI
    */
    const pattern = /(?:watch\?v=|\/videos\/|embed\/|youtu\.be\/|\/v\/|\/e\/|watch\?v%3D|watch\?app=desktop&v=|watch\?feature=player_embedded&v=|%2Fvideos%2F|embed%\u200C\u200B2F|youtu\.be%2F|%2Fv%2F)([^#&?\n]*)/;
    const match = youTubeUrl.match(pattern);
    if (match) {
        return match[1];
    }
    return null;
}

/**
 * Get track/video ID from 'spotify' url.
 * @function GetIdFromSpotifyUrl
 * @param {String}  spotifyUrl - String supposedly a url for spotify platform.
 * @returns {String|null} ID of URL or null.
 * 
 */
const GetIdFromSpotifyUrl = (spotifyUrl) => {
    /*
        Possibile Spotify urls.
        https://open.spotify.com/track/0hHc2igYYlSUyZdByauJmB
        https://open.spotify.com/track/0hHc2igYYlSUyZdByauJmB?si=d1cc6ead5ec04755&nd=1
        spotify:track:5fNEdhH8m0OVnTUXjzLY8N
        spotify:track:4uLU6hMCjMI75M1A2tKUQC
    */
    const pattern = /(?:spotify\.com\/?track\/)([^#&?\n]*)/;
    const match = spotifyUrl.match(pattern);
    if (match) {
        return match[1];
    }

    const pattern2 = /(?:spotify:track:)([^#&?\n:]*)/;
    const match2 = spotifyUrl.match(pattern2);
    if (match2) {
        return match2[1];
    }
    return null;
}

/**
 * Get track/video ID from 'shazam' url.
 * @function GetIdFromShazamUrl
 * @param {String}  shazamUrl - String supposedly a url for shazam platform.
 * @returns {String|null} ID of URL or null.
 * 
 */
const GetIdFromShazamUrl = (shazamUrl) => {
    /*
        Possibile Shazam sample.
        https://www.shazam.com/gb/track/323892435/you-say-run
        https://www.shazam.com/track/5933774/dont-speak
    */
    const pattern = /(?:shazam\.com\/?(?:[A-z]{2}\/)track\/|track\/)([^#&?\n/]*)/;
    const match = shazamUrl.match(pattern);
    if (match) {
        return match[1];
    }
    return null;
}

/**
 * Get track/video ID from 'apple music' url.
 * @function GetIdFromAppleMusicUrl
 * @param {String}  appleMusicUrl - String supposedly a url for apple music platform.
 * @returns {String|null} ID of URL or null.
 * 
 */
const GetIdFromAppleMusicUrl = (appleMusicUrl) => {
    /*
        Possibile Apple Music Track sample.
        --- https://music.apple.com/{?country_code}/song/{?album_name}/{song_id}
        https://music.apple.com/song/1475094797
        https://music.apple.com/us/song/1475094797
        https://music.apple.com/us/song/you-say-run/1475094797
        https://music.apple.com/us/song/you-say-run/1475094797?l=fr

        --- https://music.apple.com/{?country_code}/album/{?album_name}/{album_id}?i={song_id}
        https://music.apple.com/album/you-say-run/1127313836?i=1127314187
        https://music.apple.com/gb/album/you-say-run/1127313836?i=1127314187
    */
    const typePattern = /(?<=music\.apple\.com\/\?[A-z]{2}\/|)(album|song)/;
    const typeMatch = appleMusicUrl.match(typePattern);
    if (typeMatch) {
        const type = typeMatch[0];
        let trackIdPattern;
        
        // Check if the URL type is song
        if (type === 'song') {
            // Pattern to extract the track ID from a song URL
            trackIdPattern = /(?<=music\.apple\.com\/\?[A-z]{2}\/song\/|song\/)(?:[^#&?\n/]*\/)*([0-9]+)/;
        } else if (type === 'album') {
            // Pattern to extract the track ID from an album URL
            trackIdPattern = /(?<=music\.apple\.com\/\)(?:[A-z]{2}\/)album\/|album\/)(?:[^#&?\n/]*\/)*(?:[0-9]+)(?:\?i=)([0-9]+)/;
        }
        // Match the track ID using the appropriate pattern
        const trackIdMatch = appleMusicUrl.match(trackIdPattern);

        if (trackIdMatch) {
            let trackId = trackIdMatch[1];
            
            // Additional processing for album URLs
            if (type === 'album' && trackId.includes("/")) {
                const splitTrackId = trackId.split("/");
                trackId = splitTrackId[splitTrackId.length - 1];
            }
            return trackId;
        }
    }
    return null;
}

/**
 * Get track/video ID from 'amazon music' url.
 * @function GetIdFromAmazonMusicUrl
 * @param {String}  amazonMusicUrl - String supposedly a url for amazon music platform.
 * @returns {String|null} ID of URL or null.
 * 
 */
const GetIdFromAmazonMusicUrl = (amazonMusicUrl) => {
    /*
        Possibile Amazon Music Track sample.
        --- https://music.amazon.com/albums/{?album_name}?track{song_id}
        https://music.amazon.com/albums/B07VZ3WBQ1?trackAsin=B07W164Q6Q
        https://music.amazon.co.uk/albums/B07VZ3WBQ1?trackAsin=B07W164Q6Q
        https://music.amazon.co.uk/albums/B07VZ3WBQ1?marketplaceId=A1F83G8C2ARO7P&musicTerritory=GB&ref=dm_sh_gfX8eWoXZnwISA5BLTIYQj0Gb&trackAsin=B07W164Q6Q
    */
    //Get Track ASIN
    const trackAsinPattern = /(?:\?|&)trackAsin=([A-Za-z0-9]+)/;
    const trackAsinMatch = amazonMusicUrl.match(trackAsinPattern);
    if (trackAsinMatch) {
        // Get Album ID
        const albumIDPattern = /\/albums\/([A-Za-z0-9]+)\?/;
        const albumIDMatch = amazonMusicUrl.match(albumIDPattern);
        return String(albumIDMatch[1] + "?trackAsin=" + trackAsinMatch[1]);
    }
    return null;
}

/**
 * Get track/video ID from 'deezer' url.
 * @function GetIdFromDeezerUrl
 * @param {String}  amazonMusicUrl - String supposedly a url for deezer platform.
 * @returns {String|null} ID of URL or null.
 * 
 */
const GetIdFromDeezerUrl = (deezerUrl) => {
    /*
        Possibile Deezer Track sample.
        --- https://www.deezer.com/track/{song_id}
        https://www.deezer.com/track/2413426495
        https://www.deezer.com/us/track/2413426495
        https://www.deezer.com/us/track/2413426495?host=0&utm_campaign=clipboard-generic&utm_source=user_sharing&utm_content=track-2413426495&deferredFl=1d
        https://www.deezer.com/us/track/1059340662
        https://www.deezer.com/en/track/2413426495?host=0&utm_campaign=clipboard-generic&utm_source=user_sharing&utm_content=track-2413426495&deferredFl=1
    */
    //Get Track ASIN
    const pattern = /deezer.com\/(?:[A-Za-z]{2}\/)?track\/([0-9]+)/;
    const match = deezerUrl.match(pattern);
    if (match) {
        return match[1];
    }
    return null;
}

/**
 * Get platform for url input and return platform string if url is for platform 'amazon music'.
 * @function GetUrlPlatform
 * @param {String}  linkUrl - Url of platform.
 * @returns {String} Streaming Platform of URL.
 * 
 */
const GetUrlPlatform = (linkUrl) => {
    if (IsYoutubeVideoUrl(linkUrl)) {
        return 'youtube';
    }
    else if (IsYoutubeMusicUrl(linkUrl)) {
        return 'youtube_music';
    }
    else if (IsSpotifyTrackUrl(linkUrl)) {
        return 'spotify';
    }
    else if (IsShazamTrackUrl(linkUrl)) {
        return 'shazam';
    }
    else if (IsDeezerTrackUrl(linkUrl)) {
        return 'deezer';
    }
    else if (IsAppleMusicTrackUrl(linkUrl)) {
        return 'apple_music';
    }
    else if (IsAmazonMusicTrackUrl(linkUrl)) {
        return 'amazon_music';
    }
    else {
        return 'non_basic';
    }
}

/**
 * Get svg path for streaming platform icon.
 * @function GetPlatformIcon
 * @param {String}  strPlatform - Streaming Platform.
 * @param {String}  [strExpectedPlatform=null] - Expected streaming platform.
 * @returns {String} Path of svg file for streaming platform.
 * 
 */
const GetPlatformIcon = (strPlatform, strExpectedPlatform = null) => {
    if (strExpectedPlatform !== null && strExpectedPlatform !== strPlatform) {
        // If expecting a specific platform and platform non-match, return non_basic icon
        return icon_platform_non_basic;
    }
    else {
        if (strPlatform === 'youtube') {
            return icon_platform_youtube;
        } 
        else if (strPlatform === 'youtube_music') {
            return icon_platform_youtube_music;
        } 
        else if (strPlatform === 'soundcloud') {
            return icon_platform_soundcloud;
        } 
        else if (strPlatform === 'spotify') {
            return icon_platform_spotify;
        } 
        else if (strPlatform === 'shazam') {
            return icon_platform_shazam;
        } 
        else if (strPlatform === 'apple_music') {
            return icon_platform_apple;
        } 
        else if (strPlatform === 'amazon_music') {
            return icon_platform_amazon_music;
        } 
        else if (strPlatform === 'deezer') {
            return icon_platform_deezer;
        } 
        else if (strPlatform === 'non_basic') {
            return icon_platform_non_basic;
        } 
        else {
            return icon_platform_non_basic;
        }
    }
}

/**
 * Get Track base Url of streaming platform.
 * @function GetPlatformTrackBaseUrl
 * @param {String}  strPlatform - Streaming Platform.
 * @returns {String} Track base Url of streaming platform.
 * 
 */
const GetPlatformTrackBaseUrl = (strPlatform) => {
    switch (strPlatform) {
        case 'youtube':
            return "https://youtube.com/watch?v=";
        case 'youtube_music':
            return "https://music.youtube.com/watch?v=";
        case 'spotify':
            return "https://open.spotify.com/track/";
        case 'shazam':
            return "https://www.shazam.com/track/";
        case 'deezer':
            return "https://www.deezer.com/track/";
        case 'apple_music':
            return "https://music.apple.com/song/";
        case 'amazon_music':
            return "https://music.amazon.com/albums/";
        case 'non_basic':
        default:
            return "";
    }
}

/**
 * Get Name of platform based on platform type.
 * @function GetPlatformNameString
 * @param {String}  strPlatformType - Streaming Platform Type.
 * @returns {String} Name of Platform.
 * 
 */
const GetPlatformNameString = (strPlatformType) => {
    if (strPlatformType === 'youtube') {
        return 'Youtube';
    } else if (strPlatformType === 'youtube_music') {
        return 'Youtube Music';
    } else if (strPlatformType === 'spotify') {
        return 'Spotify';
    } else if (strPlatformType === 'shazam') {
        return 'Shazam';
    } else if (strPlatformType === 'soundcloud') {
        return 'Soundcloud';
    } else if (strPlatformType === 'deezer') {
        return 'Deezer';
    } else if (strPlatformType === 'apple_music') {
        return 'Apple Music';
    } else if (strPlatformType === 'amazon_music') {
        return 'Amazon Music';
    } else if (strPlatformType === 'non_basic') {
        return 'Unknown Platform';
    } else {
        return 'Unknown Platform';
    }
}

/**
 * Get Track ID of the url.
 * @function GetIdFromTrackUrl
 * @param {String}  linkUrl - Url of platform.
 * @param {String}  [strPlatform=""] - Streaming Platform.
 * @returns {String|null} Track id of url or null if failed.
 * 
 */
const GetIdFromTrackUrl = (linkUrl, strPlatform = '') => {
    strPlatform = (strPlatform !== '') ? strPlatform : GetUrlPlatform(linkUrl);
    if ((strPlatform === "youtube")) {
        return GetIdFromYoutubeUrl(linkUrl);
    }
    else if (strPlatform === "youtube_music") {
        return GetIdFromYoutubeUrl(linkUrl);
    }
    else if (strPlatform === "spotify") {
        return GetIdFromSpotifyUrl(linkUrl);
    }
    else if (strPlatform === "shazam") {
        return GetIdFromShazamUrl(linkUrl);
    }
    else if (strPlatform === "apple_music") {
        return GetIdFromAppleMusicUrl(linkUrl);
    }
    else if (strPlatform === "amazon_music") {
        return GetIdFromAmazonMusicUrl(linkUrl);
    }
    else if (strPlatform === "deezer") {
        return GetIdFromDeezerUrl(linkUrl);
    }
    else {
        return null;
    }
}

/**
 * Generate a url for the platform specified using track ID.
 * @function GetIdFromTrackUrl
 * @param {String}  trackID - Track ID for url.
 * @param {String}  strPlatform - Streaming Platform.
 * @returns {String|null} Track id of url or null if failed.
 * 
 */
const GeneratePlatformUrlFromID = (trackID, strPlatform) => {
    switch (strPlatform) {
        case 'youtube':
            return String(GetPlatformTrackBaseUrl(strPlatform) + trackID);
        case 'youtube_music':
            return String(GetPlatformTrackBaseUrl(strPlatform) + trackID);
        case 'spotify':
            return String(GetPlatformTrackBaseUrl(strPlatform) + trackID);
        case 'shazam':
            return String(GetPlatformTrackBaseUrl(strPlatform) + trackID);
        case 'apple_music':
            return String(GetPlatformTrackBaseUrl(strPlatform) + trackID);
        case 'amazon_music':
            return String(GetPlatformTrackBaseUrl(strPlatform) + trackID);
        case 'deezer':
            return String(GetPlatformTrackBaseUrl(strPlatform) + trackID);
        case 'non_basic':
        default:
            return "";
    }
}

/**
 * Get Track ID of the url.
 * @function StandardiseTrackUrl
 * @param {String}  linkUrl - Url of platform.
 * @param {String}  [strPlatform=""] - Streaming Platform.
 * @returns {String|null} Track id of url or null if failed.
 * 
 */
const StandardiseTrackUrl = (linkUrl, strPlatform = '') => {
    strPlatform = (strPlatform !== '') ? strPlatform : GetUrlPlatform(linkUrl);

    if (strPlatform === 'non_basic') {
        return linkUrl;
    }
    else {
        let strTrackID = GetIdFromTrackUrl(linkUrl, strPlatform);
        if (strTrackID === null) {
            return linkUrl;
        }
        else {
            let strPlatformTrackBaseUrl = GetPlatformTrackBaseUrl(strPlatform);
            if (IsEmpty(strPlatform)) {
                return linkUrl;
            }
            else {
                return String(strPlatformTrackBaseUrl + strTrackID);
            }
        }
    }
}

/**
 * Check if url is valid image fandom wikia link.
 * @function IsFandomImageUrl
 * @param {String}  fandomImageUrl - String supposedly a url for fandom wikia image.
 * @expectedFormat "https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png"
 * @returns {Boolean} True/False if the string is valid fandom wikia image link.
 * 
 */
const IsFandomImageUrl = (fandomImageUrl) => {
    const pattern = /^(http(s)?:\/\/)?(static\.wikia\.nocookie\.net\/)+([0-9A-z_-].+\/images)+(\/[0-9A-z]+)(\/[0-9A-z]+)\/(?:[0-9A-z-_]*)\.(?:png|jpg).*/;
    if (!IsEmpty(fandomImageUrl) && fandomImageUrl.match(pattern)) {
        return true;
    }
    else { 
        // Not Valid amazon music URL
        return false;
    }
}

/**
 * Check if url is valid image fandom wikia link.
 * @function IsFandomCommunityWebsiteUrl
 * @param {String}  fandomWebpageUrl - String supposedly a url for fandom wikia image.
 * @exampleFormat "https://community.fandom.com/wiki/Help:URL"
 *                "https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrackg"
 * @returns {Boolean} True/False if the string is valid fandom wikia webpage link.
 * 
 */
const IsFandomCommunityWebsiteUrl = (fandomWebpageUrl) => {
    const pattern = /^(http(s)?:\/\/)?([0-9A-z-_].+\.fandom\.com\/wiki)+(\/.+)/;
    if (!IsEmpty(fandomWebpageUrl) && fandomWebpageUrl.match(pattern)) {
        return true;
    }
    else { 
        // Not Valid amazon music URL
        return false;
    }
}

/**
 * Get Fandom Wikia Icon for the appropriate icon for a given Fandom Wikia link type and URL.c
 * @function GetFandomWikiaIcon
 * @param {String}  wikiaLinkType - the appropriate icon for a given Fandom Wikia link type and URL.
 * @param {String} [linkUrl=null] - The URL to be evaluated. Optional, defaults to null.
 * @returns {String} The icon corresponding to the provided Fandom Wikia link type and URL.
 * 
 */
const GetFandomWikiaIcon = (wikiaLinkType, linkUrl = null) => {
    if (wikiaLinkType === 'fandom_img' && IsFandomImageUrl(linkUrl)) {
        return icon_platform_fandom_wikia;
    } 
    else if (wikiaLinkType === 'fandom_web' && IsFandomCommunityWebsiteUrl(linkUrl)) {
        return icon_platform_fandom_wikia;
    } 
    else {
        return icon_platform_non_basic;
    }
}

/**
 * Extract fandom wikia image url from fandomImage url.
 * @function GetFandomImageUrlFromFullUrl
 * @param {String}  fandomImageUrl - String supposedly a url for youtube platform.
 * @returns {String|null} Extracted URL or null.
 * 
 */
const GetFandomImageUrlFromFullUrl = (fandomImageUrl) => {
    /*
        Possibile Fandom Image urls.
        https://static.wikia.nocookie.net/jujutsu-kaisen/images/2/29/SPECIAL_Cover.png/revision/latest/scale-to-width-down/1000?cb=20230806050444
        https://static.wikia.nocookie.net/bokunoheroacademia/images/e/e4/Season_4_Poster_3.png/revision/latest?cb=20191230035840
        https://static.wikia.nocookie.net/zombie-100/images/9/9e/Anime_Key_Visual_1.jpg
        https://static.wikia.nocookie.net/zombie-100/images/9/9e/Anime_Key_Visual_1.jpg/revision/latest/scale-to-width-down/1000?cb=20230624103603
        https://static.wikia.nocookie.net/psychopass/images/6/61/Psycho-Pass_Providence.png/revision/latest?cb=20220814101204
    */
   
    const pattern = /^(http(s)?:\/\/)?(static\.wikia\.nocookie\.net\/)+([0-9A-z_-].+\/images)+(\/[0-9A-z]+)(\/[0-9A-z]+)\/(?:[0-9A-z-_]*)\.(?:png|jpg)/
    const match = fandomImageUrl.match(pattern);
    if (match) {
        // Double check the extracted link is still valid
        if (IsFandomImageUrl(match[0])) {
            return match[0];
        }
    }
    return null;
}

export { 
    IsYoutubeVideoUrl, 
    IsYoutubeMusicUrl,
    IsSpotifyUrl,
    IsSpotifyTrackUrl,
    IsShazamUrl,
    IsShazamTrackUrl, 
    IsDeezerTrackUrl,
    IsAppleMusicUrl,
    IsAppleMusicTrackUrl,
    IsAmazonMusicUrl, 
    IsAmazonMusicTrackUrl,

    GetIdFromYoutubeUrl,
    GetIdFromSpotifyUrl,
    GetIdFromTrackUrl,

    GetUrlPlatform,
    GetPlatformIcon,
    GetPlatformNameString,
    StandardiseTrackUrl,
    GetPlatformTrackBaseUrl,
    GeneratePlatformUrlFromID,

    IsFandomImageUrl,
    IsFandomCommunityWebsiteUrl,
    GetFandomImageUrlFromFullUrl,
    GetFandomWikiaIcon,
};