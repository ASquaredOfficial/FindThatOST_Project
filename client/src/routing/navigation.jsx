import { useNavigate } from 'react-router-dom';

export const useCustomNavigate = () => {
  const navigate = useNavigate();

  const navigateToHome = () => {
    navigate('/home');
  };

  const navigateToSearch = (query, pageNum = 1) => {
    var curentPage = location.href;
    navigate({
        pathname: '/search',
        search: `?query=${encodeURIComponent(query)}&page=${pageNum}`,
      });
      if (curentPage.startsWith(location.origin + '/search')) {
        //if search page 
        navigate(0)
      }
  };

  const navigateToAnime = (nFtoID = -1, objAnimeData = {}) => {
    if (!process.env.REACT_APP_DEBUG_MODE && nFtoID == -1) {
      alert('Operation failed');
      console.error(`Unable to navigate to page (Anime) because variable 'nFtoID' is an invalid value '${nFtoID}'`);
      return;
    }
    
    navigate(`/anime/${nFtoID}`,
    {
      state: {
        anime_data: objAnimeData,
        fto_id: nFtoID
      }
    });
  };

  const navigateToEpisode = (nFtoAnimeID = -1, nFtoEpisodeID = -1, objAnimeEpisodeData = {}) => {
    if (!process.env.REACT_APP_DEBUG_MODE && (nFtoAnimeID == -1 || nFtoEpisodeID == -1)) {
      alert('Operation failed');
      console.error(`Unable to navigate to page (Anime) because parameters contain an invalid value`);
      return;
    }
    
    navigate(`/anime/${nFtoAnimeID}/episode/${nFtoEpisodeID}`,
    {
      state: {
        fto_anime_id: nFtoAnimeID,
        fto_episode_id: nFtoEpisodeID,
        anime_episode_data: objAnimeEpisodeData,
      }
    });
  };


  return {
    navigateToHome,
    navigateToSearch,
    navigateToAnime,
    navigateToEpisode,
    // Add more navigation functions
  };
};