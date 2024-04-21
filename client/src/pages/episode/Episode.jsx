import React, {useEffect, useState} from 'react';
import { useParams } from "react-router-dom";
import './episode.css';

import { Navbar, Footer, Comments} from "../../components";
import { ParsePosterImage_Horzontal } from "../../utils/MalApiUtils"
import { IsEmpty } from "../../utils/RegularUtils"

import { FaPlayCircle } from "react-icons/fa";
import { toast } from 'react-toastify';

const Episode = () => {
    const { anime_id, episode_no } = useParams();
    
    const [ ftoAnimeInfo, setFTOAnimeInfo ] = useState();
    const [ malAnimeInfo, setMALAnimeInfo ] = useState();
    const [ ftoEpisodeInfo, setFTOEpisodeInfo ] = useState();
    const [ malEpisodeInfo, setMALEpisodeInfo ] = useState();
    const [ malEpisodeImageInfo, setMALEpisodeImageInfo ] = useState();
    const [ kitsuEpisodeInfo, setKitsuEpisodeInfo ] = useState();
    const [ pageEpisodeInfo, setPageEpisodeInfo ] = useState({});
    const [ pageEpisodeThumbnail, setPageEpisodeInfoThumbail ] = useState();
    const [ episodeListOfTracks, setEpisodeListOfTracks ] = useState();

    const [ viewSpotifyPlayModal, setViewSpotifyPlayModal ] = useState(false);
    const [ currentSpotifyTrackId, setCurrentSpotifyId ] = useState()

    useEffect(() => {
        document.title = `Episode ${episode_no} Tracks | AnimeID(${anime_id})`;
        console.log(`Render-Episode (onMount): ${window.location.href}\nAnimeID:${anime_id}\nEpisodeNo:${episode_no}`)
        FetchPageData(anime_id, episode_no);
    }, []);

    useEffect(() => {
        if (malAnimeInfo !== undefined) {
            if (ftoAnimeInfo !== undefined) {
                FetchUpdateAnimeData_FTO(anime_id, malAnimeInfo);
            }
        }
    }, [malAnimeInfo]);

    useEffect(() => {
        if (malAnimeInfo !== undefined || malEpisodeInfo !== undefined || kitsuEpisodeInfo !== undefined) {
            let episodeInfo = {};

            if (malEpisodeInfo !== undefined) {
                if (!episodeInfo.hasOwnProperty('title_en_us') || IsEmpty(episodeInfo.title_en_us)) {
                    episodeInfo.title_en_us = malEpisodeInfo.title;
                }
                if (!episodeInfo.hasOwnProperty('title_en_jp') || IsEmpty(episodeInfo.title_en_jp)) {
                    episodeInfo.title_en_jp = malEpisodeInfo.title_romanji;
                }
                if (!episodeInfo.hasOwnProperty('title_ja_jp') || IsEmpty(episodeInfo.title_ja_jp)) {
                    episodeInfo.title_ja_jp = malEpisodeInfo.title_japanese;
                }
                if (!episodeInfo.hasOwnProperty('synopsis') || IsEmpty(episodeInfo.synopsis)) {
                    episodeInfo.synopsis = malEpisodeInfo.synopsis;
                }
                if (!episodeInfo.hasOwnProperty('aired') || IsEmpty(episodeInfo.aired)) {
                    episodeInfo.aired = String(malEpisodeInfo.aired).substring(0, 10);
                }
                if (malEpisodeImageInfo !== undefined) {
                    episodeInfo.image_url = malEpisodeImageInfo;
                }
            }

            if (kitsuEpisodeInfo !== undefined) {
                // Use kitsu episode details as back up
                if (!episodeInfo.hasOwnProperty('title_en_us') || IsEmpty(episodeInfo.title_en_us)) {
                    episodeInfo.title_en_us = kitsuEpisodeInfo.titles.en_us;
                }
                if (!episodeInfo.hasOwnProperty('title_en_jp') || IsEmpty(episodeInfo.title_en_jp)) {
                    episodeInfo.title_en_jp = kitsuEpisodeInfo.titles.en_jp;
                }
                if (!episodeInfo.hasOwnProperty('title_ja_jp') || IsEmpty(episodeInfo.title_ja_jp)) {
                    episodeInfo.title_ja_jp = kitsuEpisodeInfo.titles.ja_jp;
                }
                if (!episodeInfo.hasOwnProperty('synopsis') || IsEmpty(episodeInfo.synopsis)) {
                    episodeInfo.synopsis = kitsuEpisodeInfo.synopsis;
                }
                if (!episodeInfo.hasOwnProperty('aired') || IsEmpty(episodeInfo.aired)) {
                    episodeInfo.aired = kitsuEpisodeInfo.airdate;
                }
                if (!episodeInfo.hasOwnProperty('image_url') || IsEmpty(episodeInfo.image_url)) {
                    episodeInfo.image_url = kitsuEpisodeInfo.thumbnail.original;
                }
            }

            if (malAnimeInfo !== undefined) {
                if (!episodeInfo.hasOwnProperty('image_url') || IsEmpty(episodeInfo.image_url)) {
                    episodeInfo.image_url = (!IsEmpty(malAnimeInfo.images.jpg.image_url)) ? malAnimeInfo.images.jpg.image_url : null
                }
            }
            
            setPageEpisodeInfo({...pageEpisodeInfo, ...episodeInfo});
        }
        
    }, [malAnimeInfo, malEpisodeInfo, malEpisodeImageInfo, kitsuEpisodeInfo]);

    useEffect(() => {
        if (pageEpisodeInfo !== undefined && pageEpisodeInfo.hasOwnProperty('image_url') && !IsEmpty(pageEpisodeInfo.image_url)) {
            setPageEpisodeInfoThumbail(pageEpisodeInfo.image_url);
        }
    }, [pageEpisodeInfo])

    /**
     * Get anime details for anime with corresponding FTO Anime ID.
     * 
     * @async
     * @function FetchAnimeData_FTO
     * @param {number|string}  ftoAnimeID - FindThatOST Anime ID.
     * @returns {Promise<Array<JSON>>|undefined} The array of json objects (max length 1) containing anime details.
     * 
     */
    const FetchAnimeData_FTO = async (ftoAnimeID) => {
        let apiUrl_fto = `/findthatost_api/anime/${Number(ftoAnimeID)}`
        console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
        try {
            const response = await fetch(apiUrl_fto); // Replace with your actual backend endpoint
            const data = await response.json();
            return data;
        } catch (error) {
            toast('An internal error has occurred with the FindThatOST server. Please try again later.');
            throw new Error('Error fetching data from backend');
        }
    }

    /**
     * Get episode details for anime episode with corresponding FTO Anime ID and episode number.
     * 
     * @async
     * @function FetchAnimeData_FTO
     * @param {number|string}  ftoAnimeID - FindThatOST Anime ID.
     * @param {number|string}  nEpisodeNo - Anime Episode Number.
     * @returns {Promise<Array<JSON>>|undefined} The array of json objects (max length 1) containing anime details.
     * 
     */
    const FetchEpisodeData_FTO = async (ftoAnimeID, nEpisodeNo) => {
        let apiUrl_fto = `/findthatost_api/anime/${Number(ftoAnimeID)}/episode_number/${Number(nEpisodeNo)}`
        console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
        try {
            const response = await fetch(apiUrl_fto); // Replace with your actual backend endpoint
            const data = await response.json();
            return data;
        } catch (error) {
            toast('An internal error has occurred with the FindThatOST server. Please try again later.');
            throw new Error('Error fetching data from backend');
        }
    }
    
    /**
     * Get anime details from MyAnimeList API using MAL ID mapped from the FTOAnimeID from backend response.
     * 
     * @async
     * @function FetchFullAnimeData_MAL
     * @param {Array<JSON>}  malAnimeID - The MyAnimeList Anime ID.
     * @returns {Promise<Array<JSON>>|undefined} - JSON Object containing anime info from MAL API.
     * 
     */
    const FetchFullAnimeData_MAL = async (malAnimeID) => {
        let apiUrl_mal = `https://api.jikan.moe/v4/anime/${malAnimeID}/full`;
        console.debug(`Fetch data from External API, url: '${apiUrl_mal}'`);
        try {
            const response = await fetch(apiUrl_mal);
            const externalData = await response.json();
            return externalData;
        } catch (error) {
            throw new Error('Error fetching data from external API (MyAnimeList)');
        }
    }

    /**
     * Update anime data in FTO database (mainly canonical title and parent anime).
     * 
     * @async
     * @function FetchUpdateAnimeData_FTO
     * @param {number|string}  ftoID - FindThatOST Anime ID.
     * @param {JSON}  malAnimeDetails - MyAnimeList JSON Object, containing anime details.
     * 
     */
    const FetchUpdateAnimeData_FTO = async (ftoID, malAnimeDetails) => {
        // Get Prequel Anime in FTO DB (if present)
        let ftoPrequelAnimeID = 0;
        let arrMalAnimeRelations = malAnimeDetails.relations;
        for (let it = 0; it <  Object.keys(arrMalAnimeRelations).length; it++) {
            let animeRelation = arrMalAnimeRelations[it]
            let animeRelationEntry = animeRelation.entry;
            let animeRelationType = animeRelation.relation;
            if (animeRelationType === 'Prequel') {
                let prequelEntries = animeRelationEntry;

                let nLowestMalID = malAnimeDetails.mal_id;
                prequelEntries.map(entry => {
                    if (entry.mal_id < nLowestMalID) {
                        nLowestMalID = entry.mal_id;
                    }
                    return entry;
                });
                
                if (nLowestMalID !== malAnimeDetails.mal_id) {
                    let apiUrl_fto = `/findthatost_api/anime/mal_mapping/${nLowestMalID}`;
                    console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);

                    const response = await fetch(apiUrl_fto);
                    const responseJson = await response.json();
                    if (response.status === 200) {
                        ftoPrequelAnimeID = responseJson[0].anime_id;
                    }
                    else if (response.status === 204) {
                        // No MAL to FTO mapping found for ${nLowestMalID}
                        break;
                    }
                    else {
                        toast('An internal error has occurred in FindThatOST Server. Please try again later.');
                        console.error(`Error updating data in backend.\nFetch url: ${apiUrl_fto}\nResponse Status: ${response.status}\nResponse: ${responseJson}`);
                    }
                }
                break;
            }
        }

        let bUpdateParentAnimeID = (ftoAnimeInfo.parent_anime_id == null || ftoAnimeInfo.parent_anime_id === 0) && ftoPrequelAnimeID !== 0;
        let bUpdateCanonicalTitle = (ftoAnimeInfo.canonical_title === '');
        let ftoCanonicalTitle = (!bUpdateCanonicalTitle) ? '' : malAnimeDetails.titles[0].title;;
        
        // Createn update query
        let apiUrl_fto = '';
        if (bUpdateCanonicalTitle && bUpdateParentAnimeID) {
            apiUrl_fto =`/findthatost_api/anime/${ftoID}/title/${ftoCanonicalTitle}/parent_id/${encodeURIComponent(ftoPrequelAnimeID)}`;
        } else if (bUpdateCanonicalTitle) {
            apiUrl_fto = `/findthatost_api/anime/${ftoID}/title/${encodeURIComponent(ftoCanonicalTitle)}`;
        } else if (bUpdateParentAnimeID) {
            apiUrl_fto = `/findthatost_api/anime/${ftoID}/parent_id/${ftoPrequelAnimeID}`;
        }

        // Perform Fetch Query to update anime
        if (apiUrl_fto !== '') {
            console.debug(`Fetch put data from the mal api to backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
            try {
                const response = await fetch(apiUrl_fto);
                await response.json(); // Wait for response before contining
            }
            catch (error) {
                toast('An internal error has occurred in FindThatOST Server. Please try again later.');
                console.error(`Error updating data in backend.\nFetch url: ${apiUrl_fto}\nResponse: ${error}`);
            }
        }
    }
    
    /**
     * Get anime episode details from MyAnimeList API using MAL ID mapped from the FTOAnimeID from backend response.
     * 
     * @async
     * @function FetchEpisodeData_MAL
     * @param {Array<JSON>}  malAnimeID - The MyAnimeList Anime ID.
     * @param {Array<JSON>}  malEpisodeID - The MyAnimeList Episode ID.
     * @returns {Promise<Array<JSON>>|undefined} - JSON Object containing anime info from MAL API.
     * 
     */
    const FetchEpisodeData_MAL = async (malAnimeID, malEpisodeID) => {
        //Finished aring, check if mal has individual episode details
        let apiUrl_mal = `https://api.jikan.moe/v4/anime/${malAnimeID}/episodes/${malEpisodeID}`;
        console.debug(`Fetch Episode data from External API, MAL url: '${apiUrl_mal}'`);
        try {
            const response_mal = await fetch(apiUrl_mal);
            const responseData_mal = await response_mal.json();
            return responseData_mal;
        }
        catch (error) {
            throw new Error('Error fetching episode data from external API (MyAnimeList)');
        }
    }

    /**
     * Get anime details from MyAnimeList API using MAL ID mapped from the FTOAnimeID from backend response.
     * 
     * @async
     * @function FetchEpisodeImageData_MAL
     * @param {Array<JSON>}  malAnimeID - The MyAnimeList Anime ID.
     * @param {Array<JSON>}  malEpisodeID - The MyAnimeList Episode ID.
     * @returns {Promise<string>|undefined} - JSON Object containing anime info from MAL API.
     * 
     */
    const FetchEpisodeImageData_MAL = async (malAnimeID, malEpisodeID) => {
        try {
            //Finished aring, check if mal has individual episode details
            let bEpisodeNotFound = true;
            let nLastPageNumber = 0;
            let nPageNumber = 1;
            while (bEpisodeNotFound) {
                let apiUrl_mal = `https://api.jikan.moe/v4/anime/${malAnimeID}/videos/episodes?page=${nPageNumber}`;
                console.debug(`Fetch Episode Image data from External API, MAL url: '${apiUrl_mal}'`);
                const response_mal = await fetch(apiUrl_mal);
                const responseData_mal = await response_mal.json();

                nLastPageNumber = (nLastPageNumber === 0) ? responseData_mal.pagination.last_visible_page : nLastPageNumber;
                if (responseData_mal.data.length > 0) {
                    let nMalID_first = responseData_mal.data[0].mal_id;
                    let nMalID_last = responseData_mal.data[responseData_mal.data.length - 1].mal_id;
                    if (malEpisodeID <= nMalID_first && malEpisodeID >= nMalID_last) {
                        for (let i = 0; i < responseData_mal.data.length; i++) {
                            if (responseData_mal.data[i].mal_id === malEpisodeID) {
                                return responseData_mal.data[i].images.jpg.image_url;
                            }
                        }
                        return; // episode number not found in expected range. MAL does not have episode details
                    }
                    else if (malEpisodeID > nMalID_first) {
                        // Go to previous page (if possible)
                        if (nPageNumber !== 1) {
                            if (nMalID_first + 40 >= malEpisodeID) {
                                nPageNumber--;
                            }
                            else {
                                nLastPageNumber = nPageNumber;
                                nPageNumber = Math.ceil((1 + nPageNumber)/2);
                            }
                        }
                        else {
                            break;
                        }
                    }
                    else if (malEpisodeID < nMalID_last) {
                        // Go to a later page (if possible)
                        if (nMalID_last - 40 < malEpisodeID && responseData_mal.pagination.has_next_page === true) {
                            nPageNumber++;
                        }
                        else {
                            nPageNumber = Math.ceil((nPageNumber + nLastPageNumber)/2);

                        }
                    }
                }
                else {
                    return; // Http request returned empty json
                }
            }
        }
        catch (error) {
            console.error(error)
            throw new Error('Error fetching episode image data from external API (MyAnimeList)');
        }
    }

    /**
     * Get anime episode details from Kitsu API using Kitsu ID.
     * 
     * @async
     * @function FetchEpisodeData_KITSU
     * @param {Array<JSON>}  kitsuEpisodeID - The Kitsu Episode ID.
     * @returns {Promise<Array<JSON>>|undefined} - JSON Object containing anime info from MAL API.
     * 
     */
    const FetchEpisodeData_KITSU = async (kitsuEpisodeID) => {
        try {
            if (kitsuEpisodeID !== -1 || (kitsuEpisodeID == null)) {
                let apiUrl_kitsu = `https://kitsu.io/api/edge/episodes/${kitsuEpisodeID}`;
                console.debug(`Fetch Episode data from External API, Kitsu url: '${apiUrl_kitsu}'`);
                const response_kitsu = await fetch(apiUrl_kitsu);
                const responseData_kitsu = await response_kitsu.json();
                return responseData_kitsu;
            }
            return [];
        }
        catch (error) {
            console.error("My error:", error);
            throw new Error(`Error fetching episode data from external API (Kitsu).'`);
        }
    }

    /**
     * Get list of tracks for episode with corresponding FTO Episode ID.
     * 
     * @async
     * @function FetchEpisodeListOfTracks_FTO
     * @param {number|string}  nEpisodeID - FindThatOST Episode ID.
     * @returns {Promise<Array<JSON>>|undefined} The array of json objects containing track details.
     * 
     */
    const FetchEpisodeListOfTracks_FTO = async (nEpisodeID, sortQuery = '') => {
        try {
            let apiUrl_fto = `/findthatost_api/episode/${Number(nEpisodeID)}/all_tracks`
            if (!IsEmpty(sortQuery)) {
                apiUrl_fto += `/sort_by/${sortQuery}`;
            }
            console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
            const response = await fetch(apiUrl_fto); // Replace with your actual backend endpoint
            const data = await response.json();
            return data;
        } catch (error) {
            toast('An internal error has occurred with the FindThatOST server. Please try again later.');
            throw new Error('Error fetching data from backend');
        }
    }

    /**
     * Perform all fetches to set up the webpage.
     * 
     * @async
     * @function FetchPageData
     * @param {number|string}  pageId - Page/Anime ID from url, corresponds to FindThatOST Anime ID.
     * @param {number|string}  episodeNum - Episode No from url, corresponds to anime's epispode number.
     * 
     */
    const FetchPageData = async (pageId, episodeNum) => {
        try {
            // Fetch data from the backend
            const animeDataFromBackend = await FetchAnimeData_FTO(pageId);
            const episodeDataFromBackend = await FetchEpisodeData_FTO(pageId, episodeNum);
            console.debug('Anime Data from backend:', animeDataFromBackend);
            console.debug('Episode Data from backend:', episodeDataFromBackend);
            setFTOAnimeInfo(animeDataFromBackend[0]);
            setFTOEpisodeInfo(episodeDataFromBackend[0]);
            document.title = `Episode ${episode_no} Tracks | ${animeDataFromBackend[0].canonical_title}`;

            // Use data from the backend to make the second fetch to the external API
            let malID = animeDataFromBackend[0].mal_id;
            const dataFromExternalAPI_MAL = await FetchFullAnimeData_MAL(malID);
            console.debug('Anime Data from external MAL API:', dataFromExternalAPI_MAL);
            setMALAnimeInfo(dataFromExternalAPI_MAL.data);

            if (!IsEmpty(episodeDataFromBackend[0].malEpisodeID) || !IsEmpty(episodeDataFromBackend[0].kitsu_episode_id)) {
                if (!IsEmpty(episodeDataFromBackend[0].malEpisodeID)) {    
                    let malEpisodeID = episodeDataFromBackend[0].mal_episode_id;
                    const episodeData_malAPI = await FetchEpisodeData_MAL(malID, malEpisodeID);
                    const episodeImageData_malAPI = await FetchEpisodeImageData_MAL(malID, malEpisodeID);
                    console.debug('Episode Data from MAL API:', episodeData_malAPI);
                    console.debug('Episode Image Data from MAL API:', episodeImageData_malAPI);
                    setMALEpisodeInfo(episodeData_malAPI.data);
                    setMALEpisodeImageInfo(episodeImageData_malAPI);
                }
                if (!IsEmpty(episodeDataFromBackend[0].kitsu_episode_id)) {
                    const episodeData_kitsuAPI = await FetchEpisodeData_KITSU( episodeDataFromBackend[0].kitsu_episode_id);
                    console.debug('Episode Data from external KITSU API:', episodeData_kitsuAPI);
                    setKitsuEpisodeInfo(episodeData_kitsuAPI.data.attributes);
                }
            }

            //Get all tracks for this anime
            const episodeListOfTracksFromBackend = await FetchEpisodeListOfTracks_FTO(episodeDataFromBackend[0].episode_id, 'track_type');
            console.debug('List of tracks for episode:', episodeListOfTracksFromBackend);
            setEpisodeListOfTracks(episodeListOfTracksFromBackend);
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    /**
     * Format Episode Title Subheader, depending on whPerform all fetches to set up the webpage.
     * 
     * @async
     * @function FormatEpisodeSubHeader
     * @param {string}  title_romanji - Episode title in japanese using latin roman characters.
     * @param {string}  title_japanese - Episode title in japanese using japanese characters.
     * @returns {string|undefined} The formatted title stirng.
     * 
     */
    const FormatEpisodeSubHeader = (title_romanji, title_japanese) => {
        if (IsEmpty(title_japanese) && IsEmpty(title_romanji)) {
            return
        }
        else if (IsEmpty(title_japanese)) {
            return title_romanji;
        }
        else {
            return `${title_romanji} (${title_japanese})`;
        }
    }

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
                return 'Opening'
            case ('ED'):
                return 'Ending'
            case ('IM'):
                return 'Insert Song'
            case ('BGM'):
                return 'Background Music'
            case ('OST'):
                return 'Original SoundTrack'
            default:
                return ''
        }
    }

    return (
        <div className='fto__page__episode'>
            {viewSpotifyPlayModal && (
                <div className='fto_modal'>
                    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                        <button className="fto__button__pink" style={{ position: 'absolute', top: '1px', left: '10px', zIndex: '1'}} 
                            onClick={() => {
                                setViewSpotifyPlayModal(false);
                                setCurrentSpotifyId();
                            }}>
                            Close
                        </button>
                        <iframe style={{ borderRadius: "12px", margin: '0', border: '0' }}
                            title="Spotify Track Player"
                            src={`https://open.spotify.com/embed/track/${currentSpotifyTrackId}?utm_source=generator&theme=0`} 
                            width="300" height="400" allowFullScreen 
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" loading="lazy" />
                    </div>
                </div>
            )}

            <div className='gradient__bg'>
                <Navbar />

                {!IsEmpty(pageEpisodeThumbnail) && (
                    <div className='fto__page__episode-content section__padding' style={{paddingBottom: 0}}>
                        
                        <div className='fto__page__episode-content_heading_section'>
                            <h1 className='fto__page__episode-content_header_title gradient__text'>
                                Episode {episode_no}
                            </h1>
                            <h4 className='fto__page__episode-content_header_subtitle'>
                                <a href={'/anime/' + anime_id}>
                                    <strong>{malAnimeInfo.titles[0].title}</strong>
                                </a>
                            </h4>
                        </div>
                        <hr className='fto__page__episode-horizontal_hr' />
                        
                        <div className='fto__page__episode-main_content'>
                            <div className='fto__page__episode-main_content--episode_details'>
                                <div className='fto__page__episode-main_content--episode_details-left'>
                                    <img alt='Episode Thumbnail' className='fto__page__episode-main_content--episode_details-thumbnail' 
                                        src={ParsePosterImage_Horzontal(pageEpisodeThumbnail)} />
                                </div>
                                
                                {!IsEmpty(pageEpisodeInfo) && (
                                <div className='fto__page__episode-main_content--episode_details-right'>
                                    
                                    {(!IsEmpty(pageEpisodeInfo.title_en_us) || !IsEmpty(pageEpisodeInfo.title_en_jp) || !IsEmpty(pageEpisodeInfo.title_ja_jp)) && ( 
                                        <>
                                            <h2>{!IsEmpty(pageEpisodeInfo.title_en_us) ? pageEpisodeInfo.title_en_us : ''}</h2>
                                            <h4 className='subheader_color'>{FormatEpisodeSubHeader(pageEpisodeInfo.title_en_jp, pageEpisodeInfo.title_ja_jp)}</h4>
                                            <hr className='fto__page__episode-horizontal_hr'/>
                                        </>
                                    )}

                                    {pageEpisodeInfo.aired !== undefined && ( 
                                        <div className='fto__page__episode-main_content--episode_details-info_item'>
                                            <p className='fto__page__episode-main_content-text'>Air Date: {pageEpisodeInfo.aired}</p>
                                        </div>
                                    )}

                                    <div className='fto__page__episode-main_content--episode_details-info_item'>
                                        <p><u>Episode Description </u></p>
                                        {(pageEpisodeInfo.synopsis !== undefined) ? ( 
                                            <p className='fto__page__episode-main_content-text'>{pageEpisodeInfo.synopsis}</p>
                                        ) : (
                                            <p className='fto__page__episode-main_content-text'>{`Episode ${episode_no} of ${malAnimeInfo.titles[0].title}`}.</p>
                                        )}
                                    </div>
                                </div>
                                )}
                            </div>
                            
                            {malAnimeInfo !== undefined && (
                                <div className='fto__page__episode-main_content--soundtrack_section'>
                                    <div className='fto__page__episode-main_content--add_track_section'>
                                        <a className='fto__button__pink' href={'/submission/track_add/' + anime_id + '?episode_no=' + episode_no}>Add New Track</a>
                                    </div>

                                    <div className='fto__page__episode-main_content--soundtrack_list_section'>
                                        <h3 className='fto__page__episode-main_content-header'>List of Soundtracks</h3>
                                        <hr />
                                    
                                        {(episodeListOfTracks === undefined || episodeListOfTracks.length === 0) ? (
                                            /* If no tracks show this message*/
                                            <p className='fto__page__episode-main_content-no_soundtracks'>
                                                No Soundtracks Added yet.
                                            </p>
                                        ) : ( 
                                            episodeListOfTracks.map((trackInfo, it) => {
                                                return (
                                                    <div className='fto__page__episode-main_content--track_item' key={it}>
                                                        <div className='fto__page__episode-main_content--track_item-header'>
                                                            <a href={'/track/' + trackInfo.track_id + '?context_id=' + trackInfo.occurrence_id}
                                                                key={it} style={{flex: '1'}}>
                                                                <div className='fto__page__episode-main_content--track_item-header_left'>
                                                                    <h4>{trackInfo.track_name}</h4>
                                                                    <h5 className='fto__page__episode-subheader_color'>{MapTrackType(trackInfo.track_type)}</h5>
                                                                </div>
                                                            </a>
                                                            <div className='fto__page__episode-main_content--track_item-header_right'>
                                                                {(!IsEmpty(trackInfo.streaming_platform_links) && typeof(JSON.parse(trackInfo.streaming_platform_links)) === 'object') && 
                                                                    !IsEmpty(JSON.parse(trackInfo.streaming_platform_links)['data']['spotify']) && (      
                                                                    <FaPlayCircle 
                                                                        className='fto__page__episode-main_content--track_item-play_icon' 
                                                                        onClick={() => {setViewSpotifyPlayModal(true); setCurrentSpotifyId(JSON.parse(trackInfo.streaming_platform_links)['data']['spotify'])}}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className='fto__page__episode-main_content--track_item-scene_description'>
                                                            <p><b>Scene Description:</b></p>
                                                            <p className='fto__page__episode-main_content--track_item-scene_description_text' >
                                                                {trackInfo.scene_description}
                                                            </p>
                                                        </div>
                                                        
                                                    </div>
                                                );
                                            })
                                        )}   
                                    </div>
                                    
                                </div>
                            )}
                        </div>

                        {ftoEpisodeInfo && (
                            <Comments 
                                currentUserId={1}
                                ftoEpisodeId={ftoEpisodeInfo.episode_id}/>
                        )}  
                    </div>
                )}
            </div>
		    <Footer />
        </div>
    )
}

export default Episode