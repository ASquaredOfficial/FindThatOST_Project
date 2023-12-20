import React, {useEffect, useState} from 'react'
import { createSearchParams} from "react-router-dom";
import './search.css';

import { Navbar, Footer, } from "../../components";
import default_img from '../../assets/default_image_square.png';
import { FormatDateToMidDateString, AddSubtitle, GetEpisodeCount} from "../../utils/MalApiUtils"

const Search = () => {
    const searchString = new URLSearchParams(location.search).get('data');
    const [pageData, setPageData] = useState([]);

    useEffect(() => {
        // Render (onMount)
        console.log(`Render-Search (onMount): ${location.href}`);   
        console.log(`Search-String: ${searchString}`);  

        if (searchString == null) {
            // Do something
        } else if (searchString.length <= 3) {
            alert("Enter search longer than 3 characters")
        } else {
            FetchAnime(searchString);
        }
    }, [])

    useEffect(() => {
        // Render (on-pageData-change) 
        console.log(pageData);
        if (pageData != null) {
            for (let i = 0; i < pageData.length; i++ ) {
                //console.log(`PageData[${i}]: (${pageData[i].mal_id}-${pageData[i].title})`);  
            }
        }
    }, [pageData])

    const FetchAnime = async (query) => {
        var url = `https://api.jikan.moe/v4/anime?${createSearchParams({
            q: (query),
            unnaproved: false,
            limit: 25,
        }).toString()}`;
        console.log(`Fetch url:, '${url}'`);
        
        const response = await fetch(url)
            .then(response => response.json())
            .then((resObject) => {
                setPageData(resObject.data); 
            })
        //console.log(`PageData: ${response}`
    }

    return (
        <div className='fto__page__search'>
            <div className='gradient__bg'>
                <Navbar />
                
                <div className='fto__page__search-content section__padding'>
                    <h1 className='gradient__text'>
                        Searched for '{searchString}'
                    </h1>

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
                            {pageData.map((animeInfo, it) => {
                                return (
                                    <tr key={it}>
                                        <td>
                                            <img width={66} height={100} src={animeInfo.images.jpg.image_url} alt="Anime Image" />
                                        </td>
                                        <td>
                                            <p>{animeInfo.title}</p>
                                            {AddSubtitle(animeInfo.titles)}
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