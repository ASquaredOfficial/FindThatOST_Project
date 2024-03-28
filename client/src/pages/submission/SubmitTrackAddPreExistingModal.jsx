import React, {useState, useEffect} from 'react';


import { IsEmpty } from '../../utils/RegularUtils';
import { GetPlatformNameString, IsFandomImageUrl } from '../../utils/HyperlinkUtils';
import default_img_square from '../../assets/default_image_square.svg'
import { PageLoading } from '../../components';

const SubmitTrackAddPreExistingModal = (
    {
        setModalVisibility, 
        setPageToAddPreExistingMode,
        setPreExistingTrackInfo,
        anime_id,
    }) => {
    
    const [ ftoTrackInfoList, setFTOTrackInfoList ] = useState([]);

    useEffect(() => {
        // Fetch page data for anime
        FetchPageData(anime_id);
    }, []);

    /**
     * Perform all fetches to set up the webpage.
     * 
     * @async
     * @function FetchPageData
     * @param {number|string}  nAnimeID - Page/Anime ID from url, corresponds to FindThatOST Anime ID.
     * @param {number|string}  nEpisodeNo -  Episode No track is being added to. -1 if added to no specific episode.
     * 
     */
    const FetchPageData = async (nAnimeID) => {
        try {
            // Fetch data from the backend
            const contextDataFromBackend = await FetchAllAnimeTracks_FTO(nAnimeID);
            console.log('Track Data from backend:', contextDataFromBackend);
            setFTOTrackInfoList(contextDataFromBackend);
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    const FetchAllAnimeTracks_FTO = async (nAnimeID) => {
        try {
            let apiUrl_fto = `/findthatost_api/getAnimeTracks/anime_id/${Number(nAnimeID)}`;
            console.debug(`Fetch anime tracks data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
            const response = await fetch(apiUrl_fto);
            if (response.status === 204) {
                alert("This anime has no tracks yet");
                console.error("Response status:", response.status, "\nLikely page doesn't exist. Redirecting to page.")
            }
            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error('Error fetching data from backend.');
        }
    }

    const handleTrackRow = (idx) => {
        if (!IsEmpty(ftoTrackInfoList[idx])) {
            setPreExistingTrackInfo(ftoTrackInfoList[idx]);
            setModalVisibility(false);
            setPageToAddPreExistingMode(true);
        }
    }

    const CloseModal = () => {
        setModalVisibility(false)
        setPageToAddPreExistingMode(false);
    }
    
    const ParsePosterImage_Square = (passedImageUrl) => {
        if (!IsEmpty(passedImageUrl) && IsFandomImageUrl(passedImageUrl)) {
            return `${passedImageUrl}`;
        }
        else {
            return `${default_img_square}`;
        }
    }

    return (
        <div className="fto_modal">

            <div className="fto_modal-content">
                <h3>
                    Select Track from track list
                </h3>
                <div className='body' style={{width: '90%', display: 'flex', flexDirection: 'column'}}>
                    <br />
                    
                    {!IsEmpty(ftoTrackInfoList) && (
                        <>
                        <h4>List of Soundtracks:</h4>
                        <hr className='fto_horizontal_hr' />

                        <div className=''>
                            {ftoTrackInfoList.map((objTrackInfo, it) => {
                                return (
                                    <div key={it} className='fto__page__submission-track_item' onClick={() => handleTrackRow(it) }>
                                        <img alt='Album Thumbnail' src={ParsePosterImage_Square(objTrackInfo.fandom_image_link)}/>
                                        <div  className='fto__page__submission-track_item-text_section'> 
                                            <h4 className='fto__page__submission-track_item-text'>
                                                {objTrackInfo.track_name}
                                            </h4>
                                            <h5 className='subheader_color fto__page__submission-track_item-text'>
                                                {String(objTrackInfo.artist_name).trim()}
                                            </h5>
                                        </div>
                                    </div>
                                )}
                            )}
                        </div>
                        </>
                    )}
                </div>
                <div className='fto_modal-content-footer'>
                    <button className='fto__button__gray' type='button' onClick={ CloseModal }>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default SubmitTrackAddPreExistingModal