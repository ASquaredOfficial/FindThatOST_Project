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

  // Add more navigation functions as needed

  return {
    navigateToHome,
    navigateToSearch,
    navigateToAnime
    // Add more navigation functions
  };
};