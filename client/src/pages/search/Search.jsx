import React, {useEffect, useState, createElement} from 'react'
import { createSearchParams, useLocation } from "react-router-dom";
import './search.css';

import { Navbar, Footer, } from "../../components";
import { useCustomNavigate } from './../../routing/navigation'
import { FormatDateToMidDateString, AddSubtitle, GetEpisodeCount} from "../../utils/MalApiUtils"

const Search = () => {
    const location = useLocation();
    const { navigateToSearch, navigateToAnime } = useCustomNavigate();

    const searchParams = new URLSearchParams(location.search);
    const [spQuery, setQuery] = useState(searchParams.get('query') || '');
    const [spPage, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

    const [pageSearchData, setPageSearchData] = useState([]);
    const [paginationData, setPagignationData] = useState({});
    const [mainViewStyle, setViewStyle] = useState({});

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
            if (spPage == null) {
                FetchAnimeList_MAL(spQuery);
            } else {
                FetchAnimeList_MAL(spQuery, spPage);
            }
        }

        // Listen and hanlde for the popstate event (back button or forward press)
        const handlePopstate = () => {
            // When the browser history changes, manually update the component based on the current URL
            const newSearchParams = new URLSearchParams(window.location.search);
            const newQuery = newSearchParams.get('query') || '';
            const newPage = parseInt(newSearchParams.get('page'), 10) || 1;
      
            setQuery(newQuery);
            setPage(newPage);
      
            // Perform search or fetch data based on newQuery and newPage
            FetchAnimeList_MAL(newQuery, newPage);
        };
        window.addEventListener('popstate', handlePopstate);
        return () => {
            // Remove the event listener when the component unmounts
            window.removeEventListener('popstate', handlePopstate);
        };

    }, []);

    // Render (on-pageSearchData-change)
    useEffect(() => {
        // Render (on-pageSearchData-change) 
        if (pageSearchData != null) {
            for (let i = 0; i < pageSearchData.length; i++ ) {
                //console.debug(`PageData[${i}]: (${pageSearchData[i].mal_id}-${pageSearchData[i].title})`);  
            }
        }
        //console.debug(pageSearchData);
    }, [pageSearchData]);

    // Show pagination data from fetch
    const ShowPagination = ( paginationDetails ) => {
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
        
        var pagesElem = createElement(
            'span', 
            {
                className: 'fto__page__search-page_links',
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
                    return createElement('p', {key: `pg_${it}`,}, pageNum);
                }
            })
        );
        return pagesElem;
    }

    // Hanle search page page number change
    const HandleSearchPageChange = (newPage) => {

        // Get the search string and new page number, and change url
        searchParams.set('page', newPage);
        searchParams.set('query', searchParams.get('query'));
        navigateToSearch(`?${searchParams.toString()}`);

        // Fetch data for the new page
        FetchAnimeList_MAL(spQuery, newPage);
    };

    // Show pagination data from fetch
    const ShowResultCount = ( spQuery, paginationDetails ) => {
        if (Object.keys(paginationDetails).length === 0 && paginationDetails.constructor === Object) {
            // If no results, hide pagination
            return createElement('span', {className: 'fto__page__search-result_count'}, createElement('p', null, 'No results'));
        }
        return createElement('span', {className: 'fto__page__search-result_count'}, createElement('p', null, `Showing ${paginationDetails.items.count} results`));
    }

    // Fetch anime asyncronously via MAL Api
    const FetchAnimeList_MAL = async (query, pgNum = 1) => {
        var apiUrl_mal = `https://api.jikan.moe/v4/anime?${createSearchParams({
            q: (query),
            unnaproved: false,
            sfw: true,
            limit: 25,
            page: pgNum,
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
            alert('We do not support shows that have not aired yet.');
            return;
        }

        // Get FTO Anime ID from FTO DB, then navigate to anime page
        FetchAnimeMapping_FTO(malID);
    }
      
    const FetchAnimeMapping_FTO = async (malAnimeID) => {
        let apiUrl_fto = `/getAnimeMappingMAL/${malAnimeID}`;
        console.debug(`Fetch url:, '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
        const response = await fetch(apiUrl_fto)

        const responseStatus = response.status;
        if (responseStatus === 200) {
            const responseData = await response.json();
            if (responseData.length > 0) {
                var animeID = responseData[0].anime_id
    
                // Navigate to the next page with the row ID
                navigateToAnime(animeID);
            }
        }
        else if (responseStatus === 204) {
            // Get Kitsu Mapping, then insert new anime to Fto DB
            FetchAnimeMapping_KITSU(malAnimeID);
        }
        else {
            // TODO Redirect to 'server is down' page
        }
    }

    const FetchAnimeMapping_KITSU = async (malAnimeID) => {
        // Find mapping (if exists) from Kitsu API
        var apiUrl_kitsu = `https://kitsu.io/api/edge/mappings?${createSearchParams({
            'filter[externalSite]': 'myanimelist/anime',
            'filter[externalId]': malAnimeID,
            'include': 'item'
        }).toString()}`;
        console.debug(`Fetch url:, '${apiUrl_kitsu}'`);

        await fetch(apiUrl_kitsu, {
            mode: 'cors',
            })
            .then(response => response.json())
            .then((resObject) => {
                if (resObject.meta.count > 0) {
                    // Get Kitsu ID for anime
                    var kitsuAnimeMappingsArray = resObject.data;
                    var kitsuMappedAnimeObj = kitsuAnimeMappingsArray[0].relationships.item.data;
                    var kitsuAnimeID = kitsuMappedAnimeObj.id;

                    // Insert Anime into DB and return new fto anime id
                    let apiUrl_fto = `/postAnimeIntoDB/${malAnimeID}/${kitsuAnimeID}`;
                    console.debug(`Fetch url:, '${apiUrl_fto}'`);
                    fetch(apiUrl_fto)
                        .then(response => response.json())
                        .then(response => {
                            var affectedRows = response.affectedRows;
                            if (affectedRows === 1) {
                                var insertedAnimeId = response.insertId;
                                navigateToAnime(insertedAnimeId);
                            }
                            else {
                                console.error(`An error occurred inserting new anime with mal_id(${malAnimeID}) and kitsu_id(${kitsuAnimeID}}`);
                                console.error(response)
                            }
                        });
                }
                else {
                    // Insert Anime into DB (without kitsu) and return new fto anime id
                    let apiUrl_fto = `/postAnimeIntoDB/${malAnimeID}`;
                    console.debug(`Fetch url:, '${apiUrl_fto}'`);
                    fetch(apiUrl_fto)
                        .then(response => response.json())
                        .then(response => {
                            var affectedRows = response.affectedRows;
                            if (affectedRows === 1) {
                                var insertedAnimeId = response.insertId;
                                navigateToAnime(insertedAnimeId);
                            }
                            else {
                                console.error(`An error occurred inserting new anime with mal_id(${malAnimeID}) and kitsu_id(${kitsuAnimeID}}`);
                                console.error(response)
                            }
                        });
                }
            });
    }

    return (
        <div className='fto__page__search'>
            <div className='gradient__bg'>
                <Navbar />
                
                <div className='fto__page__search-content section__padding' style={mainViewStyle}>
                    <h1 className='gradient__text'>
                        Searched for '{spQuery}'
                    </h1>

                    <div className='fto__page__search-content_page_details'>
                        {ShowResultCount(spQuery, paginationData)}
                        {ShowPagination(paginationData)}
                    </div>

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
                                            <img width={66} height={100} src={animeInfo.images.jpg.image_url} alt="Anime Thumbnail" />
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
                                        <td>{GetEpisodeCount(animeInfo.status, animeInfo.episodes, animeInfo.mal_id)}</td>
                                        <td>Count</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                </div>
            </div>
		    <Footer />
        </div>
    )
}


export default Search