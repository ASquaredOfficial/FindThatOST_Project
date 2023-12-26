import React, {useEffect, useState, createElement} from 'react';
import './anime.css';

import default_img from '../../assets/default_image_rectangular_vertical.svg'
import { Navbar, Footer} from "../../components";
import { useLocation, useParams } from "react-router-dom";

const Anime = () => {
    const { id } = useParams();
    const { state } = useLocation();
    const loAnimeData = state?.anime_data || -111;

    useEffect(() => {
        console.log(state)
        console.log("My data id is:", loAnimeData.mal_id)
        console.log(loAnimeData)
    }, []);

    return (
        <div className='fto__page__anime'>
            <div className='gradient__bg'>
                <Navbar />

                <div className='fto__page__anime-content section__padding' style={{paddingBottom: 0}}>
                    <div className='fto__page__anime-content_heading_section'>
                        <h1 className='fto__page__anime-content_header_title gradient__text'>
                            Anime Title
                        </h1>
                        <h2 className='fto__page__anime-content_header_subtitle'>Anime Title (alternate name)</h2>
                    </div>
                    <hr className='fto__page__anime-horizontal_hr'></hr>
                    
                    
                    <div className='fto__page__anime-main_content'>
                        <div className='fto__page__anime-main_content_left'>
                            <img alt='Anime Image' src={default_img} className='fto__page__anime-main_content_left-anime_image' />
                            
                            <div className='fto__page__anime-main_content_left-alt_titles'>
                                <h3 className='fto__page__anime-main_content-header'>Alternative Titles</h3>
                                <p className='fto__page__anime-main_content-text'><strong>English:</strong> English Text</p>
                                <p className='fto__page__anime-main_content-text'><strong>Japanese:</strong> Japanese Text</p>
                            </div>

                            <div className='fto__page__anime-main_content_left-more_info'>
                                <h3 className='fto__page__anime-main_content-header'>Information</h3>
                                <p className='fto__page__anime-main_content-text'><strong>Air Date: </strong>Date</p>
                                <p className='fto__page__anime-main_content-text'><strong>Status: </strong>Status</p>
                                
                                <h4 className='fto__page__anime-main_content-header'>Related Shows</h4>
                                <p className='fto__page__anime-main_content-text'><strong>Prequel: </strong>Show name</p>

                            </div>
                        </div>

                        <div className='fto__page__anime-main_content_right'>
                            <h3 className='fto__page__anime-main_content-header'>Synopsis</h3>
                            <p className='fto__page__anime-main_content-text'>
                                kvduivbdvbdvbdsjvbvb vihdsivhdsuhvidshv gvid vividhvidsvidviudviuudsgviudvbd vbivhuhvhsdivdvhusdviuhdsvihvuhsdvhisduhvisdhvihdvihviuhsvihsdivhuisdvhisdhv iuhvisdvhudhx vihd viuvisvhiduvhisdvhidsvhisdvuhsduvhidhvidsivhsidvhisdviudsvidsivuidsvhidsh hv dsivhdivhivhdv dsvhihdsihvusdhv sudhvisdvhidsvuydsv iu yvg udfyv idf ydg iufyvg iufdyfds o yiyv ydf uhbiay fyodygvoygdsyvb vdshiv dsvsydvidyiysdgv gsv gsidvgsdgvdv yds giys diydys gciydysiyudyusuisiyyiusdydy vsvds ysd viy yd.
                            </p>
                                
                        </div>
                    </div>
                </div>

            </div>
		    <Footer />
        </div>
    )
}

export default Anime