import { useNavigate, useLocation } from 'react-router-dom';

export const useCustomNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToHome = () => {
    navigate('/home');
  };

  const navigateToSearch = (query, pageNum = 1) => {
    navigate({
        pathname: '/search',
        search: `?query=${encodeURIComponent(query)}&page=${pageNum}`,
      });
      
      // if current page is search page, reload after changing search parameters
      if (location.pathname === '/search') { 
        window.location.reload();
      }
  };

  const navigateToAnime = (nFtoID = -1) => {
    if (!process.env.REACT_APP_DEBUG_MODE && nFtoID  === -1) {
      alert('Operation failed');
      console.error(`Unable to navigate to page (Anime) because variable 'nFtoID' is an invalid value '${nFtoID}'`);
      return;
    }
    
    navigate(`/anime/${nFtoID}`);
  };

  const navigateToEpisode = (nFtoAnimeID = -1, nEpisodeNo = -1) => {
    if (!process.env.REACT_APP_DEBUG_MODE && (nFtoAnimeID  === -1 || nEpisodeNo  === -1)) {
      alert('Operation failed');
      console.error(`Unable to navigate to page (Episode) because parameters contain an invalid value`);
      return;
    }
    
    navigate(`/anime/${nFtoAnimeID}/episode/${nEpisodeNo}`);
  };

  const navigateToTrack = (nFtoTrackID = -1, nFtoEpisodeID = -1) => {
    if (!process.env.REACT_APP_DEBUG_MODE && (nFtoTrackID  === -1 || nFtoEpisodeID  === -1)) {
      alert('Operation failed');
      console.error(`Unable to navigate to page (Track) because parameters contain an invalid value`);
      return;
    }

    if (nFtoEpisodeID !== -1) {
      navigate(`/track/${nFtoTrackID}?context_id=${nFtoEpisodeID}`);
    }
    else {
      navigate(`/track/${nFtoTrackID}`);
    }
    
  };
  
  const navigateToSubmitTrackAdd = (nFtoAnimeID = -1, nEpisodeNo = -1) => {
    if (!process.env.REACT_APP_DEBUG_MODE && (nFtoAnimeID  === -1 || nEpisodeNo  === -1)) {
      alert('Operation failed');
      console.error(`Unable to navigate to page (Track) because parameters contain an invalid value`);
      return;
    }

    if (nEpisodeNo !== -1) {
      navigate(`/submission/track_add/${nFtoAnimeID}?episode_no=${nEpisodeNo}`);
    }
    else {
      navigate(`/submission/track_add/${nFtoAnimeID}`);
    }
    
  };
  
  const navigateToSubmitTrackEdit = (nFtoTrackID = -1, nOccurrenceID = -1) => {
    if (!process.env.REACT_APP_DEBUG_MODE && (nFtoTrackID  === -1 || nOccurrenceID  === -1)) {
      alert('Operation failed');
      console.error(`Unable to navigate to page (Track) because parameters contain an invalid value`);
      return;
    }

    if (nOccurrenceID !== -1) {
      navigate(`/submission/track_edit/${nFtoTrackID}/context_id/${nOccurrenceID}`);
    }
    else {
      navigate(`/submission/track_add/${nFtoTrackID}`);
    }
    
  };

  const navigateToChatBot = (strChatbotQuery = '') => {
      navigate(`/chatbot/`,
      {
        state: {
          chatbot_query: strChatbotQuery,
        }
      });
  }

  const navigateToTrackRequest = (nFtoRequestID = -1) => {
    if (!process.env.REACT_APP_DEBUG_MODE && nFtoRequestID  === -1) {
      alert('Operation failed');
      console.error(`Unable to navigate to page (Anime) because variable 'nFtoRequestID' is an invalid value '${nFtoRequestID}'`);
      return;
    }
    
    navigate(`/request/${nFtoRequestID}`);
  };


  return {
    navigateToHome,
    navigateToSearch,
    navigateToAnime,
    navigateToEpisode,
    navigateToTrack,
    navigateToChatBot,
    navigateToSubmitTrackAdd,
    navigateToSubmitTrackEdit,
    navigateToTrackRequest,
  };
};