import { useNavigate, useLocation } from 'react-router-dom';

export const useCustomNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToHome = () => {
    navigate('/home');
  };

  const navigateToSearch = (query, pageNum = 1) => {
    let curentPage = window.location.href;
    navigate({
        pathname: '/search',
        search: `?query=${encodeURIComponent(query)}&page=${pageNum}`,
      });
      console.log("Current page:", curentPage);
      console.log("Current location:", location);
      console.log("Current location pathname:", location.pathname);
      console.log("Current location search:", location.search);
      if (curentPage.startsWith(location.origin + '/search')) {
        //if search page 
        navigate(0); // refresh pahe
      }
  };

  const navigateToAnime = (nFtoID = -1, objAnimeData = {}) => {
    if (!process.env.REACT_APP_DEBUG_MODE && nFtoID  === -1) {
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


  return {
    navigateToHome,
    navigateToSearch,
    navigateToAnime,
    navigateToEpisode,
    navigateToTrack,
  };
};