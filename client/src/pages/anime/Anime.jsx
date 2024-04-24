import React, {useEffect, useState, createElement} from 'react';
import { useLocation, useParams } from "react-router-dom";
import './anime.css';

import { Navbar, Footer, ModalEmbeddedTrack} from "../../components";
import { useCustomNavigate } from './../../routing/navigation'
import { AreDefaultAndEnglishTitlesDifferent, ParseAnimePosterImage } from "../../utils/MalApiUtils"
import { IsEmpty, ParseClassName } from "../../utils/RegularUtils"
import { toast } from 'react-toastify';
import { FaPlayCircle } from 'react-icons/fa';

const Anime = ({
    SignInFunction,
    SignOutFunction,
    user_properties = {
        userId: null, 
        username: null
    }
}) => {
    const location = useLocation();
    const { id } = useParams();
    const { navigateToAnime } = useCustomNavigate();

    const searchParams = new URLSearchParams(location.search);
    const [ spEpisodePageNum, setEpisodePageNum ] = useState(parseInt(searchParams.get('episode_page_no'), 10) || 1);

    const [ ftoAnimeInfo, setFTOAnimeInfo ] = useState();
    const [ ftoAnimeEpisodesInfo, setFTOAnimeEpisodesInfo ] = useState();
    const [ malAnimeInfo, setMALAnimeInfo ] = useState();
    const [ aniListEpisodeCountInfo, setAniListEpisodeCountInfo ] = useState();

    const [ malAnimeTitles, setAnimeTitles ] = useState();
    const [ malAnimeRelations, setAnimeRelations ] = useState();
    const [ pageEpisodesInfo, setPageEpisodesInfo ] = useState();
    const [ pageListViewFocus, setPageListView ] = useState({episode_list: null, track_list: null});
    
    const [ embeddedTrackModalVisibility, setEmbeddedTrackModalVisibility ] = useState(false);
    const [ currentTrackData, setCurrentTrackData ] = useState()

    useEffect(() => {
        console.debug(`Render-Anime (onMount): ${location.href}`);
        document.title = `FindThatOST Anime`;
        FetchPageData(id);

        // Listen and hanlde for the popstate event (back button or forward press)
        const handlePopstate = async () => {
            // When the browser history changes, manually update the component based on the current URL
            const newSearchParams = new URLSearchParams(window.location.search);
            const newPage = parseInt(newSearchParams.get('episode_page_no'), 10) || 1;
      
            setEpisodePageNum(newPage);

            // Fetch data based on newPage
            FetchPageData(id);
        };
        window.addEventListener('popstate', handlePopstate);
        return () => {
            // Remove the event listener when the component unmounts
            window.removeEventListener('popstate', handlePopstate);
        };
    }, []);

    useEffect(() => {
        if (malAnimeInfo !== undefined) {
            // Process MAL API anime titles to output to display
            let arrMalAnimeTitles = malAnimeInfo.titles;
            const objMalAnimeTitles = arrMalAnimeTitles.reduce((result, item) => {
                if (item.type) {
                  result[item.type] = item.title || null;
                }
                return result;
            }, {});
            setAnimeTitles(objMalAnimeTitles);

            // Process MAL API Anime Relations to output to display
            let arrMalAllAnimeRelations = [];
            malAnimeInfo.relations.map(animeRelation => {
                let animeRelationEntries = animeRelation.entry;
                let animeRelationType = animeRelation.relation;

                for (let it = 0; it < Object.keys(animeRelationEntries).length; it++) {
                    let item = animeRelationEntries[it];
                    if (item.type === 'anime') {
                        item.relation = animeRelationType;
                        arrMalAllAnimeRelations.concat(item);
                    }
                }

                return animeRelation;
            })
            setAnimeRelations(arrMalAllAnimeRelations);
       
            if (ftoAnimeInfo !== undefined) {
                FetchUpdateAnimeData_FTO(id, malAnimeInfo);
            }

            // Get Episode Info
           FetchEpisodeData(malAnimeInfo, spEpisodePageNum);
        }
    }, [malAnimeInfo]);
    
    useEffect(() => {
        if (pageEpisodesInfo !== undefined) {
            setPageListView(() => {
                return {
                    episode_list: true, 
                    track_list: (pageListViewFocus.track_list === true ) ? false : pageListViewFocus.track_list,
                };
            });

            // Get episode number to see the
            let animeStatus = malAnimeInfo.status;
            let nLatestEpisode = Number(malAnimeInfo.episodes);

            if (animeStatus !== 'Not yet aired') {
                if (animeStatus === 'Currently Airing') {
                    nLatestEpisode = Number(aniListEpisodeCountInfo.data.Media.nextAiringEpisode.episode - 1);
                }
                
                UpdateEpisodesInFtoDB(pageEpisodesInfo, nLatestEpisode);
            }
        }
    }, [pageEpisodesInfo]);

    /**
     * Updates the FTO DB with episode details.
     * 
     * @async
     * @function UpdateEpisodesInFtoDB
     * @param {Array<Object>} pageEpisodesDetails - The array of json objects containing episode details.
     * @param {number} nLatestAnimeEpisode - The Latest aired episode number.
     */
    const UpdateEpisodesInFtoDB = async (pageEpisodesDetails, nLatestEpisodeNum) => {
        const animeEpisodesData = await FetchEpisodeMapping(id);

        //If all show episodes not in database
        if (animeEpisodesData !== undefined && animeEpisodesData.length !== nLatestEpisodeNum) {
            
            let nListOfEpisodeNos = [];
            for (let i = 0; i < animeEpisodesData.length ; i++ ) {
                nListOfEpisodeNos.push(animeEpisodesData[i].episode_no);
            }

            let nListOfEpisodeNosToAdd = [];
            for (let i = 0; i < nLatestEpisodeNum ; i++ ) {
                if (!nListOfEpisodeNos.includes(i+1)) {
                    nListOfEpisodeNosToAdd.push(i+1);
                }
            }

            //If page doesn't already have all episodes, fetch  whole anime episodeDetails
            const allEpisodeDetails = (nLatestEpisodeNum > pageEpisodesDetails.length) ? await FetchAllAnimeEpisodeDetails(nLatestEpisodeNum) : pageEpisodesDetails;
            const responseStatus = await FetchInsertMissingEpisodes(nListOfEpisodeNosToAdd, allEpisodeDetails);
            if (responseStatus !== 500 && responseStatus !== undefined) {
                // Successful Insert of missing episodes into DB, get new episode mapping
                const newAnimeEpisodesData = await FetchEpisodeMapping(id);
                console.log(`New Episodes for AnimeID ${id} added to FTO database: `, newAnimeEpisodesData);
                setFTOAnimeEpisodesInfo(newAnimeEpisodesData);
            }
        }
        else {
            console.info(`All Episodes for Anime are present`);
            setFTOAnimeEpisodesInfo(animeEpisodesData);
        }
    }

    /**
     * Get all episodes with the anime id.
     * 
     * @async
     * @function FetchEpisodeMapping
     * @param {number|string} ftoAnimeID - The FindThatOST Anime ID.
     * @returns {Promise<Array<JSON>>|undefined} The array of json objects containing episode details.
     */
    const FetchEpisodeMapping = async (ftoAnimeID) => {
            let apiUrl_fto = `/findthatost_api/anime/${ftoAnimeID}/episodes`;
            console.debug(`Fetch url:, '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
            try {
                const response = await fetch(apiUrl_fto);
                if (response.status === 200) {
                    const data = await response.json();
                return data;
                } else if (response.status === 500) {
                    toast('The FindThatOST Server is down at the moment. Please try again later.');
                }
            }
            catch (error) {
                toast('The FindThatOST Server is down at the moment. Please try again later.');
            }
    }
    
    /**
     * Get all episode details from MAL and Kitsu API and create array of episode details for anime.
     * 
     * @async
     * @function FetchAllAnimeEpisodeDetails
     * @param {number} nLatestAnimeEpisode - The Latest aired episode number.
     * @returns {Promise<Array<JSON>>} - The array of json objects containing episode details.
     */
    const FetchAllAnimeEpisodeDetails = async (nLatestAnimeEpisode) => {
        // Get All MAL Episodes
        let allMALAnimeEpisodes = [];
        let malQueryPage = 1;
        while (malQueryPage > 0) {
            const malPageEipsodes = await FetchEpisodeData_MAL(malAnimeInfo.mal_id, malQueryPage);
            
            console.log("MAL episodes:", malPageEipsodes);
            allMALAnimeEpisodes.push(...malPageEipsodes.data);
            malQueryPage = (malPageEipsodes.pagination.has_next_page === true) ? malQueryPage + 1 : 0;
        }

        // Get All Kitsu Episodes
        let allKitsuAnimeEpisodes = [];
        if (!IsEmpty(ftoAnimeInfo.kitsu_id)) {
            console.log("Anime Kitsu ID:", ftoAnimeInfo.kitsu_id)
            let nLastOffset = Math.ceil(nLatestAnimeEpisode / 20);
            let kitsuQueryOffset = 0;
            let iter = 0;
            while (kitsuQueryOffset <= ((nLastOffset * 20) - 20) && iter < nLastOffset) {
                const kitsuPageEpisodes = await FetchEpisodeData_KITSU(ftoAnimeInfo.kitsu_id, kitsuQueryOffset);
                allKitsuAnimeEpisodes.push(...kitsuPageEpisodes.data);
    
                let apiLinks = kitsuPageEpisodes.links;
                if (!('next' in apiLinks)) {
                    break;
                }
    
                kitsuQueryOffset = kitsuQueryOffset + 20;
                iter++;
            }
        }
        
        // Create a combined array of episode details
        const episodesInfo = [];
        for (let it = 0; it < nLatestAnimeEpisode; it++) {
            let epInfo = {};
            let episodeTitleEn = '';
            let episodeNumber = it + 1;
            epInfo.episode_no = episodeNumber;
            
            if (allMALAnimeEpisodes.length > (episodeNumber-1)%100) {
                let malEpisodeinfo = allMALAnimeEpisodes[((episodeNumber-1)%100)];
                epInfo.mal_episode_id = Number(malEpisodeinfo.mal_id);
                if (malEpisodeinfo.title !== '') {
                    episodeTitleEn = malEpisodeinfo.title;
                }
            }
            if (allKitsuAnimeEpisodes.length > (episodeNumber-1)%100) {
                let kitsuEpisodeinfo = allKitsuAnimeEpisodes[it];
                epInfo.kitsu_episode_id = Number(kitsuEpisodeinfo.id);
                if (kitsuEpisodeinfo.attributes.titles.en_us !== '') {
                    episodeTitleEn = (episodeTitleEn === '') ? kitsuEpisodeinfo.attributes.titles.en_us : episodeTitleEn;
                }
            }
            epInfo.episode_title = (episodeTitleEn !== '') ? episodeTitleEn.replaceAll("'", "\\'") : null;
            episodesInfo.push(epInfo);
        }

        return episodesInfo;
    }
    
    /**
     * Get all episode details from MAL and Kitsu API and create array of episode details for anime.
     * 
     * @async
     * @function FetchInsertMissingEpisodes
     * @param {Array<Number>} listOfMissingEpisodesNos - The Latest aired episode number.
     * @param {Array<JSON>} listOfEpisodesDetails - The Latest aired episode number.
     * 
     */
    const FetchInsertMissingEpisodes = async (listOfMissingEpisodesNos, listOfEpisodesDetails) => {
        // Filter allEpisodeDetails list to only have missing episodes
        const listOfMissingEpisodesDetails = listOfEpisodesDetails.filter((objEpisode) =>
            listOfMissingEpisodesNos.includes(objEpisode.episode_no)
        );

        // Add missing episodes to episode database.
        let data = listOfMissingEpisodesDetails;
        if (listOfMissingEpisodesDetails.length > 0) {
            let apiUrl_fto = `/findthatost_api/anime/${id}/post_missing_episodes`;
            try {
                    const response = await fetch(apiUrl_fto, 
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ data }),
                    });
                    const responseStatus = response.status;
                    await response.json();
                    return responseStatus;
            }
            catch (error) {
                toast('An internal error has occurred in FindThatOST Server. Please try again later.');
                throw new Error(`Error fetching data mapping in backend.\nError message: ${error}\nFetch url: ${apiUrl_fto}`);
            }
        }
        return;
    }

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
        let apiUrl_fto = `/findthatost_api/anime/${Number(ftoAnimeID)}/full`
        console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
        try {
            const response = await fetch(apiUrl_fto);
            const data = await response.json();
            return data;
        } catch (error) {
            toast('An internal error has occurred in FindThatOST Server. Please try again later.');
            throw new Error('Error fetching data from backend');
        }
    }
    
    /**
     * Get anime details from MyAnimeList API using MAL ID mapped from the FTOAnimeID from backend response.
     * 
     * @async
     * @function FetchFullAnimeData_MAL
     * @param {Array<JSON>}  dataFromBackend - The array of json objects (max length 1) containing anime details.
     * @returns {Promise<Array<JSON>|undefined} - JSON Object containing anime info from MAL API.
     * 
     */
    const FetchFullAnimeData_MAL = async (nMalId) => {
        let apiUrl_mal = `https://api.jikan.moe/v4/anime/${nMalId}/full`;
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
     * Get anime details from AniList API using MAL ID mapped from the FTOAnimeID from backend response.
     * 
     * @async
     * @function FetchFullAnimeData_AniList
     * @param {Array<JSON>}  malID - MyAnimeList Anime ID.
     * @returns {Promise<Array<JSON>>|undefined} - JSON Object containing anime info from MAL API.
     * 
     */
    const FetchFullAnimeData_AniList = async (malID) => {
        try {
            const newResponse = await fetch('https://graphql.anilist.co', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
                body: JSON.stringify({
                  query: `
                    query ($malId: Int) {
                        Media(type: ANIME, idMal: $malId) {
                            id
                            title {
                                romaji
                            }
                            episodes
                            nextAiringEpisode {
                                episode
                                id
                            }
                        }
                    }
                  `,
                  variables: {
                    malId: malID,
                  },
                }),
            });
            
            const externalDataAniList = await newResponse.json();
            return externalDataAniList;
        } 
        catch (error) {
            if (error.message !== '') {
                console.error("Error messsage:", error.message)
            }
            throw new Error('Error fetching data from external API (AniList)');
        }
    }

    /**
     * Get Episode data to display on page (and update FTO database if unapdated).
     * 
     * @async
     * @function FetchEpisodeData
     * @param {number|string}  malAnimeDetails - Page ID (search param) from url, corresponds to FindThatOST Anime ID.
     * @param {number|string}  ftoEpisodePageNum - Page number (search param) from url for API query.
     * 
     */
    const FetchEpisodeData = async (malAnimeDetails, ftoEpisodePageNum = 1) => {
        //Asuming each page on FTO anime page has 20 episodes
        let episodeCount = malAnimeDetails.episodes;
        let latestEpisodeNumber = episodeCount;
        let airStatus = malAnimeDetails.status;

        if (airStatus !== 'Not yet aired') {
            if (airStatus === 'Currently Airing') {
                // Get episode count and latest episode numusing AniList API
                try {
                    let malAnimeID = malAnimeDetails.mal_id;
                    const dataFromExternalAPI_AniList = await FetchFullAnimeData_AniList(malAnimeID);
                    console.log('Data from external AniList API:', dataFromExternalAPI_AniList);
                    setAniListEpisodeCountInfo(dataFromExternalAPI_AniList);
                    latestEpisodeNumber = dataFromExternalAPI_AniList.data.Media.nextAiringEpisode.episode - 1;
                } catch (error) {
                    toast("Unable to get episode information for currently airing anime.");
                    console.error('Error:', error.message);
                }
            }

            let malToFtoRangeSize = 5;
            let malEpisodeQueryPage = (ftoEpisodePageNum + malToFtoRangeSize - 1) / malToFtoRangeSize | 0;
            const malPageEpisodesResponse = await FetchEpisodeData_MAL(malAnimeDetails.mal_id, malEpisodeQueryPage);
            const malPageEpisodes = malPageEpisodesResponse.data;

            let startEpisode = 1 + ((ftoEpisodePageNum - 1) * 20);
            const kitsuPageEpisodesResponse = await FetchEpisodeData_KITSU(ftoAnimeInfo.kitsu_id, startEpisode-1 );
            const kitsuPageEpisodes = (Object.keys(kitsuPageEpisodesResponse).length > 0 && Array.isArray(kitsuPageEpisodesResponse.data)) ? kitsuPageEpisodesResponse.data : [];

            const episodesInfo = [];
            let endEpisode = (ftoEpisodePageNum * 20 < latestEpisodeNumber) ? ftoEpisodePageNum * 20 : latestEpisodeNumber;
            let loopEnd = (endEpisode%20 === 0) ? 20 : endEpisode%20;
            for (let it = 0; it < loopEnd; it++) {
                let epInfo = {};
                let episodeTitleEn = '';
                let episodeNumber = startEpisode + it;
                epInfo.episode_no = episodeNumber;
                
                if (malPageEpisodes.length > (episodeNumber-1)%100) {
                    let malEpisodeinfo = malPageEpisodes[(episodeNumber-1)%100];
                    epInfo.mal_episode_id = malEpisodeinfo.mal_id;
                    if (malEpisodeinfo.title !== '') {
                        episodeTitleEn = malEpisodeinfo.title;
                    }
                }
                if (kitsuPageEpisodes.length > (episodeNumber-1)%100 ) {
                    let kitsuEpisodeinfo = kitsuPageEpisodes[it];
                    epInfo.kitsu_episode_id = Number(kitsuEpisodeinfo.id);
                    if (!IsEmpty(kitsuEpisodeinfo.attributes.titles.en_us)) {
                        episodeTitleEn = (episodeTitleEn === '') ? kitsuEpisodeinfo.attributes.titles.en_us : episodeTitleEn;
                    }
                }
                epInfo.episode_title = episodeTitleEn.replaceAll("'", "\\'");
                episodesInfo.push(epInfo);
            }
            setPageEpisodesInfo(episodesInfo);
        }
    }
    
    /**
     * Get episode details from MyAnimeList API using MAL Anime ID.
     * 
     * @async
     * @function FetchEpisodeData_MAL
     * @param {number|string}  malAnimeID - MyAnimeList Anime ID.
     * @param {number|string}  queryPageNum - Page number for API query.
     * @returns {Promise<Array<JSON>>|undefined} - JSON Object containing episode info from MAL API.
     * 
     */
    const FetchEpisodeData_MAL = async (malAnimeID, queryPageNum) => {
        try {
            //Finished aring, check if mal has individual episode details
            let apiUrl_mal = `https://api.jikan.moe/v4/anime/${malAnimeID}/episodes?page=${queryPageNum}`;
            console.debug(`Fetch Episode data from External API, MAL url: '${apiUrl_mal}'`);
            const response_mal = await fetch(apiUrl_mal);
            const responseData_mal = await response_mal.json();
            return responseData_mal;
        }
        catch (error) {
            throw new Error('Error fetching episode data from external API (MyAnimeList)');
        }
    }
    
    /**
     * Get episode details from Kitsu API using Kitsu Anime ID.
     * 
     * @async
     * @function FetchEpisodeData_KITSU
     * @param {number|string}  malAnimeID - MyAnimeList Anime ID.
     * @param {number|string}  pageOffset - Page number for API query.
     * @returns {Promise<Array<JSON>>|undefined} - JSON Object containing episode info from MAL API.
     * 
     */
    const FetchEpisodeData_KITSU = async (kitsuAnimeID, pageOffset) => {
        try {
            if (kitsuAnimeID !== -1 || (kitsuAnimeID == null)) {
                let apiUrl_kitsu = `https://kitsu.io/api/edge/anime/${kitsuAnimeID}/episodes?page[limit]=20&page[offset]=${pageOffset}`;
                console.debug(`Fetch Episode data from External API, Kitsu url: '${apiUrl_kitsu}'`);
                const response_kitsu = await fetch(apiUrl_kitsu);
                const responseData_kitsu = await response_kitsu.json();
                return responseData_kitsu;
            }
            return []
        }
        catch (error) {
            throw new Error('Error fetching episode data from external API (Kitsu)');
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
            if (animeRelationType === 'Prequel' || animeRelationType === 'Parent story') {
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
                    if (response.status === 200) {
                        const responseJson = await response.json();
                        ftoPrequelAnimeID = responseJson[0].anime_id;
                    }
                    else if (response.status === 204) {
                        // No MAL to FTO mapping found for ${nLowestMalID}
                    }
                    else {
                        toast('An internal error has occurred in FindThatOST Server. Please try again later.');
                        const responseJson = await response.json();
                        console.error(`Error updating data in backend.\nFetch url: ${apiUrl_fto}\nResponse Status: ${response.status}\nResponse: ${responseJson}`);
                    }
                }
                break;
            }
        }

        let ftoCanonicalTitle = malAnimeDetails.titles[0].title;
        let bUpdateParentAnimeID = (ftoAnimeInfo.parent_anime_id == null || ftoAnimeInfo.parent_anime_id === 0) && ftoPrequelAnimeID !== 0;
        let bUpdateCanonicalTitle = (ftoAnimeInfo.canonical_title === '' || ftoAnimeInfo.canonical_title !== ftoCanonicalTitle);
        
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
                const response = await fetch(apiUrl_fto, 
                    {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' }
                    });
                await response.json(); // Wait for response before contining
            }
            catch (error) {
                toast('An internal error has occurred in FindThatOST Server. Please try again later.');
                console.error(`Error updating data in backend.\nFetch url: ${apiUrl_fto}\nResponse: ${error}`);
            }
        }
    }

    /**
     * Perform all fetches to set up the webpage.
     * 
     * @async
     * @function FetchPageData
     * @param {number|string}  pageId - Page ID from url, corresponds to FindThatOST Anime ID.
     * 
     */
    const FetchPageData = async (pageId) => {
        try {
            // Fetch data from the backend
            const dataFromBackend = await FetchAnimeData_FTO(pageId);
        
            // Use data from the backend to make the second fetch to the external API
            const dataFromExternalAPI_MAL = await FetchFullAnimeData_MAL(dataFromBackend.mal_id);
        
            console.log('Data from backend:', dataFromBackend);
            console.log('Data from external MAL API:', dataFromExternalAPI_MAL);
            setFTOAnimeInfo(dataFromBackend);
            document.title = `${dataFromBackend.canonical_title} | FindThatOST Anime`;
            setMALAnimeInfo(dataFromExternalAPI_MAL.data);
            setPageListView(() => {
                if (!IsEmpty(dataFromBackend['track_list'])) {
                    return {
                        episode_list: pageListViewFocus.episode_list, 
                        track_list: (pageListViewFocus.episode_list !== true) ? true : false,
                    };
                }
                return pageListViewFocus;
            });
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    // Show pagination data from fetch
    const ShowPagination = (malAnimeDetails, anilistEpisodeDetails, pageEpisodeDetails, ftoEpisodePageNum = 1) => {
        // If no results, hide pagination
        if (Object.keys(malAnimeDetails).length === 0 && malAnimeDetails.constructor === Object) {
            return;
        }
        else if (malAnimeDetails.status === 'Currently Airing' && anilistEpisodeDetails === undefined) {
            return;
        }
        if (pageEpisodeDetails.length === 0) {
            return;
        }

        let latestEpisodeNumber = (malAnimeDetails.status === 'Currently Airing') ? 
            anilistEpisodeDetails.data.Media.nextAiringEpisode.episode - 1 : malAnimeDetails.episodes;

        let nFirstPage = 1;
        let nCurrentPage = ftoEpisodePageNum;
        let nLastPage = Math.ceil(latestEpisodeNumber / 20);
        let pageList = [];

        if (nCurrentPage - 3  >= nFirstPage) {
            // Show prev 2 pages nos
            // Show ellipsize and first page
            pageList.push(nFirstPage)
            pageList.push('…')
            pageList.push(nCurrentPage - 2)
            pageList.push(nCurrentPage - 1)
        } else if (nCurrentPage - 3  < nFirstPage) {
            // Show rest of previous pages
            let nPageNo = nFirstPage;
            while (nPageNo !== nCurrentPage) {
                pageList.push(nPageNo);
                nPageNo = nPageNo + 1;
            }
        }
        pageList.push(`[${nCurrentPage}]`);
        if (nCurrentPage + 3  < nLastPage) {
            // Show next 2 pages nos
            // Show ellipsize and last page no
            pageList.push(nCurrentPage + 1);
            pageList.push(nCurrentPage + 2);
            pageList.push('…');
            pageList.push(nLastPage);
        } else if (nCurrentPage + 3  >= nLastPage) {
            // Show rest of next pages
            if (nCurrentPage !== nLastPage) {
                let nPageNo = nCurrentPage;
                while (nPageNo !== nLastPage) {
                    nPageNo = nPageNo + 1;
                    pageList.push(nPageNo);
                }
            }
        }
        
        let pagesElem = createElement(
            'span', 
            {
                className: 'fto__page__anime-page_links',
            },
            pageList.map((pageNum, it) => {
                if (typeof pageNum == "number") {
                    return createElement(
                        'a', 
                        {
                            key: `pg_${it}`, 
                            onClick:() => HandleEpiosdeListPageChange(pageNum),
                        }, 
                        pageNum,
                    );
                } else {
                    return createElement('p', {key: `pg_${it}`,}, pageNum);
                }
            })
        );

        return createElement(
            'div', 
            {
                className: 'fto__page__anime-episode_pageination',
            }, 
            pagesElem
        );
    }

    // Handle episode list page number change
    const HandleEpiosdeListPageChange = (newPageNum) => {
        // Get the search string and new page number, and change url
        searchParams.set('episode_page_no', newPageNum);
        navigateToAnime(`${id}?${searchParams.toString()}`);
        setEpisodePageNum(newPageNum);

        // Fetch episode info for the new page
        FetchEpisodeData(malAnimeInfo, newPageNum);
        window.scrollTo(0, 0)
    }

    return (
        <div className='fto__page__anime'>
            {embeddedTrackModalVisibility && (
                <ModalEmbeddedTrack 
                    modalVisibility={embeddedTrackModalVisibility}
                    setModalVisibility={setEmbeddedTrackModalVisibility}
                    embeddedTrackData={currentTrackData}
                    setEmbeddedTrackData={setCurrentTrackData}/>
            )}

            <div className='gradient__bg'>
                <Navbar 
                    SignInFunction={SignInFunction} 
                    SignOutFunction={SignOutFunction} 
                    user_properties={user_properties} />

                {malAnimeInfo !== undefined && (
                    <div className='fto__page__anime-content section__padding' style={{paddingBottom: 0}}>
                        <div className='fto__page__anime-content_heading_section'>
                            <h1 className='fto__page__anime-content_header_title gradient__text'>
                                {malAnimeInfo.titles[0].title}
                            </h1>
                            
                            {AreDefaultAndEnglishTitlesDifferent(malAnimeInfo.titles) && (
                                <h4 className='fto__page__anime-content_header_subtitle'><strong>{malAnimeTitles !== undefined && ( malAnimeTitles.English )}</strong></h4>
                            )}
                        </div>
                        <hr className='fto_horizontal_hr' />
                        
                        <div className='fto__page__anime-main_content'>
                            <div className='fto__page__anime-main_content_left'>
                                <img alt='Anime Thumbnail' className='fto__page__anime-main_content_left-anime_image' src={ParseAnimePosterImage(malAnimeInfo)}/>
                                
                                <div className='fto__page__anime-main_content-main_info'>
                                    {malAnimeTitles !== undefined && (
                                        <div className='fto__page__anime-main_content_left-alt_titles'>
                                            <h3 className='fto__page__anime-main_content-header'>Alternative Titles</h3>
                                            {malAnimeInfo.titles.map((animeTitleDetails, it) => {
                                                return (
                                                    <p className='fto__page__anime-main_content-text' key={it}>
                                                        <strong>{animeTitleDetails.type}:</strong> {animeTitleDetails.title}
                                                    </p>
                                                )
                                            })}
                                        </div>
                                    )}

                                    <div className='fto__page__anime-main_content_left-more_info'>
                                        <h3 className='fto__page__anime-main_content-header'>Information</h3>
                                        <p className='fto__page__anime-main_content-text'><strong>Air Date: </strong>{malAnimeInfo.aired.string}</p>
                                        <p className='fto__page__anime-main_content-text'><strong>Status: </strong>{malAnimeInfo.status}</p>
                                    </div>
                                </div>
                            </div>

                            <div className='fto__page__anime-main_content_right'>
                                
                                {// Show Anime Synopsis
                                malAnimeInfo.synopsis !== undefined && (
                                    <div className='fto__page__anime-main_content_synopsis'>
                                        <h3 className='fto__page__anime-main_content-header'><u>Synopsis</u></h3>
                                        <p className='fto__page__anime-main_content-text'>
                                            {malAnimeInfo.synopsis}
                                        </p>
                                    </div>
                                )}

                                {// Show Related Anime
                                malAnimeRelations !== undefined && malAnimeRelations.length !== 0 && (
                                    <div className='fto__page__anime-main_content_related_shows'>
                                        <h4 className='fto__page__anime-main_content-header'><u>Related Shows</u></h4>
                                        
                                        {malAnimeInfo.relations.map((animeRelations) => {
                                            return (
                                                (animeRelations.relation === 'Prequel' || animeRelations.relation === 'Sequel') && (
                                                    <div className={`fto__page__anime-main_content_left-${ParseClassName(animeRelations.relation)}`}
                                                    key={crypto.randomUUID()}>
                                                        <h1 key={crypto.randomUUID()}>{animeRelations.name}</h1>
                                                        <p key={crypto.randomUUID()} className='fto__page__anime-main_content-text'><strong>{animeRelations.relation}: </strong></p>
                                                    
                                                        {animeRelations.entry.map((relationEntry) => {
                                                            return (
                                                                <p key={crypto.randomUUID()} className='fto__page__anime-main_content_left_indent'>
                                                                    •<span className='fto__page__anime-main_content_left_indent'>{relationEntry.name}</span>
                                                                </p>
                                                            )
                                                        })}
                                                    </div>
                                                )
                                            )
                                        })}
                                    </div>
                                )}

                                {// Show Anime Episode and/or Track List List
                                (!IsEmpty(pageEpisodesInfo !== undefined) || !IsEmpty(ftoAnimeInfo['track_list'])) && (
                                    <div className='fto__page__anime-main_content_info_list'>
                                        <div className='fto__page__anime-main_content_info_list-header_section'>
                                            {!IsEmpty(pageEpisodesInfo) && (
                                                <h4 className={`fto__page__anime-main_content-header ${pageListViewFocus.episode_list ? 'fto__page__anime-main_content-selected_header' : 'fto__page__anime-main_content-unselected_header'}`}
                                                    onClick={() => {setPageListView(() => {
                                                        if (pageListViewFocus.episode_list === false) {
                                                            return {
                                                                episode_list: true, 
                                                                track_list: (pageListViewFocus.track_list === true) ? false : null,
                                                            };
                                                        }
                                                    })}}>

                                                    Episode List
                                                </h4>
                                            )}
                                            {!IsEmpty(ftoAnimeInfo['track_list']) && (
                                                <h4 className={`fto__page__anime-main_content-header ${pageListViewFocus.track_list ? 'fto__page__anime-main_content-selected_header' : 'fto__page__anime-main_content-unselected_header'}`}
                                                    onClick={() => {setPageListView(() => {
                                                        if (pageListViewFocus.track_list === false) {
                                                            return {
                                                                episode_list: (pageListViewFocus.episode_list === true) ? false : null, 
                                                                track_list: true,
                                                            };
                                                        }
                                                    })}}>
                                                    Track List
                                                </h4>
                                            )}
                                        </div>
                                        <hr />

                                        {// Show Anime Episode List
                                        pageListViewFocus.episode_list && (
                                            <>
                                                {pageEpisodesInfo.map((episodeInfo, it) => {
                                                    return (
                                                        <div className='fto__page__anime-main_content_info_list-row' key={it}>
                                                            <a href={`/anime/${id}/episode/${episodeInfo.episode_no}`}>
                                                                <h3 className='fto__page__anime-main_content_episode_heading'>
                                                                    Episode {episodeInfo.episode_no}
                                                                </h3>
                                                            </a>
                                                        </div>
                                                    )
                                                })}
                                                
                                                {ShowPagination(malAnimeInfo, aniListEpisodeCountInfo, pageEpisodesInfo, spEpisodePageNum)}
                                            </>
                                        )}
                                        {// Show Anime Track List
                                        pageListViewFocus.track_list && (
                                            <>
                                                {(Object.keys(ftoAnimeInfo.track_list).length > 0) ? (
                                                    <>
                                                        {ftoAnimeInfo.track_list.map((trackInfo, it) => {
                                                            return (
                                                                <div className='fto__page__anime-main_content_info_list-row' key={it}>
                                                                    <a href={`/track/${trackInfo.track_id}`}>
                                                                        <h3 className='fto__page__anime-main_content_episode_heading'>
                                                                            {trackInfo.track_name}
                                                                        </h3>
                                                                    </a>
                                                                    <div className='fto__page__anime-main_content_info_list-row_right'>
                                                                        {(!IsEmpty(trackInfo.streaming_platform_links) && typeof(JSON.parse(trackInfo.streaming_platform_links)) === 'object') && 
                                                                            (!IsEmpty(JSON.parse(trackInfo.streaming_platform_links)['data']['spotify']) || !IsEmpty(JSON.parse(trackInfo.streaming_platform_links)['data']['apple_music'])) && (      
                                                                            <FaPlayCircle 
                                                                                className='fto__page__anime-main_content_info_list--track_item-play_icon' 
                                                                                onClick={() => {
                                                                                    setEmbeddedTrackModalVisibility(true); 
                                                                                    setCurrentTrackData(JSON.parse(trackInfo.streaming_platform_links)['data']);
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </>
                                                ) : (
                                                    <p className='fto__page__anime-main_content-no_soundtracks'>
                                                        No Soundtracks Added yet.
                                                    </p>
                                                )}
                                                <br />
                                            </>
                                        )}
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

export default Anime