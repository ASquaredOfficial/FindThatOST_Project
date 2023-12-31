import React, {useEffect, useState} from 'react';
import './anime.css';

import { Navbar, Footer} from "../../components";
import { useLocation, useParams } from "react-router-dom";
import { AreDefaultAndEnglishTitlesDifferent, ParseAnimePosterImage } from "../../utils/MalApiUtils"

const Anime = () => {
    const location = useLocation();
    const { id } = useParams();
    
    const [ ftoAnimeInfo, setFTOAnimeInfo ] = useState();
    const [ malAnimeInfo, setMALAnimeInfo ] = useState();

    const [ malAnimeTitles, setAnimeTitles ] = useState();
    const [ malAnimeRelations, setAnimeRelations ] = useState();

    useEffect(() => {
        console.debug(`Render-Anime (onMount): ${location.href}`);    
        
        FetchPageData(id);
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
        }
    }, [malAnimeInfo]);

    useEffect(() => {
        if (ftoAnimeInfo !== undefined && malAnimeInfo != undefined) {
            // Update Canonical Title
            if (ftoAnimeInfo.canonical_title == '') {
                
            }

            let animeTitle = ftoAnimeInfo.canonical_title;
        }
    }, [ftoAnimeInfo]);

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
            throw new Error('Error fetching data from external API');
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
                        console.debug(`Fetch data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
                        const response = await fetch(apiUrl_fto);
                        const data = await response.json();
                        ftoPrequelAnimeID = data[0].anime_id;
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

            // Perfotm Fetch Query
            if (apiUrl_fto !== '') {
                console.debug(`Fetch put data from the mal api to backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
                const response = await fetch(apiUrl_fto);
                const responseData = await response.json();
            }
        } 
        catch (error) {
            throw new Error('Error updating data in backend:');
        }
    }

    const FetchPageData = async (pageId) => {
        try {
            // Fetch data from the backend
            const dataFromBackend = await FetchAnimeData_FTO(pageId);
        
            // Use data from the backend to make the second fetch to the external API
            const dataFromExternalAPI = await FetchFullAnimeData_MAL(dataFromBackend);
        
            console.log('Data from backend:', dataFromBackend);
            console.log('Data from external API:', dataFromExternalAPI);
            setFTOAnimeInfo(dataFromBackend[0]);
            setMALAnimeInfo(dataFromExternalAPI.data);
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    const parseClassName = (str) => {
        return str.toLowerCase().replace(/\s/g, '_');
    };

    

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
                                <h3 className='fto__page__anime-main_content-header'><u>Synopsis</u></h3>
                                <p className='fto__page__anime-main_content-text'>
                                    {malAnimeInfo.synopsis}
                                </p>

                                {malAnimeRelations !== undefined && (
                                    <div className='fto__page__anime-main_content_related_shows'>
                                        <h4 className='fto__page__anime-main_content-header'><u>Related Shows</u></h4>
                                        
                                        {malAnimeInfo.relations.map((animeRelations, it1) => {
                                            return (
                                                (animeRelations.relation == 'Prequel' || animeRelations.relation == 'Sequel') && (
                                                    <div className={`fto__page__anime-main_content_left-${parseClassName(animeRelations.relation)}`}
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