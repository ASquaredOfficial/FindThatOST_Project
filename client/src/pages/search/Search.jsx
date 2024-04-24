import React, {useEffect, useState, createElement} from 'react'
import { createSearchParams, useLocation } from "react-router-dom";
import './search.css';

import { Navbar, Footer, } from "../../components";
import { useCustomNavigate } from './../../routing/navigation'
import { FormatDateToMidDateString, AddSubtitle, GetEpisodeCount} from "../../utils/MalApiUtils"
import { IsEmpty } from '../../utils/RegularUtils';
import { toast } from 'react-toastify';

const Search = ({
    SignInFunction,
    SignOutFunction,
    user_properties = {
        userId: null, 
        username: null
    }
}) => {
    const location = useLocation();
    const { navigateToSearch, navigateToAnime } = useCustomNavigate();

    const searchParams = new URLSearchParams(location.search);
    const [spQuery, setQuery] = useState(searchParams.get('query') || '');
    const [spPage, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

    const [pageSearchData, setPageSearchData] = useState([]);
    const [paginationData, setPagignationData] = useState({});
    const [mainViewStyle, setViewStyle] = useState({});
    const [mobileView, setMobileView] = useState(false);
    const supportedAnimeTypesMAL = [
        'tv', // Refers to television series anime, which are episodic and typically broadcast on television.
        'movie', // Refers to anime movies, which are standalone films with a longer runtime compared to TV episodes.
        'ova',  // Stands for Original Video Animation, which are anime released directly to video without prior broadcast.
        'special', // Refers to special episodes or one-off releases that may accompany a TV series or OVA.
        'ona', // Stands for Original Net Animation, which are anime distributed over the internet.
        'tv_special', // Refers to special episodes or one-off releases specifically related to television series.
    ];

    // Render (onMount)
    useEffect(() => {
        console.debug(`Render-Search (onMount): ${window.location.href}`);  
        if (spQuery == null || !spQuery) {
            alert('No query was performed. Search appropriate anime name');
            setViewStyle({ height: '100vh', justifyContent: 'flex-start'});
        } else if (spQuery.length <= 3) {
            alert("Enter search longer than 3 characters")
            setViewStyle({ height: '100vh', justifyContent: 'flex-start'});
        } else {
            if (spPage == null || spPage < 1) {
                FetchAnimeList_MAL(spQuery, supportedAnimeTypesMAL);
                document.title = `Search | '${spQuery}'`;
            } else {
                FetchAnimeList_MAL(spQuery, supportedAnimeTypesMAL, spPage);
                document.title = `Search | '${spQuery}' | Page ${spPage}`;
            }
        }

        const handleResize = () => {
            const width = window.innerWidth;
            // Update media size based on the window width
            if (width < 700 /*px*/) {
                setMobileView(true);
            } else {
                setMobileView(false);
            }
        };
        // Listen and hanlde for the popstate event (back button or forward press)
        const handlePopstate = () => {
            // When the browser history changes, manually update the component based on the current URL
            const newSearchParams = new URLSearchParams(window.location.search);
            const newQuery = newSearchParams.get('query') || '';
            const newPage = parseInt(newSearchParams.get('page'), 10) || 1;
      
            setQuery(newQuery);
            setPage(newPage);
      
            // Perform search or fetch data based on newQuery and newPage
            FetchAnimeList_MAL(newQuery, supportedAnimeTypesMAL, newPage);
        };

        // Initial call and event listener setup
        handleResize();
        window.addEventListener('popstate', handlePopstate);
        window.addEventListener('resize', handleResize);
        
        // Cleanup the event listener on component unmount
        return () => {
            // Remove the event listener when the component unmounts
            window.removeEventListener('popstate', handlePopstate);
            window.removeEventListener('resize', handleResize);
        };

    }, []);

    useEffect(() => {
        // Render (on-pageSearchData-change) 
        if (!IsEmpty(pageSearchData) && pageSearchData.length > 0) {
            // If track_count hasn't added been already
            if (IsEmpty(pageSearchData[0].track_count)) {
                // Get song count and append to pageSearchData
                let listMalAnimeIDs = []
                for (let i = 0; i < pageSearchData.length; i++ ) { // At most 25, set by pagination limit
                    //console.debug(`PageData[${i}]: (${pageSearchData[i].mal_id}-${pageSearchData[i].title})`);  
                    listMalAnimeIDs.push(pageSearchData[i].mal_id);
                }
                FetchAnimeSongCount_FTO(listMalAnimeIDs);
            }
            else {
                console.log("New PageData:", pageSearchData)
            }
        }
        //console.debug(pageSearchData);
    }, [pageSearchData]);

    // Show pagination data from fetch
    const ShowPagination = ( paginationDetails, bIsMobileView = false) => {
        if (Object.keys(paginationDetails).length === 0 && paginationDetails.constructor === Object) {
            // If no results, hide pagination
            return;
        }
        let nFirstPage = 1;
        let nCurrentPage = paginationDetails.current_page;
        let nLastPage = paginationDetails.last_visible_page;
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
        pageList.push(`${nCurrentPage}`);
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
            (!bIsMobileView) ? 'span' : 'div', 
            {
                className: (!bIsMobileView) ? 'fto__page__search-page_links': 'fto__page__search-mobile_page_links',
            },
            pageList.map((pageNum, it) => {
                if (typeof pageNum == "number") {
                    return createElement(
                        'a', 
                        {
                            key: `pg_${it}`, 
                            onClick:() => HandleSearchPageChange(pageNum),
                        }, 
                        pageNum,
                    );
                } else {
                    if (!bIsMobileView) {
                        return createElement('p', {key: `pg_${it}`,}, pageNum);
                    }
                    else {
                        return createElement(
                            'a', 
                            {
                                key: `pg_${it}`, 
                                className: 'active',
                            }, 
                            pageNum,
                        );
                    }
                    
                }
            })
        );
        return pagesElem;
    }

    // Hanle search page page number change
    const HandleSearchPageChange = (newPageNum) => {

        // Get the search string and new page number, and change url
        navigateToSearch(spQuery, newPageNum);

        // Fetch data for the new page
        FetchAnimeList_MAL(spQuery, newPageNum);
    };

    // Show pagination data from fetch
    const ShowResultCount = ( paginationDetails ) => {
        if (Object.keys(paginationDetails).length === 0 && paginationDetails.constructor === Object) {
            // If no results, hide pagination
            return createElement('span', {className: 'fto__page__search-result_count'}, createElement('p', null, 'No results'));
        }
        return createElement('span', {className: 'fto__page__search-result_count'}, createElement('p', null, `Showing ${paginationDetails.items.count} results`));
    }

    // Fetch anime asyncronously via MAL Api
    const FetchAnimeList_MAL = async (query, animeTypesToSearch, pgNum = 1) => {
        let apiUrl_mal = `https://api.jikan.moe/v4/anime?${createSearchParams({
            q: (query),
            unnaproved: false,
            sfw: true,
            limit: 25,
            page: pgNum,
            // type: (animeTypesToSearch.join(',')),
        }).toString()}`;
        console.debug(`Fetch url:, '${apiUrl_mal}'`);
        
        const response = await fetch(apiUrl_mal);
        const responseJson = await response.json();
        console.log("Response", responseJson)
        if (responseJson.status === undefined || responseJson.status !== 500) {
            setPageSearchData(responseJson.data);
            setPagignationData(responseJson.pagination);
            setViewStyle({ height: 'auto', justifyContent: 'flex-center' });
        }
        else {
            console.log("Response Status", responseJson.status);
            console.error("An errror occurred with the Jikan API fetch request.")
            // Jikan API failed, use different API
            /* This API needs the use of a redirect to get an Access token, perhaps use KITSU API as a backup
            * 
            console.debug(`Fetch (Jikan API) Failed. Reattempting using offial MAL API`);
            apiUrl_mal = `https://api.myanimelist.net/v2/anime?${createSearchParams({
                q: (query),
                fields: 'start_date, main_picture, num_episodes, media_type, status',
                limit: 25,
                offset: (pgNum-1) * 25,
            })}`;
            console.debug(`Fetch url:, '${apiUrl_mal}'`);

            const response = await fetch(apiUrl_mal, {
                method: 'post',
                mode: 'no-cors',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'X-MAL-CLIENT-ID': 'e09bf7d461e98e3280ae4b21b093f4af',
                }), 
            });
            console.log("Response", response);
            //const responseJson = await response.json();
            //console.log("Response", responseJson);
            */
        }
    }

    const HandleSearchRowOnclick = (malID, malAnimeInfo) => {
        if (malAnimeInfo.status === 'Not yet aired') {
            toast('We do not support shows that have not aired yet.');
            return;
        }
        else if (!supportedAnimeTypesMAL.includes(String(malAnimeInfo.type).toLowerCase())){
            toast('This not a supported anime type.');
            return
        }

        // Get FTO Anime ID from FTO DB, then navigate to anime page
        console.log("Go to anime with mal id:", malID)
        FetchAnimeMapping_FTO(malID, malAnimeInfo.title);
    }
      
    const FetchAnimeMapping_FTO = async (malAnimeID, strMalAnimeTitle = '') => {
        let apiUrl_fto = `/findthatost_api/anime/mal_mapping/${malAnimeID}`;
        console.debug(`Fetch url:, '${apiUrl_fto}'`);
        try {
            const response = await fetch(apiUrl_fto);
    
            const responseStatus = response.status;
            if (responseStatus === 200) {
                const responseData = await response.json();
                if (responseData.length > 0) {
                    let animeID = responseData[0].anime_id;
        
                    // Navigate to the next page with the row ID
                    console.log("Navigate to anime:", animeID);
                    navigateToAnime(animeID);
                }
            }
            else if (responseStatus === 204) {
                // Get Kitsu Mapping, then insert new anime to Fto DB
                Fetch_FTO_PostAnimeMapping(malAnimeID, strMalAnimeTitle);
                FetchAnimeMapping_KITSU(malAnimeID);
            }
            else {
                // TODO Redirect to 'server is down' page. I.e. status is 500
            }
        }
        catch (error) {
            toast('An internal error has occurred with the FindThatOST server. Please try again later.');
            throw new Error(`Error fetching data mapping in backend.\nError message: ${error}\nFetch url: ${apiUrl_fto}`);
        }
    }

    const Fetch_FTO_PostAnimeMapping = async (malAnimeID, strMalAnimeTitle) => {
        const kitsuMappingResponse = await FetchAnimeMapping_KITSU(malAnimeID);
        if (kitsuMappingResponse.meta.count > 0) {
            // Get Kitsu ID for anime
            let kitsuAnimeMappingsArray = kitsuMappingResponse.data;
            let kitsuMappedAnimeObj = kitsuAnimeMappingsArray[0].relationships.item.data;
            let kitsuAnimeID = kitsuMappedAnimeObj.id;

            // Insert Anime into DB and return new fto anime id
            let apiUrl_fto = `/findthatost_api/anime/mal_anime_id/${malAnimeID}/kitsu_anime_id/${kitsuAnimeID}`;
            console.debug(`Fetch post anime context to backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
            
            try {
                const postResponse = await fetch(apiUrl_fto, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ strMalAnimeTitle }),
                });
                const postResponseJson = await postResponse.json();

                let affectedRows = postResponseJson.affectedRows;
                if (affectedRows === 1) {
                    let insertedAnimeId = postResponseJson.insertId;
                    navigateToAnime(insertedAnimeId);
                }
                else {
                    throw new Error(`An error occurred inserting new anime '${strMalAnimeTitle} 'with mal_id(${malAnimeID}) and kitsu_id(${kitsuAnimeID}. Post Response:`, postResponseJson);
                }
            }
            catch (err) {
                toast('An internal error has occurred with the FindThatOST server. Please try again later.');
                console.error("Error:", err);
            }
        }
        else {
            // Insert Anime into DB (without kitsu) and return new fto anime id
            let apiUrl_fto = `/findthatost_api/anime/mal_anime_id/${malAnimeID}`;
            console.debug(`Fetch post anime context to backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
            
            try {
                const postResponse = await fetch(apiUrl_fto, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ strMalAnimeTitle }),
                });
                const postResponseJson = await postResponse.json();

                let affectedRows = postResponseJson.affectedRows;
                if (affectedRows === 1) {
                    let insertedAnimeId = postResponseJson.insertId;
                    navigateToAnime(insertedAnimeId);
                }
                else {
                    toast('An internal error has occurred with the FindThatOST server. Please try again later.');
                    console.error(`An error occurred inserting new anime with mal_id(${malAnimeID})`);
                    console.error(postResponseJson)
                }
            }
            catch (err) {
                toast('An internal error has occurred with the FindThatOST server. Please try again later.');
                console.error("Error:", err);
            }
        }
    }

    const FetchAnimeMapping_KITSU = async (malAnimeID) => {
        // Find mapping (if exists) from Kitsu API
        let apiUrl_kitsu = `https://kitsu.io/api/edge/mappings?${createSearchParams({
            'filter[externalSite]': 'myanimelist/anime',
            'filter[externalId]': malAnimeID,
            'include': 'item'
        }).toString()}`;
        console.debug(`Fetch url:, '${apiUrl_kitsu}'`);

        const responseKitsu =  await fetch(apiUrl_kitsu, {
            mode: 'cors',
        });
        const kitsuResponseJson = responseKitsu.json();
        return kitsuResponseJson;
    }

    const FetchAnimeSongCount_FTO = async (listMalAnimeIds) => {
        let apiUrl_fto = `/findthatost_api/anime/anime_list_track_counts/post_mal_ids`;
        console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
        const response = await fetch(apiUrl_fto, 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ listMalAnimeIds }),
        });

        const responseStatus = response.status;
        console.log("Response status:", responseStatus);
        // setQueryStatusCode(responseStatus);

        const responseData = await response.json();
        console.debug("Response Data:", responseData);
        if (responseStatus === 200) {
            const listOftrackCounts = responseData.data.map(arr => {
                return arr[0];
            })
            
            setPageSearchData(originalArray => originalArray.map(item => {
                const trackCountObject = listOftrackCounts.find(obj => obj.mal_id === item.mal_id);
                if (trackCountObject) {
                  return { ...item, track_count: trackCountObject.track_count };
                }
                else {
                    return { ...item, track_count: 0 };
                }
            }))
        }
        else {
            toast('An internal error has occurred with the FindThatOST server. Please try again later.');
            throw new Error('Error fetching data in backend. Error:', responseData);
        }
    }

    return (
        <div className='fto__page__search'>
            <div className='gradient__bg'>
                <Navbar 
                    SignInFunction={SignInFunction} 
                    SignOutFunction={SignOutFunction} 
                    user_properties={user_properties} />
                
                <div className='fto__page__search-content section__padding' style={mainViewStyle}>
                    <h1 className='gradient__text'>
                        Searched for '{spQuery}'
                    </h1>

                    <div className='fto__page__search-content-share_line'>
                        {ShowResultCount(paginationData)}
                        {(!mobileView) && 
                            ShowPagination(paginationData) 
                        }
                    </div>

                    {(!mobileView) ? ( 
                        <table className='fto__page__search-content_search_table' >
                            <thead>
                                <tr><td colSpan='100%'><hr /></td></tr>
                                <tr>
                                    <th colSpan={2}>Title</th>
                                    <th>Air Status</th>
                                    <th>Air Date</th>
                                    <th>Show Type</th>
                                    <th>Episode Count</th>
                                    <th>Song Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td colSpan='100%'><hr /></td></tr>
                                {pageSearchData.map((animeInfo, it) => {
                                    return (
                                        <tr key={it}>
                                            <td onClick={() => HandleSearchRowOnclick(animeInfo.mal_id, animeInfo)}>
                                                <img width={100} height={150} src={animeInfo.images.jpg.image_url} alt="Anime Thumbnail" />
                                            </td>
                                            <td>
                                                <p className='fto__page__search-content_default_title' onClick={() => HandleSearchRowOnclick(animeInfo.mal_id, animeInfo)}>
                                                    {animeInfo.title}
                                                </p>
                                                {AddSubtitle(animeInfo.titles)}
                                                <p className='fto__page__search-content_synopsis'>{animeInfo.synopsis}</p>
                                            </td>
                                            <td>{animeInfo.status}</td>
                                            <td>{FormatDateToMidDateString(animeInfo.aired.from)}</td>
                                            <td>{animeInfo.type}</td>
                                            <td>
                                                {
                                                    IsEmpty(GetEpisodeCount(animeInfo.status, animeInfo.episodes, animeInfo.mal_id)) ? '-' : 
                                                    GetEpisodeCount(animeInfo.status, animeInfo.episodes, animeInfo.mal_id)
                                                }
                                            </td>
                                            <td>{IsEmpty(animeInfo.track_count) ? '-' : animeInfo.track_count}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <>
                        <hr className='fto_horizontal_hr' />
                        {pageSearchData.map((animeInfo, it) => {
                            return (
                                <div key={it} className='fto__page__search-content_mobile_view_item'>
                                    <div key={it}  className='fto__page__search-content_mobile_view-row'
                                        onClick={() => HandleSearchRowOnclick(animeInfo.mal_id, animeInfo)}>
                                        <div className="fto__page__search-content_mobile_view-overlay"></div>
                                        <img width={100} height={150} src={animeInfo.images.jpg.image_url} alt="Anime Thumbnail" />
                                        <div className='fto__page__search-content_mobile_view-details_column'>
                                            <p className='fto__page__search-content_default_title'>
                                                {animeInfo.title}
                                            </p>
                                            <p>{IsEmpty(animeInfo.track_count) ? '-' : animeInfo.track_count + ' track(s)'}</p>

                                            <div className='fto__page__search-content_mobile_view-align_bottom'>                                                
                                                <div className='fto__page__search-content-share_line'>
                                                    <p><i>{animeInfo.status}</i></p>
                                                    <p><i>{animeInfo.type}</i></p>
                                                </div>
                                                <div className='fto__page__search-content-share_line'>
                                                    <p>{FormatDateToMidDateString(animeInfo.aired.from)}</p>
                                                    <p>
                                                        {
                                                            IsEmpty(GetEpisodeCount(animeInfo.status, animeInfo.episodes, animeInfo.mal_id)) ? '-' : 
                                                            GetEpisodeCount(animeInfo.status, animeInfo.episodes, animeInfo.mal_id) + ' Episode(s)'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <hr className='fto_horizontal_hr' />
                                </div>
                            )
                        })}
                        </>
                    )}
                    <div className='fto__page__search-content-pagination'>
                        {ShowPagination(paginationData, true)}
                    </div>

                </div>
            </div>
		    <Footer />
        </div>
    )
}


export default Search