import React from 'react';
import './search.css';

import { Navbar, Footer, } from "../../components";
import default_img from '../../assets/default_image_square.png';

const Search = () => {
    return (
        <div className='fto__page__search'>
            <div className='gradient__bg'>
                <Navbar />
                
                <div className='fto__page__search-content section__padding'>
                    <h1 className='gradient__text'>
                        Searched For
                    </h1>

                    <table className='fto__page__search-content_search_table' >
                        <thead>
                            <td colSpan='100%'><hr /></td>
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
                            <td colSpan='100%'><hr /></td>
                            <tr>
                                <td>
                                    <img width={100} height={100} src={default_img} />
                                </td>
                                <td>Anime Title</td>
                                <td>Status</td>
                                <td>Date</td>
                                <td>Type</td>
                                <td>Num</td>
                                <td>Count</td>
                            </tr>
                            <td colSpan='100%'><hr /></td>
                        </tbody>
                    </table>

                </div>
            </div>
		    <Footer />
        </div>
    )
}


export default Search