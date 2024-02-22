import React, {useEffect, useState} from 'react';
import { useParams } from "react-router-dom";
import './track.css';

import { Navbar, Footer, } from "../../components";

import default_img_square from '../../assets/default_image_square.svg'
import { IsEmpty } from '../../utils/RegularUtils'
import { MapTrackType } from '../../utils/FTOApiUtils'

import icon_platform_amazon_music from '../../assets/drawables/ic_platform_amazon_music.svg'
import icon_platform_apple from '../../assets/drawables/ic_platform_apple.svg'
import icon_platform_shazam from '../../assets/drawables/ic_platform_shazam.svg'
import icon_platform_soundcloud from '../../assets/drawables/ic_platform_soundcloud.svg'
import icon_platform_spotify from '../../assets/drawables/ic_platform_spotify.svg'
import icon_platform_youtube from '../../assets/drawables/ic_platform_youtube.svg'
import icon_platform_youtube_music from '../../assets/drawables/ic_platform_youtube_music.svg'
import icon_platform_non_basic from '../../assets/drawables/ic_platform_non_basic.svg'

const Track = () => {
    const { track_id } = useParams();

    const searchParams = new URLSearchParams(location.search);
    const spOccurrenceID = parseInt(searchParams.get('context_id'), 10) || -1;

    const [ ftoTrackInfo, setFTOTrackInfo ] = useState();
    const [ streamingPlatformsLInks, setStreamingPlatformsLInks ] = useState([]);

    useEffect(() => {
        console.log(`Render-Episode (onMount): ${location.href}\nTrackID:${track_id}\nOccurrenceID:${spOccurrenceID}`)
        FetchPageData(track_id, spOccurrenceID);
    }, []);
    
    useEffect(() => {
        if (ftoTrackInfo !== undefined) {
            // Convert the escaped string of streaming_platform_links to a JSON Object
            if (typeof (ftoTrackInfo.streaming_platform_links) == 'string' && !IsEmpty(ftoTrackInfo.streaming_platform_links)) {
                var trackInfo = ftoTrackInfo;
                trackInfo.streaming_platform_links = JSON.parse(ftoTrackInfo.streaming_platform_links);
                setFTOTrackInfo(trackInfo);

                // Set streaming platforms page variable
                var streamingPlatformsLInks = [];
                if (trackInfo.streaming_platform_links.data.hasOwnProperty('youtube') && !IsEmpty(trackInfo.streaming_platform_links.data.youtube)) {
                    let plaftormLink = {};
                    plaftormLink.platform_type = 'youtube';
                    plaftormLink.link_url = trackInfo.streaming_platform_links.data.youtube;
                    streamingPlatformsLInks.push(plaftormLink);
                } if (trackInfo.streaming_platform_links.data.hasOwnProperty('youtube_music') && !IsEmpty(trackInfo.streaming_platform_links.data.youtube_music)) {
                    let plaftormLink = {};
                    plaftormLink.platform_type = 'youtube_music';
                    plaftormLink.link_url = trackInfo.streaming_platform_links.data.youtube_music;
                    streamingPlatformsLInks.push(plaftormLink);
                } if (trackInfo.streaming_platform_links.data.hasOwnProperty('spotify') && !IsEmpty(trackInfo.streaming_platform_links.data.spotify)) {
                    let plaftormLink = {};
                    plaftormLink.platform_type = 'spotify';
                    plaftormLink.link_url = trackInfo.streaming_platform_links.data.spotify;
                    streamingPlatformsLInks.push(plaftormLink);
                } if (trackInfo.streaming_platform_links.data.hasOwnProperty('shazam') && !IsEmpty(trackInfo.streaming_platform_links.data.shazam)) {
                    let plaftormLink = {};
                    plaftormLink.platform_type = 'shazam';
                    plaftormLink.link_url = trackInfo.streaming_platform_links.data.shazam;
                    streamingPlatformsLInks.push(plaftormLink);
                } if (trackInfo.streaming_platform_links.data.hasOwnProperty('apple_music') && !IsEmpty(trackInfo.streaming_platform_links.data.apple_music)) {
                    let plaftormLink = {};
                    plaftormLink.platform_type = 'apple_music';
                    plaftormLink.link_url = trackInfo.streaming_platform_links.data.apple_music;
                    streamingPlatformsLInks.push(plaftormLink);
                } if (trackInfo.streaming_platform_links.data.hasOwnProperty('amazon_music') && !IsEmpty(trackInfo.streaming_platform_links.data.amazon_music)) {
                    let plaftormLink = {};
                    plaftormLink.platform_type = 'amazon_music';
                    plaftormLink.link_url = trackInfo.streaming_platform_links.data.amazon_music;
                    streamingPlatformsLInks.push(plaftormLink);
                } if (trackInfo.streaming_platform_links.data.hasOwnProperty('non_basic') && !IsEmpty(trackInfo.streaming_platform_links.data.non_basic)) {
                    for (var i = 0; i < trackInfo.streaming_platform_links.data.non_basic.length; i++) {
                        let plaftormLink = {};
                        plaftormLink.platform_type = 'non_basic';
                        plaftormLink.link_url = trackInfo.streaming_platform_links.data.non_basic[i].url;
                        streamingPlatformsLInks.push(plaftormLink);
                    }
                }
                console.log("Track Info:", trackInfo.streaming_platform_links);
                console.log("New Streaming Links:", streamingPlatformsLInks);
                setStreamingPlatformsLInks(streamingPlatformsLInks);
            }
        }
    }, [ftoTrackInfo]);

    /**
     * Perform all fetches to set up the webpage.
     * 
     * @async
     * @function FetchPageData
     * @param {number|string}  nTrackID - TrackID ID from url, corresponds to FindThatOST Track ID.
     * @param {number|string}  nOccurrenceID -  Context/Occurrence ID (search param) from url,for API query.
     * 
     */
    const FetchPageData = async (nTrackID, nOccurrenceID) => {
        try {
            // Fetch data from the backend
            const trackDataFromBackend = await FetchTrackDetails_FTO(nTrackID, nOccurrenceID);
            console.log('Anime Data from backend:', trackDataFromBackend[0]);
            setFTOTrackInfo(trackDataFromBackend[0]);
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    /**
     * Get anime details for anime with corresponding FTO Anime ID.
     * 
     * @async
     * @function FetchTrackDetails_FTO
     * @param {number|string}  nTrackID - Page/Anime ID from url, corresponds to FindThatOST Anime ID.
     * @param {number|string}  nOccurrenceID -  Context/Occurrence ID (search param) from url,for API query.
     * @returns {Promise<Array<JSON>>|undefined} The array of json objects (max length 1) containing anime details.
     * 
     */
    const FetchTrackDetails_FTO = async (nTrackID, nOccurrenceID) => {
        try {
            var apiUrl_fto = `/getTrack/${Number(nTrackID)}`;
            if (nOccurrenceID != -1) {
                apiUrl_fto += `/context_id/${Number(nOccurrenceID)}`
            }
            console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
            const response = await fetch(apiUrl_fto);
            if (response.status === 204) {
                // Page doesn't exist, redirect to page doesnt exist page
                console.log("Response status:", response.status)
                
            }
            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error('Error fetching data from backend.');
        }
    }
    
    const ParsePosterImage_Square = (passedImageUrl) => {
        if (!IsEmpty(passedImageUrl)) {
            return `${passedImageUrl}`;
        }
        else {
            return `${default_img_square}`;
        }
    }

    const GetPlatformIcon = (strPlatformType) => {
        if (strPlatformType == 'youtube') {
            return icon_platform_youtube;
        } else if (strPlatformType == 'youtube_music') {
            return icon_platform_youtube_music;
        } else if (strPlatformType == 'spotify') {
            return icon_platform_spotify;
        } else if (strPlatformType == 'shazam') {
            return icon_platform_shazam;
        } else if (strPlatformType == 'soundcloud') {
            return icon_platform_soundcloud;
        } else if (strPlatformType == 'apple_music') {
            return icon_platform_apple;
        } else if (strPlatformType == 'amazon_music') {
            return icon_platform_amazon_music;
        } else if (strPlatformType == 'non_basic') {
            return icon_platform_non_basic;
        } else {
            return icon_platform_non_basic;  
        }
    }

    const GetPlatformString = (strPlatformType) => {
        if (strPlatformType == 'youtube') {
            return 'Youtube';
        } else if (strPlatformType == 'youtube_music') {
            return 'Youtube Music';
        } else if (strPlatformType == 'spotify') {
            return 'Spotify';
        } else if (strPlatformType == 'shazam') {
            return 'Shazam';
        } else if (strPlatformType == 'soundcloud') {
            return 'Soundcloud';
        } else if (strPlatformType == 'apple_music') {
            return 'Apple Music';
        } else if (strPlatformType == 'amazon_music') {
            return 'Amazon Music';
        } else if (strPlatformType == 'non_basic') {
            return 'Unsupported Platform';
        } else {
            return icon_platform_non_basic;
        }
    }

    return (
        <div className='fto__page__track'>
            <div className='gradient__bg'>
                <Navbar />

                {ftoTrackInfo !== undefined && (
                    <div className='fto__page__track-content section__padding' style={{paddingBottom: 0}}>
                        <div className='fto__page__track-content_heading_section'>
                            <h1 className='fto__page__track-content_header_title gradient__text'>
                                {ftoTrackInfo.track_name}
                            </h1>
                            <hr className='fto__page__track-horizontal_hr' />
                            {spOccurrenceID !== -1 && (
                                <div className='fto__page__track-content_subheading_section'>
                                    <h4 className='fto__page__track-content_header_subtitle'><strong>{ftoTrackInfo.canonical_title}</strong></h4>
                                    <h4 className='subheader_color'>Episode {ftoTrackInfo.episode_no}</h4>
                                </div>
                            )}
                            <hr className='fto__page__track-horizontal_hr' />
                        </div>
                        <div className='fto__page__track-main_content'>
                            <div className='fto__page__track-main_content--track_details'>
                                <div className='fto__page__track-main_content--track_details-left'>
                                    <img alt='Album Image' className='fto__page__track-main_content--almbum_thumbnail' src={ParsePosterImage_Square(ftoTrackInfo.fandom_image_link)}/>
                                </div>
                                <div className='fto__page__track-main_content--track_details-right'>
                                    <h3>Track Information</h3>
                                    <p className='fto__page__track-main_content-text'><b>Artist(s): </b>{ftoTrackInfo.artist_name}</p>
                                    <p className='fto__page__track-main_content-text'><b>Label: </b>{ftoTrackInfo.label_name}</p>
                                    <p className='fto__page__track-main_content-text'><b>Release Date: </b>{ftoTrackInfo.release_date}</p>
                                    
                                    {spOccurrenceID !== -1 && (
                                        <div className='fto__page__track-main_content--track_details-context_info'>
                                            <br />
                                            <h3>More Track Context Information</h3>
                                            <p className='fto__page__track-main_content-text'><b>Episode No: </b>{ftoTrackInfo.episode_no}</p>
                                            <p className='fto__page__track-main_content-text'><b>Episode Title: </b>{ftoTrackInfo.episode_title}</p>
                                            <p className='fto__page__track-main_content-text'><b>Track Type: </b>{MapTrackType(ftoTrackInfo.track_type)}</p>
                                            <p className='fto__page__track-main_content-text'><u>Scene Description</u></p>
                                            <p className='fto__page__track-main_content-text'>{ftoTrackInfo.scene_description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className='fto__page__track-main_content--edit_track_section'>
                                <a className='fto__button__pink' href={'/submission/track_edit/'}>Edit Track</a>
                            </div>

                            <div>
                                {typeof (ftoTrackInfo.streaming_platform_links) == 'object' && (
                                <div className='fto__page__track--streaming_platform_section'>
                                    <h4>Listen On..</h4>
                                    <hr className='fto__page__track-horizontal_hr' />

                                    <div className='fto__page__track--streaming_platform_items'>
                                        {streamingPlatformsLInks.map((streamPlatformInfo, it) => {
                                            return (
                                                <a className='fto__page__track--streaming_platform_item' key={it} href={streamPlatformInfo.link_url}>
                                                    <img src={GetPlatformIcon(streamPlatformInfo.platform_type)}/>
                                                    <div className='fto__page__track--streaming_platform_item_right'> 
                                                        <p>{GetPlatformString(streamPlatformInfo.platform_type)}</p>
                                                        <h5 className='fto__page__track--streaming_platform_item-subheader subheader_color'>
                                                            {streamPlatformInfo.link_url}
                                                        </h5>
                                                    </div>
                                                </a>
                                            )}
                                        )}
                                    </div>
                                </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
		    <Footer />
        </div>
    )
}

export default Track