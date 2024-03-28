import React from 'react';

const PageLoading = () => {

    return (
        <div className='fto_loading'>
            <div className='fto_modal_overlay-bg fto_loading-cursor' />
            <div className={'fto_loading-text_section fto_input'} 
                style={
                    { 
                        position: 'fixed', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)', 
                        padding: '20px',
                    }
                }>
                <p className={'fto_loading-text fto_unselectable'}>
                    Loading...
                </p>
                <div className="fto_loading-loader" />
            </div>
        </div>
    )
}

export default PageLoading