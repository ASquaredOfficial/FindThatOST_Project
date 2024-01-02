import React, {useEffect, useState, createElement} from 'react';
import { useLocation, useParams } from "react-router-dom";
import './anime.css';

import { Navbar, Footer} from "../../components";
import { useCustomNavigate } from './../../routing/navigation'
import { AreDefaultAndEnglishTitlesDifferent, ParseAnimePosterImage } from "../../utils/MalApiUtils"
import { ParseClassName } from "../../utils/RegularUtils"

const Anime = () => {
    const location = useLocation();
    const { id } = useParams();
    const { navigateToAnime } = useCustomNavigate();

    const searchParams = new URLSearchParams(location.search);
    const [ spEpisodePageNum, setEpisodePageNum ] = useState(parseInt(searchParams.get('episode_page_no'), 10) || 1);
    
    const [ ftoAnimeInfo, setFTOAnimeInfo ] = useState();
    const [ malAnimeInfo, setMALAnimeInfo ] = useState();
    const [ aniListEpisodeCountInfo, setAniListEpisodeCountInfo ] = useState();

    const [ malAnimeTitles, setAnimeTitles ] = useState();
    const [ malAnimeRelations, setAnimeRelations ] = useState();
    const [ pageEpisodeInfo, setPageEpisodesInfo ] = useState();

    useEffect(() => {
        console.debug(`Render-Anime (onMount): ${location.href}`);    
        
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
            var arrMalAnimeTitles = malAnimeInfo.titles;
            const objMalAnimeTitles = arrMalAnimeTitles.reduce((result, item) => {
                if (item.type) {
                  result[item.type] = item.title || null;
                }
                return result;
            }, {});
            setAnimeTitles(objMalAnimeTitles);

            // Process MAL API Anime Relations to output to display
            let arrMalAllAnimeRelations = [];
            var arrMalAnimeRelations = malAnimeInfo.relations;
            arrMalAnimeRelations.map(animeRelation => {
                let animeRelationEntries = animeRelation.entry;
                let animeRelationType = animeRelation.relation;

                for (var it = 0; it < Object.keys(animeRelationEntries).length; it++) {
                    var item = animeRelationEntries[it];
                    if (item.type == 'anime') {
                        item.relation = animeRelationType;
                        arrMalAllAnimeRelations.concat(item);
                    }
                }
            })
            setAnimeRelations(arrMalAllAnimeRelations);
       
            if (ftoAnimeInfo !== undefined) {
                FetchUpdateAnimeData_FTO(id, malAnimeInfo);
            }

            // Get Episode Info
           FetchEpisodeData(malAnimeInfo, spEpisodePageNum);
        }
    }, [malAnimeInfo]);

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
    
    const FetchFullAnimeData_MAL = async (dataFromBackend) => {
        try {
            var malID = dataFromBackend[0].mal_id;
            var apiUrl_mal = `https://api.jikan.moe/v4/anime/${malID}/full`;
            console.debug(`Fetch data from External API, url: '${apiUrl_mal}'`);
            const response = await fetch(apiUrl_mal);
            const externalData = await response.json();
            return externalData;
        } catch (error) {
            throw new Error('Error fetching data from external API (MyAnimeList)');
        }
    }
    
    const FetchFullAnimeData_AniList = async (dataFromBackend) => {
        try {
            var malID = dataFromBackend.mal_id;

            //var apiUrl_aniList = `https://api.jikan.moe/v4/anime/${malID}/full`;
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
            if (error.message != '') {
                console.error("Error messsage:", error.message)
            }
            throw new Error('Error fetching data from external API (AniList)');
        }
    }

    const FetchEpisodeData = async (malAnimeDetails, ftoEpisodePageNum = 1) => {
        //Asuming each page on FTO anime page has 20 episodes
        var episodeCount = malAnimeDetails.episodes;
        var latestEpisodeNumber = episodeCount;
        var airStatus = malAnimeDetails.status;

        if (airStatus !== 'Not yet aired') {
            if (airStatus == 'Currently Airing') {
                // Get episode count and latest episode numusing AniList API
                try {
                    const dataFromExternalAPI_AniList = await FetchFullAnimeData_AniList(malAnimeDetails);
                    console.log('Data from external AniList API:', dataFromExternalAPI_AniList);
                    setAniListEpisodeCountInfo(dataFromExternalAPI_AniList);
                    latestEpisodeNumber = dataFromExternalAPI_AniList.data.Media.nextAiringEpisode.episode - 1;
                } catch (error) {
                    console.error('Error:', error.message);
                }
            }

            const malPageEpisodes = await FetchEpisodeData_MAL(malAnimeDetails.mal_id, ftoEpisodePageNum);

            var startEpisode = 1 + ((ftoEpisodePageNum - 1) * 20);
            const kitsuPageEpisodes = await FetchEpisodeData_KITSU(ftoAnimeInfo.kitsu_id, startEpisode);

            const episodesInfo = [];
            var endEpisode = (ftoEpisodePageNum * 20 < latestEpisodeNumber) ? ftoEpisodePageNum * 20 : latestEpisodeNumber;
            var loopEnd = (endEpisode%20 == 0) ? 20 : endEpisode%20;
            for (var it = 0; it < loopEnd; it++) {
                var epInfo = {};
                var episodeTitleEn = '';
                var episodeNumber = startEpisode + it;
                epInfo.episode_no = episodeNumber;
                
                if (malPageEpisodes.length > (episodeNumber%100)-1) {
                    var malEpisodeinfo = malPageEpisodes[(episodeNumber%100)-1];
                    epInfo.mal_episode_id = malEpisodeinfo.mal_id;
                    if (malEpisodeinfo.title != '') {
                        episodeTitleEn = malEpisodeinfo.title;
                    }
                }
                if (kitsuPageEpisodes.length > (episodeNumber%100)-1) {
                    var kitsuEpisodeinfo = kitsuPageEpisodes[it];
                    epInfo.kitsu_episode_id = Number(kitsuEpisodeinfo.id);
                    if (kitsuEpisodeinfo.attributes.titles.en_us !== '') {
                        episodeTitleEn = (episodeTitleEn == '') ? kitsuEpisodeinfo.attributes.titles.en_us : episodeTitleEn;
                    }
                }
                epInfo.title = episodeTitleEn;
                episodesInfo.push(epInfo);
            }
            setPageEpisodesInfo(episodesInfo);
        }
    }

    const FetchEpisodeData_MAL = async (malAnimeID, pageNum) => {
        try {
            //Finished aring, check if mal has individual episode details
            var malToFtoRangeSize = 5;
            var malEpisodeQueryPage = (pageNum + malToFtoRangeSize - 1) / malToFtoRangeSize | 0;
            let apiUrl_mal = `https://api.jikan.moe/v4/anime/${malAnimeID}/episodes?page=${malEpisodeQueryPage}`;
            console.debug(`Fetch Episode data from External API, MAL url: '${apiUrl_mal}'`);
            const response_mal = await fetch(apiUrl_mal);
            const responseData_mal = await response_mal.json();
            return responseData_mal.data;
        }
        catch (error) {
            throw new Error('Error fetching episode data from external API (MyAnimeList)');
        }
    }

    const FetchEpisodeData_KITSU = async (kitsuAnimeID, pageOffset) => {
        try {
            if (kitsuAnimeID != -1 || (kitsuAnimeID == null)) {
                let apiUrl_kitsu = `https://kitsu.io/api/edge/anime/${kitsuAnimeID}/episodes?page[limit]=20&page[0ffset]=${pageOffset}`;
                console.debug(`Fetch Episode data from External API, Kitsu url: '${apiUrl_kitsu}'`);
                const response_kitsu = await fetch(apiUrl_kitsu);
                const responseData_kitsu = await response_kitsu.json();
                return responseData_kitsu.data;
            }
            return []
        }
        catch (error) {
            throw new Error('Error fetching episode data from external API (Kitsu)');
        }
    }

    const FetchUpdateAnimeData_FTO = async (ftoID, malAnimeDetails) => {
        try {
            // Get Prequel Anime in FTO DB (if present)
            var ftoPrequelAnimeID = 0;
            var arrMalAnimeRelations = malAnimeInfo.relations;
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
            var ftoCanonicalTitle = (!bUpdateCanonicalTitle) ? '' : malAnimeInfo.titles[0].title;;
            
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

    const FetchPageData = async (pageId) => {
        try {
            // Fetch data from the backend
            const dataFromBackend = await FetchAnimeData_FTO(pageId);
        
            // Use data from the backend to make the second fetch to the external API
            const dataFromExternalAPI_MAL = await FetchFullAnimeData_MAL(dataFromBackend);
        
            console.log('Data from backend:', dataFromBackend);
            console.log('Data from external MAL API:', dataFromExternalAPI_MAL);
            setFTOAnimeInfo(dataFromBackend[0]);
            setMALAnimeInfo(dataFromExternalAPI_MAL.data);
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    // Show pagination data from fetch
    const ShowPagination = ( malAnimeDetails, anilistEpisodeDetails, pageEpisodeDetails, ftoEpisodePageNum = 1) => {
        // If no results, hide pagination
        if (Object.keys(malAnimeDetails).length === 0 && malAnimeDetails.constructor === Object) {
            return;
        }
        else if (malAnimeDetails.status == 'Currently Airing' && anilistEpisodeDetails == undefined) {
            return;
        }
        if (pageEpisodeDetails.length == 0) {
            return;
        }

        var latestEpisodeNumber = (malAnimeDetails.status == 'Currently Airing') ? 
            anilistEpisodeDetails.data.Media.nextAiringEpisode.episode - 1 : malAnimeDetails.episodes;

        var nFirstPage = 1;
        var nCurrentPage = ftoEpisodePageNum;
        var nLastPage = Math.ceil(latestEpisodeNumber / 20);
        var pageList = [];

        if (nCurrentPage - 3  >= nFirstPage) {
            // Show prev 2 pages nos
            // Show ellipsize and first page
            pageList.push(nFirstPage)
            pageList.push('…')
            pageList.push(nCurrentPage - 2)
            pageList.push(nCurrentPage - 1)
        } else if (nCurrentPage - 3  < nFirstPage) {
            // Show rest of previous pages
            var nPageNo = nFirstPage;
            while (nPageNo != nCurrentPage) {
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
            if (nCurrentPage != nLastPage) {
                var nPageNo = nCurrentPage;
                while (nPageNo != nLastPage) {
                    nPageNo = nPageNo + 1;
                    pageList.push(nPageNo);
                }
            }
        }
        
        var pagesElem = createElement(
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

    // Hanle episode list page number change
    const HandleEpiosdeListPageChange = (newPageNum) => {

        // Get the search string and new page number, and change url
        searchParams.set('episode_page_no', newPageNum);
        navigateToAnime(`${id}?${searchParams.toString()}`);
        setEpisodePageNum(newPageNum);

        // Fetch episode info for the new page
        FetchEpisodeData(malAnimeInfo, newPageNum);
        window.scrollTo(0, 0)
    };

    const HandleEpisodeRowOnClick = (episodeDetails) => {

    }

    return (
        <div className='fto__page__anime'>
            <div className='gradient__bg'>
                <Navbar />

                {malAnimeInfo !== undefined && (
                    <div className='fto__page__anime-content section__padding' style={{paddingBottom: 0}}>
                        <div className='fto__page__anime-content_heading_section'>
                            <h1 className='fto__page__anime-content_header_title gradient__text'>
                                {malAnimeInfo.titles[0].title}
                            </h1>
                            
                            {AreDefaultAndEnglishTitlesDifferent(malAnimeInfo.titles) && (
                                <h1 className='fto__page__anime-content_header_subtitle'><strong>{malAnimeTitles !== undefined && ( malAnimeTitles.English )}</strong></h1>
                            )}
                        </div>
                        <hr className='fto__page__anime-horizontal_hr' />
                        
                        <div className='fto__page__anime-main_content'>
                            <div className='fto__page__anime-main_content_left'>
                                <img alt='Anime Image' className='fto__page__anime-main_content_left-anime_image' src={ParseAnimePosterImage(malAnimeInfo)}/>
                                
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
                                                (animeRelations.relation == 'Prequel' || animeRelations.relation == 'Sequel') && (
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

                                {// Show Anime Episode List
                                pageEpisodeInfo !== undefined && (
                                    <div className='fto__page__anime-main_content_episode_list'>
                                        <h4 className='fto__page__anime-main_content-header'>Episode List</h4>
                                        <hr />

                                        {pageEpisodeInfo.map((episodeInfo, it) => {
                                            return (
                                                <div className='fto__page__anime-main_content_episode_list-row' key={it}>
                                                    <h3 className='fto__page__anime-main_content_episode_heading' onClick={() => {HandleEpisodeRowOnClick(episodeInfo)}}>
                                                        Episode {episodeInfo.episode_no}
                                                    </h3>
                                                </div>
                                            )
                                        })}
                                        
                                        {ShowPagination(malAnimeInfo, aniListEpisodeCountInfo, pageEpisodeInfo, spEpisodePageNum)}
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