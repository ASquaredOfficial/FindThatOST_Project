import React, {useEffect, useState} from 'react';
import { useLocation, useParams } from "react-router-dom";
import './track.css';

import { Navbar, Footer, } from "../../components";

import default_img_square from '../../assets/default_image_square.svg'
import { FormatStreamingPlatformsToList, IsEmpty } from '../../utils/RegularUtils'
import { MapTrackType } from '../../utils/FTOApiUtils'
import { GetPlatformIcon, GetPlatformNameString, IsFandomImageUrl } from '../../utils/HyperlinkUtils';

const Track = () => {
    const { track_id } = useParams();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const spOccurrenceID = parseInt(searchParams.get('context_id'), 10) || -1;

    const [ ftoTrackInfo, setFTOTrackInfo ] = useState();
    const [ streamingPlatformsLinks, setStreamingPlatformsLinks ] = useState([]);

    useEffect(() => {
        document.title = `TrackID(${track_id}) and OccurrenceID(${spOccurrenceID})`;
        console.log(`Render-Episode (onMount): ${window.location.href}\nTrackID:${track_id}\nOccurrenceID:${spOccurrenceID}`)
        FetchPageData(track_id, spOccurrenceID);
    }, []);
    
    useEffect(() => {
        if (ftoTrackInfo !== undefined) {
            document.title = `Track '${ftoTrackInfo.track_name}' from series '${ftoTrackInfo.canonical_title}'`;
            
            // Convert the escaped string of streaming_platform_links to a JSON Object
            if (typeof (ftoTrackInfo.streaming_platform_links) == 'string' && !IsEmpty(ftoTrackInfo.streaming_platform_links)) {
                let trackInfo = ftoTrackInfo;
                trackInfo.streaming_platform_links = JSON.parse(ftoTrackInfo.streaming_platform_links);
                setFTOTrackInfo(trackInfo);

                // Set streaming platforms page variable
                let streamingPlatformsLinks = FormatStreamingPlatformsToList(trackInfo.streaming_platform_links.data);
                const updatedStreamingLinksArray = streamingPlatformsLinks.map(obj => {
                    // Destructure the object to keep existing keys and rename 'abc' to 'xyz'
                    const { inputString: link_url, ...rest } = obj;
                    
                    // Create a new object with updated key name and other existing keys
                    return { link_url, ...rest };
                });

                console.log("Track Info:", trackInfo.streaming_platform_links);
                console.log("Converted to New Streaming Links:", updatedStreamingLinksArray);
                setStreamingPlatformsLinks(updatedStreamingLinksArray);
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
        let apiUrl_fto = `/findthatost_api/getTrack/${Number(nTrackID)}`;
        if (nOccurrenceID !== -1) {
            apiUrl_fto += `/context_id/${Number(nOccurrenceID)}`
        }
        console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
        try {
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
        console.log("Value for poster Image:", passedImageUrl)
        if (!IsEmpty(passedImageUrl) && IsFandomImageUrl(passedImageUrl)) {
            return `${passedImageUrl}`;
        }
        else {
            return `${default_img_square}`;
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
                                    <img alt='Album Thumbnail' className='fto__page__track-main_content--album_thumbnail' src={ParsePosterImage_Square(ftoTrackInfo.fandom_image_link)}/>
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
                                            <p className='fto__page__track-main_content-text' style={{marginTop : '8px'}}><u>Scene Description</u></p>
                                            <p className='fto__page__track-main_content-text'>{ftoTrackInfo.scene_description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {(spOccurrenceID !== -1 ) && (
                                <div className='fto__page__track-main_content--edit_track_section'>
                                        <a className='fto__button__pink' href={'/submission/track_edit/' + track_id + '/context_id/' + spOccurrenceID}>Edit Track</a>
                                </div>
                            )}

                            <div>
                                {typeof (ftoTrackInfo.streaming_platform_links) == 'object' && (
                                <div className='fto__page__track--streaming_platform_section'>
                                    <h4>Listen On..</h4>
                                    <hr className='fto__page__track-horizontal_hr' />

                                    <div className='fto__page__track--streaming_platform_items'>
                                        {streamingPlatformsLinks.map((streamPlatformInfo, it) => {
                                            return (
                                                <a className='fto__page__track--streaming_platform_item' target="_blank" rel="noopener noreferrer" key={it} href={streamPlatformInfo.link_url}>
                                                    <img src={ GetPlatformIcon(streamPlatformInfo.platform_type) } alt='platform_icon'/>
                                                    <div className='fto__page__track--streaming_platform_item_right'> 
                                                        <p>{ GetPlatformNameString(streamPlatformInfo.platform_type) }</p>
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
                            
                            {(!IsEmpty(ftoTrackInfo.embedded_yt_video_id)) && (
                                <iframe  className='fto__page__track--embedded_yt_video'
                                    src={`https://www.youtube.com/embed/${ftoTrackInfo.embedded_yt_video_id}`}
                                    title="YouTube video player" frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                    referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />
                            )}
                        </div>
                    </div>
                )}
            </div>
		    <Footer />
        </div>
    )
}

export default Track