import React, {useEffect, useState, createElement} from 'react';
import { useLocation, useParams } from "react-router-dom";
import './episode.css';

import { Navbar, Footer} from "../../components";
import { ParsePosterImage_Horzontal } from "../../utils/MalApiUtils"
import { IsEmpty } from "../../utils/RegularUtils"

import arrow_icon from '../../assets/Arrow_Icon.svg'
import pencil_icon from '../../assets/Pencil_Icon.svg'


const Episode = () => {
    const location = useLocation();
    const { id, episode_id } = useParams();
    
    const [ ftoAnimeInfo, setFTOAnimeInfo ] = useState();
    const [ malAnimeInfo, setMALAnimeInfo ] = useState();
    const [ ftoEpisodeInfo, setFTOEpisodeInfo ] = useState();
    const [ malEpisodeInfo, setMALEpisodeInfo ] = useState();
    const [ malEpisodeImageInfo, setMALEpisodeImageInfo ] = useState();
    const [ kitsuEpisodeInfo, setKitsuEpisodeInfo ] = useState();
    const [ pageEpisodeInfo, setPageEpisodeInfo ] = useState();

    useEffect(() => {
        console.debug(`Render-Anime (onMount): ${location.href}`);  
        console.log(`AnimeID(${id} and EpisodeID(${episode_id}))`)
        
        FetchPageData(id, episode_id);
    }, []);

    useEffect(() => {
        if (malAnimeInfo !== undefined) {
            // Process MAL API anime titles to output to display
            var arrMalAnimeTitles = malAnimeInfo.titles;
       
            if (ftoAnimeInfo !== undefined) {
                FetchUpdateAnimeData_FTO(id, malAnimeInfo);
            }
        }
    }, [malAnimeInfo]);

    useEffect(() => {
        if (malEpisodeInfo !== undefined || kitsuEpisodeInfo !== undefined) {
            var episodeInfo = {};

            // episodeInfo.title_en = () ? malEpisodeInfo.title;
            if (malEpisodeInfo !== undefined) {
                episodeInfo.title_en_us = malEpisodeInfo.title;
                episodeInfo.title_en_jp = malEpisodeInfo.title_romanji;
                episodeInfo.title_ja_jp = malEpisodeInfo.title_japanese;
                episodeInfo.synopsis = malEpisodeInfo.synopsis;
                episodeInfo.aired = String(malEpisodeInfo.aired).substring(0, 10);

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
                if (!episodeInfo.hasOwnProperty('image_url')) {
                    episodeInfo.image_url = kitsuEpisodeInfo.thumbnail.original;
                }
            }
            setPageEpisodeInfo(episodeInfo);
        }
        
    }, [malEpisodeInfo, malEpisodeImageInfo, kitsuEpisodeInfo])

    const FetchAnimeData_FTO = async (ftoAnimeID) => {
        try {
            var apiUrl_fto = `/getAnime/${Number(ftoAnimeID)}`
            console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
            const response = await fetch(apiUrl_fto); // Replace with your actual backend endpoint
            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error('Error fetching data from backend');
        }
    }

    const FetchEpisodeData_FTO = async (ftoAnimeID, nEpisodeNo) => {
        try {
            var apiUrl_fto = `/getEpisodes/anime/${Number(ftoAnimeID)}/episode_no/${Number(nEpisodeNo)}`
            console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
            const response = await fetch(apiUrl_fto); // Replace with your actual backend endpoint
            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error('Error fetching data from backend');
        }
    }
    
    const FetchFullAnimeData_MAL = async (malAnimeID) => {
        try {
            var apiUrl_mal = `https://api.jikan.moe/v4/anime/${malAnimeID}/full`;
            console.debug(`Fetch data from External API, url: '${apiUrl_mal}'`);
            const response = await fetch(apiUrl_mal);
            const externalData = await response.json();
            return externalData;
        } catch (error) {
            throw new Error('Error fetching data from external API (MyAnimeList)');
        }
    }

    const FetchUpdateAnimeData_FTO = async (ftoID, malAnimeDetails) => {
        try {
            // Get Prequel Anime in FTO DB (if present)
            var ftoPrequelAnimeID = 0;
            var arrMalAnimeRelations = malAnimeDetails.relations;
            for (var it = 0; it <  Object.keys(arrMalAnimeRelations).length; it++) {
                var animeRelation = arrMalAnimeRelations[it]
                let animeRelationEntry = animeRelation.entry;
                let animeRelationType = animeRelation.relation;
                if (animeRelationType == 'Prequel') {
                    var prequelEntries = animeRelationEntry;

                    var nLowestMalID = malAnimeInfo.mal_id;
                    prequelEntries.map(entry => {
                        if (entry.mal_id < nLowestMalID) {
                            nLowestMalID = entry.mal_id;
                        }
                    });
                    
                    if (nLowestMalID !== malAnimeInfo.mal_id) {

                        var apiUrl_fto = `/getAnimeMappingMAL/${nLowestMalID}`
                        try {
                            console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
                            const response = await fetch(apiUrl_fto);
                            if (response.status == 200) {
                                const data = await response.json();
                                ftoPrequelAnimeID = data[0].anime_id;
                            }
                        }
                        catch (error) {
                            throw new Error(`Error fetching data in backend.\nError message: ${error}\nFetch url: ${apiUrl_fto}`);
                        }
                    }
                    break;
                }
            }

            var bUpdateParentAnimeID = (ftoAnimeInfo.parent_anime_id == null || ftoAnimeInfo.parent_anime_id == 0) && ftoPrequelAnimeID !== 0;
            var bUpdateCanonicalTitle = (ftoAnimeInfo.canonical_title == '');
            var ftoCanonicalTitle = (!bUpdateCanonicalTitle) ? '' : malAnimeDetails.titles[0].title;;
            
            // Createn update query
            var apiUrl_fto = '';
            if (bUpdateCanonicalTitle && bUpdateParentAnimeID) {
                apiUrl_fto =`/patchAnime/${ftoID}/title/${ftoCanonicalTitle}/parent_id/${encodeURIComponent(ftoPrequelAnimeID)}`;
            } else if (bUpdateCanonicalTitle) {
                apiUrl_fto = `/patchAnime/${ftoID}/title/${encodeURIComponent(ftoCanonicalTitle)}`;
            } else if (bUpdateParentAnimeID) {
                apiUrl_fto = `/patchAnime/${ftoID}/parent_id/${ftoPrequelAnimeID}`;
            }

            // Perform Fetch Query to update anime
            if (apiUrl_fto !== '') {
                try {
                    console.debug(`Fetch put data from the mal api to backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
                    const response = await fetch(apiUrl_fto);
                    const responseData = await response.json();
                }
                catch (error) {
                    throw new Error('Error:', error);
                }
            }
        } 
        catch (error) {
            throw new Error('Error updating data in backend');
        }
    }
    
    const FetchEpisodeData_MAL = async (malAnimeID, malEpisodeID) => {
        try {
            //Finished aring, check if mal has individual episode details
            let apiUrl_mal = `https://api.jikan.moe/v4/anime/${malAnimeID}/episodes/${malEpisodeID}`;
            console.debug(`Fetch Episode data from External API, MAL url: '${apiUrl_mal}'`);
            const response_mal = await fetch(apiUrl_mal);
            const responseData_mal = await response_mal.json();
            return responseData_mal;
        }
        catch (error) {
            throw new Error('Error fetching episode data from external API (MyAnimeList)');
        }
    }

    const FetchEpisodeImageData_MAL = async (malAnimeID, malEpisodeID) => {
        try {
            //Finished aring, check if mal has individual episode details
            var bEpisodeNotFound = true;
            var nLastPageNumber = 0;
            let nPageNumber = 1;
            let attempt = 0;
            while (bEpisodeNotFound) {
                console.log("Attempt:", attempt++);
                let apiUrl_mal = `https://api.jikan.moe/v4/anime/${malAnimeID}/videos/episodes?page=${nPageNumber}`;
                console.debug(`Fetch Episode Image data from External API, MAL url: '${apiUrl_mal}'`);
                const response_mal = await fetch(apiUrl_mal);
                const responseData_mal = await response_mal.json();

                nLastPageNumber = (nLastPageNumber == 0) ? responseData_mal.pagination.last_visible_page : nLastPageNumber;
                if (responseData_mal.data.length > 0) {
                    var nMalID_first = responseData_mal.data[0].mal_id;
                    var nMalID_last = responseData_mal.data[responseData_mal.data.length - 1].mal_id;
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
                        if (nPageNumber != 1) {
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
                        if (nMalID_last - 40 < malEpisodeID && responseData_mal.pagination.has_next_page == true) {
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

    const FetchEpisodeData_KITSU = async (kitsuEpisodeID) => {
        try {
            if (kitsuEpisodeID != -1 || (kitsuEpisodeID == null)) {
                let apiUrl_kitsu = `https://kitsu.io/api/edge/episodes/${kitsuEpisodeID}`;
                console.debug(`Fetch Episode data from External API, Kitsu url: '${apiUrl_kitsu}'`);
                const response_kitsu = await fetch(apiUrl_kitsu);
                const responseData_kitsu = await response_kitsu.json();
                return responseData_kitsu;
            }
            return []
        }
        catch (error) {
            console.error("My error:", error);
            throw new Error(`Error fetching episode data from external API (Kitsu).'`);
        }
    }

    const FetchPageData = async (pageId, episodeId) => {
        try {
            // Fetch data from the backend
            const animeDataFromBackend = await FetchAnimeData_FTO(pageId);
            const episodeDataFromBackend = await FetchEpisodeData_FTO(pageId, episodeId);
            console.log('Anime Data from backend:', animeDataFromBackend);
            console.log('Episode Data from backend:', episodeDataFromBackend);
            setFTOAnimeInfo(animeDataFromBackend[0]);
            setFTOEpisodeInfo(episodeDataFromBackend);

            // Use data from the backend to make the second fetch to the external API
            var malID = animeDataFromBackend[0].mal_id;
            const dataFromExternalAPI_MAL = await FetchFullAnimeData_MAL(malID);
            const episodeData_malAPI = await FetchEpisodeData_MAL(malID, episodeDataFromBackend[0].mal_episode_id);
            const episodeImageData_malAPI = await FetchEpisodeImageData_MAL(malID, episodeDataFromBackend[0].mal_episode_id);
            const episodeData_kitsuAPI = await FetchEpisodeData_KITSU( episodeDataFromBackend[0].kitsu_episode_id);
            console.log('Anime Data from external MAL API:', dataFromExternalAPI_MAL);
            console.log('Episode Data from MAL API:', episodeData_malAPI);
            console.log('Episode Image Data from MAL API:', episodeImageData_malAPI);
            console.log('Episode Data from external KITSU API:', episodeData_kitsuAPI);
            setMALAnimeInfo(dataFromExternalAPI_MAL.data);
            setMALEpisodeInfo(episodeData_malAPI.data);
            setMALEpisodeImageInfo(episodeImageData_malAPI);
            setKitsuEpisodeInfo(episodeData_kitsuAPI.data.attributes);

        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    const FormatEpisodeSubHeader = (title_romanji, title_japanese) => {
        if (IsEmpty(title_japanese)) {
            return title_romanji;
        }
        else {
            return `${title_romanji} (${title_japanese})`;
        }
    }

    return (
        <div className='fto__page__episode'>

            <div className='gradient__bg'>
                <Navbar />

                {pageEpisodeInfo !== undefined && (
                    <div className='fto__page__episode-content section__padding' style={{paddingBottom: 0}}>
                        
                        <div className='fto__page__episode-content_heading_section'>
                            <h1 className='fto__page__episode-content_header_title gradient__text'>
                                Episode {episode_id}
                            </h1>
                            <h1 className='fto__page__episode-content_header_subtitle'><strong>{malAnimeInfo.titles[0].title}</strong></h1>
                        </div>
                        <hr className='fto__page__episode-horizontal_hr' />
                        
                        <div className='fto__page__episode-main_content'>
                            <div className='fto__page__episode-main_content--episode_details'>
                                <div className='fto__page__episode-main_content--episode_details-left'>
                                    <img alt='Anime Image' className='fto__page__episode-main_content--episode_details-thumbnail' src={ParsePosterImage_Horzontal(pageEpisodeInfo.image_url)}/>
                                </div>
                                <div className='fto__page__episode-main_content--episode_details-right'>
                                    <h2>{pageEpisodeInfo.title_en_us}</h2>
                                    <h4 className='fto__page__episode-subheader_color'>{FormatEpisodeSubHeader(pageEpisodeInfo.title_en_jp, pageEpisodeInfo.title_ja_jp)}</h4>
                                    <hr className='fto__page__episode-horizontal_hr'/>

                                    {pageEpisodeInfo.aired !== undefined && ( 
                                        <div className='fto__page__episode-main_content--episode_details-info_item'>
                                            <p className='fto__page__episode-main_content-text'>Air Date: {pageEpisodeInfo.aired}</p>
                                        </div>
                                    )}

                                    {pageEpisodeInfo.synopsis !== undefined && ( 
                                        <div className='fto__page__episode-main_content--episode_details-info_item'>
                                            <p><u>Episode Description </u></p>
                                            <p className='fto__page__episode-main_content-text'>{pageEpisodeInfo.synopsis}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {// Show Anime Synopsis
                            malAnimeInfo.synopsis !== undefined && (
                                <div className='fto__page__episode-main_content--soundtrack_section'>
                                    <div className='fto__page__episode-main_content--add_track_section'>
                                        <button className='fto__page__episode-main_content--add_track_button'>Add new Track</button>
                                    </div>
                                    <h3 className='fto__page__episode-main_content-header'>List of Soundtracks</h3>
                                    <hr />

                                    {/* If no tracks show this messahe*/ }
                                    <p className='fto__page__episode-main_content-no_soundtracks'>
                                        No Soundtracks Added yet.
                                    </p>

                                    <div className='fto__page__episode-main_content--track_item'>
                                        <div className='fto__page__episode-main_content--track_item-header'>
                                            <div className='fto__page__episode-main_content--track_item-header_left'>
                                                <h4>Track Title</h4>
                                                <h5 className='fto__page__episode-subheader_color'>Track Type</h5>
                                            </div>
                                            <div className='fto__page__episode-main_content--track_item-header_right'>
                                                <button className='fto__page__episode-main_content--track_item-goto_track_button' type='submit'>
                                                    <img src={arrow_icon}/>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className='fto__page__episode-main_content--track_item-scene_description'>
                                            <div className='fto__page__episode-main_content--track_item-scene_description_left'>
                                                <p><b>Scene Description:</b></p>
                                                <p>A redundent scene description to help the user identify the song</p>
                                            </div>
                                            <div className='fto__page__episode-main_content--track_item-scene_description_right'>
                                                <button className='fto__page__episode-main_content--track_item-edit_track_button' type='submit'>
                                                    <img src={pencil_icon}/>&nbsp;Edit
                                                </button>
                                            </div>
                                        </div>
                                        
                                    </div>
                                    
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
		    <Footer />
        </div>
    )
}

export default Episode