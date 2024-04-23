import React, {useEffect} from 'react';

import { IsEmpty } from '../../utils/RegularUtils';

const ModalEmbeddedTrack = ({
    modalVisibility,
    setModalVisibility, 
    embeddedTrackData,
    setEmbeddedTrackData}) => {
    
    useEffect(() => {
        
    }, []);

    const onClose = () => {
        setModalVisibility(false);
        setEmbeddedTrackData();
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            let clickedElement = HTMLElement;
            clickedElement = event.target;
            if (modalVisibility && clickedElement.className === 'fto__modal') {
                setModalVisibility(false);
                setEmbeddedTrackData();
            }
        };
        document.addEventListener('click', handleClickOutside);
    
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [modalVisibility, setModalVisibility, setEmbeddedTrackData]);

    return (
        <div className='fto__modal'>
            <div className='fto__modal-embedded_track_content' style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                {IsEmpty(embeddedTrackData['apple_music']) ? (
                    <>
                        <iframe
                            title="Apple Music Track Player"
                            src={`https://embed.music.apple.com/song/${embeddedTrackData['apple_music']}?theme=light`}
                            height="100%" width="100%" 
                            style={{ overflow: 'hidden', borderRadius: '10px', border: '0', paddingTop: '20px', width: '100%', maxWidth: '660px', minHeight: '225px'}}
                            sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" 
                            allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" />
                        <button className="fto__button__pink" style={{ position: 'absolute', top: '85px', right: '15px', zIndex: '1'}} 
                            onClick={onClose}>
                            Close
                        </button>
                    </>
                ) : (
                    <>
                        <button className="fto__button__pink" style={{ position: 'absolute', top: '1px', left: '10px', zIndex: '1'}} 
                            onClick={onClose}>
                            Close
                        </button>
                        <iframe style={{ borderRadius: "12px", margin: '0', border: '0' }}
                            title="Spotify Track Player"
                            src={`https://open.spotify.com/embed/track/${embeddedTrackData['spotify']}?utm_source=generator&theme=0`} 
                            width="300" height="400" allowFullScreen 
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" loading="lazy" />
                    </>
                )}
            </div>
        </div>
    )
}

export default ModalEmbeddedTrack