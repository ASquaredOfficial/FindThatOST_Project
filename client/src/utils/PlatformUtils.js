import { IsEmpty } from "./RegularUtils";

import icon_platform_amazon_music from '../assets/drawables/ic_platform_amazon_music.svg';
import icon_platform_apple from '../assets/drawables/ic_platform_apple.svg';
import icon_platform_shazam from '../assets/drawables/ic_platform_shazam.svg';
import icon_platform_soundcloud from '../assets/drawables/ic_platform_soundcloud.svg';
import icon_platform_spotify from '../assets/drawables/ic_platform_spotify.svg';
import icon_platform_youtube from '../assets/drawables/ic_platform_youtube.svg';
import icon_platform_youtube_music from '../assets/drawables/ic_platform_youtube_music.svg';
import icon_platform_non_basic from '../assets/drawables/ic_platform_non_basic.svg';

/**
 * Check if url is for platform 'youtube'.
 * 
 * @async
 * @function IsYoutubeVideoUrl
 * @param {String}  youTubeURl - String supposedly a url for youtube platform.
 * @returns {Boolean} True/False if the string is for platform 'youtube'.
 * 
 */
const IsYoutubeVideoUrl = (youTubeURl) => {
    const pattern = "^(?:http:\/\/|https:\/\/)*" +
            "?(?:www\.|)" +
            "(?:youtube\.com|m\.youtube\.com|youtu\.|youtube-nocookie\.com).*" +
            "(?:\/|%3D|v=|vi=)([0-9A-z-_]{11})" +
            "(?:[%#?&]|$).*";
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
 * 
 * @async
 * @function IsYoutubeMusicUrl
 * @param {String}  youTubeMusicURl - String supposedly a url for youtube music platform.
 * @returns {Boolean} True/False if the string is for platform 'youtube music'.
 * 
 */
const IsYoutubeMusicUrl = (youTubeMusicURl) => {
    const pattern = "^(http(s)?:\/\/)?" +
            "music\.youtube\.com+" +
            "\/.+";
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
 * 
 * @async
 * @function IsSpotifyUrl
 * @param {String}  spotifyMuiscURl - String supposedly a url for spotify platform.
 * @returns {Boolean} True/False if the string is for platform 'spotify'.
 * 
 */
const IsSpotifyUrl = (spotifyMuiscURl) => {
    const pattern ="^(http(s)?:\/\/)?" +
                    "(?:open\.|play\.)?" +
                    "spotify\.com" +
                    "\/.+";
    const pattern2 =  "^spotify:" + ".+";
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
 * 
 * @async
 * @function IsSpotifyTrackUrl
 * @param {String}  spotifyMuiscURl - String supposedly a url for spotify platform.
 * @returns {Boolean} True/False if the string is for platform 'spotify'.
 * 
 */
const IsSpotifyTrackUrl = (spotifyMuiscURl) => {
    const pattern ="^(?:http:\/\/|https:\/\/)*" +
                    "(?:open\.|play\.)" +
                    "?spotify\.com\/" +
                    "(?:track\/).+";
    const pattern2 = "^spotify:track:" + ".+";
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
 * 
 * @async
 * @function IsShazamUrl
 * @param {String}  shazamMuiscURl - String supposedly a url for shazam platform.
 * @returns {Boolean} True/False if the string is for platform 'shazam'.
 * 
 */
const IsShazamUrl = (shazamMuiscURl) => {
    const pattern = "^(http(s)?:\/\/)?" +
                    "(www\.)?" +
                    "(?:open\.|play\.)?" +
                    "shazam\.com" +
                    "\/.+";
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
 * 
 * @async
 * @function IsShazamTrackUrl
 * @param {String}  shazamMuiscURl - String supposedly a url for shazam platform.
 * @returns {Boolean} True/False if the string is for platform 'shazam'.
 * 
 */
const IsShazamTrackUrl = (shazamMuiscURl) => {
    const pattern = "^(?:http:\/\/|https:\/\/)*" +
                    "(www\.)" +
                    "?(?:open\.|play\.)" +
                    "?shazam\.com\/" +
                    "([A-z]{2}\/)*" +
                    "(?:track\/).+";
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
 * 
 * @async
 * @function IsAppleMusicUrl
 * @param {String}  appleMuiscURl - String supposedly a url for apple music platform.
 * @returns {Boolean} True/False if the string is for platform 'apple music'.
 * 
 */
const IsAppleMusicUrl = (appleMuiscURl) => {
    const pattern = "^(http(s)?:\/\/)" +
                    "music\.apple\.(?:com|co\.uk|)+" +
                    "\/.+";
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
 * 
 * @async
 * @function IsAppleMusicTrackUrl
 * @param {String}  appleMuiscURl - String supposedly a url for apple music platform.
 * @returns {Boolean} True/False if the string is for platform 'apple music'.
 * 
 */
const IsAppleMusicTrackUrl = (appleMuiscURl) => {
    const pattern = "(?:http:\/\/|https:\/\/)*" +
                    "music.apple.com\/" +
                    "(?:[A-z]{2}\/)*" +
                    "(?:song\/(?:[^#&?\n/]*\/)*([0-9]+)" +
                    "|album\/(?:[^#&?\n\/]*\/)*([0-9]+)\?i=([0-9]+))+" +
                    ".*";      // Pattern: Get for id header
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
 * 
 * @async
 * @function IsAmazonMusicUrl
 * @param {String}  amazonMuiscURl - String supposedly a url for amazon music platform.
 * @returns {Boolean} True/False if the string is for platform 'amazon music'.
 * 
 */
const IsAmazonMusicUrl = (amazonMuiscURl) => {
    const pattern = "^(http(s)?:\/\/)?" +
                    "music\.amazon\.(?:com|co\.uk|)+" +
                    "/.+";
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
 * 
 * @async
 * @function IsAmazonMusicTrackUrl
 * @param {String}  amazonMuiscURl - String supposedly a url for amazon music platform.
 * @returns {Boolean} True/False if the string is for platform 'amazon music'.
 * 
 */
const IsAmazonMusicTrackUrl = (amazonMuiscURl) => {
    const pattern = "^(http(s)?:\/\/)?" +
                    "music\.amazon\.(?:com|co\.uk|)+" +
                    "/.+";
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
 * 
 * @async
 * @function IsAmazonMusicTrackUrl
 * @param {String}  amazonMuiscURl - String supposedly a url for amazon music platform.
 * @returns {Boolean} True/False if the string is for platform 'amazon music'.
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

const GetPlatformIcon = (strPlatform) => {
    if (strPlatform == 'youtube') {
        return icon_platform_youtube;
    } 
    else if (strPlatform == 'youtube_music') {
        return icon_platform_youtube_music;
    } 
    else if (strPlatform == 'spotify') {
        return icon_platform_spotify;
    } 
    else if (strPlatform == 'non_basic') {
        return icon_platform_non_basic;
    } 
    else {
        return icon_platform_non_basic;
    }
}

/*
public static enmAltStreamingPlatform getUrlPlatform(String linkUrl)  {
    if (isYoutubeVideoUrl(linkUrl)) {
        return YOUTUBE;
    }
    else if (isYoutubeMusicUrl(linkUrl)) {
        return YOUTUBE_MUSIC;
    }
    else if (isSpotifyTrackUrl(linkUrl)) {
        return SPOTIFY;
    }
    else if (isShazamTrackUrl(linkUrl)) {
        return SHAZAM;
    }
    else if (isAppleMusicTrackUrl(linkUrl)) {
        return APPLE_MUSIC;
    }
    else if (isAmazonMusicTrackUrl(linkUrl)) {
        return AMAZON_MUSIC;
    }
    else {
        return NON_BASIC;
    }
}
 */
export { 
    IsYoutubeVideoUrl, 
    IsYoutubeMusicUrl,
    IsSpotifyUrl,
    IsSpotifyTrackUrl,
    IsShazamUrl,
    IsShazamTrackUrl, 
    IsAppleMusicUrl,
    IsAppleMusicTrackUrl,
    IsAmazonMusicUrl, 
    IsAmazonMusicTrackUrl,
    GetUrlPlatform,
    GetPlatformIcon,
};