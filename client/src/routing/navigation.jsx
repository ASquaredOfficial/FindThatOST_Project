import { useNavigate } from 'react-router-dom';

export const useCustomNavigate = () => {
  const navigate = useNavigate();

  const navigateToHome = () => {
    navigate('/home');
  };

  const navigateToSearch = (query, data = 1) => {
    var curentPage = location.href;
    navigate({
        pathname: '/search',
        search: `?query=${encodeURIComponent(query)}&page=${data}`,
      });
      if (curentPage.startsWith(location.origin + '/search')) {
        //if search page 
        navigate(0)
      }
  };

  const navigateToPage2 = () => {
    navigate('/page2');
  };

  // Add more navigation functions as needed

  return {
    navigateToHome,
    navigateToSearch,
    // Add more navigation functions
  };
};