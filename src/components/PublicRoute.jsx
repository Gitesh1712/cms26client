import { Navigate, useLocation } from 'react-router-dom';

/**
 * PublicRoute - For public pages like login
 * Redirects to dashboard if user is already authenticated
 * 
 * Features:
 * - Checks if user is already logged in
 * - Redirects authenticated users to dashboard or intended page
 * - Prevents showing login page to logged-in users
 * 
  @param {ReactNode} children 
 */
const PublicRoute = ({ children }) => {
    const location = useLocation();
    
   
    const token = sessionStorage.getItem('token');
    
    
    if (token) {
       
        const from = location.state?.from || '/dashboard';
        return <Navigate to={from} replace />;
    }
    
 
    return children;
};

export default PublicRoute;
