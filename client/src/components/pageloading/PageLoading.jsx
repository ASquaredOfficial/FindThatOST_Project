import React from 'react';
import './pageloading.css';

const PageLoading = () => {

    return (
        <div className='fto__page__loading'>
            <div className='fto__modal-overlay-bg fto__page__loading-cursor' />
            <div className={'fto__page__loading-text_section fto_input'} 
                style={
                    { 
                        position: 'fixed', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)', 
                        padding: '20px',
                    }
                }>
                <p className={'fto__page__loading-text fto_unselectable'}>
                    Loading...
                </p>
                <div className="fto__page__loading-loader" />
            </div>
        </div>
    )
}

export default PageLoading