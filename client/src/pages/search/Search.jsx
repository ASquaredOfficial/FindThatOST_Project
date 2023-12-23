import React, {useEffect, useState, createElement} from 'react'
import { createSearchParams, useLocation } from "react-router-dom";
import './search.css';

import { Navbar, Footer, } from "../../components";
import { useCustomNavigate } from './../../routing/navigation'
import default_img from '../../assets/default_image_square.png';
import { FormatDateToMidDateString, AddSubtitle, GetEpisodeCount} from "../../utils/MalApiUtils"

const Search = () => {
    const location = useLocation();
    const { navigateToSearch } = useCustomNavigate();

    const searchParams = new URLSearchParams(location.search);
    const [spQuery, setQuery] = useState(searchParams.get('query') || '');
    const [spPage, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

    const [pageSearchData, setPageSearchData] = useState([]);
    const [paginationData, setPagignationData] = useState({});
    const [mainViewStyle, setViewStyle] = useState({});

    // Render (onMount)
    useEffect(() => {
        console.log(`Render-Search (onMount): ${location.href}`);   
        console.log(`Render-Search_Query: '${spQuery}'`);   
        console.log(`Render-Search_Page: '${spPage}'`);   

        if (spQuery == null || !spQuery) {
            // Do something
            console.error('No query. Show appropriate warning');
            setViewStyle({ height: '100vh', justifyContent: 'flex-start'});
        } else if (spQuery.length <= 3) {
            alert("Enter search longer than 3 characters")
            setViewStyle({ height: '100vh', justifyContent: 'flex-start'});
        } else {
            if (spPage == null) {
                FetchAnime(spQuery);
            } else {
                FetchAnime(spQuery, spPage);
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
            // You may need to adjust this logic based on your specific requirements
            FetchAnime(newQuery, newPage);
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
        console.log("Pagination Details");
        console.log(paginationDetails);
        if (Object.keys(paginationDetails).length === 0 && paginationDetails.constructor === Object) {
            // If no results, hide pagination
            console.log("No Pages");
            return;
        }
        var nFirstPage = 1;
        var nCurrentPage = paginationDetails.current_page;
        var nLastPage = paginationDetails.last_visible_page;
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
        console.debug("Full Pages Array", pageList);
        
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
                        //<Link to={`/search?data=${encodeURIComponent(spQuery)}&page=${pageNum}`}>{pageNum}</Link>,
                        //<NavLink href="#x"><Link id="RouterNavLink" to={window.location.origin+`/search?data=${encodeURIComponent(spQuery)}&page=${pageNum}`}>{pageNum}</Link></NavLink>
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
        console.debug('Change Page to pg', newPage)

        // Get the search string and new page number, and change url
        searchParams.set('page', newPage);
        searchParams.set('query', searchParams.get('query'));
        navigateToSearch(`?${searchParams.toString()}`);

        // Fetch data for the new page
        FetchAnime(spQuery, newPage);
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
    const FetchAnime = async (query, pgNum = 1) => {
        var url = `https://api.jikan.moe/v4/anime?${createSearchParams({
            q: (query),
            unnaproved: false,
            sfw: true,
            limit: 25,
            page: pgNum,
        }).toString()}`;
        console.log(`Fetch url:, '${url}'`);
        
        const response = await fetch(url, {
            mode: 'cors',
            })
            .then(response => response.json())
            .then((resObject) => {
                setPageSearchData(resObject.data);
                setPagignationData(resObject.pagination);
                setViewStyle({ height: 'auto', justifyContent: 'flex-center' });
            })
        //console.debug(`PageData: ${response}`
    }

    const HandleSearchRowOnclick = (malID) => {
        // Navigate to the next page with the row ID
        console.log("Go to anime post")
        navigate('');
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
                                        <td onClick={() => HandleSearchRowOnclick(animeInfo.mal_id)}>
                                            <img width={66} height={100} src={animeInfo.images.jpg.image_url} alt="Anime Image" />
                                        </td>
                                        <td>
                                            <p className='fto__page__search-content_default_title' onClick={() => HandleSearchRowOnclick(animeInfo.mal_id)}>
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