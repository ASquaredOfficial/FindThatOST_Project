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

  const navigateToAnime = (nFtoID = -1, pageNum = 1) => {
    if (!process.env.REACT_APP_DEBUG_MODE && nFtoID  === -1) {
      alert('Operation failed');
      console.error(`Unable to navigate to page (Anime) because variable 'nFtoID' is an invalid value '${nFtoID}'`);
      return;
    }
    
    navigate(`/anime/${nFtoID}`);
  };

  const navigateToEpisode = (nFtoAnimeID = -1, nEpisodeNo = -1, objAnimeEpisodeData = {}) => {
    if (!process.env.REACT_APP_DEBUG_MODE && (nFtoAnimeID  === -1 || nEpisodeNo  === -1)) {
      alert('Operation failed');
      console.error(`Unable to navigate to page (Episode) because parameters contain an invalid value`);
      return;
    }
    
    navigate(`/anime/${nFtoAnimeID}/episode/${nEpisodeNo}`,
    {
      state: {
        fto_anime_id: nFtoAnimeID,
        episode_no: nEpisodeNo,
        anime_episode_data: objAnimeEpisodeData,
      }
    });
  };

  const navigateToTrack = (nFtoAnimeID = -1, nFtoEpisodeID = -1) => {
    if (!process.env.REACT_APP_DEBUG_MODE && (nFtoAnimeID  === -1 || nFtoEpisodeID  === -1)) {
      alert('Operation failed');
      console.error(`Unable to navigate to page (Track) because parameters contain an invalid value`);
      return;
    }
    
    navigate(`/track/${nFtoAnimeID}?context_id=${nFtoEpisodeID}`);
  };

  const navigateToChatBot = (strChatbotQuery = '') => {
      navigate(`/chatbot/`,
      {
        state: {
          chatbot_query: strChatbotQuery,
        }
      });
  }


  return {
    navigateToHome,
    navigateToSearch,
    navigateToAnime,
    navigateToEpisode,
    navigateToTrack,
    navigateToChatBot,
  };
};