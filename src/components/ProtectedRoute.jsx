import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute - Wraps routes that require authentication
 * 
 * Features:
 * - Checks for valid token in sessionStorage
 * - Redirects unauthenticated users to login page
 * - Preserves intended destination for post-login redirect
 * - Optional role-based access control
 * 
 * @param {ReactNode} children 
 * @param {string[]} allowedRoles 
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const location = useLocation();
    
   
    const token = sessionStorage.getItem('token');
    const userInfoString = sessionStorage.getItem('userInfo');
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    
   
    if (!token) {
       
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }
    
   
    if (allowedRoles.length > 0 && userInfo) {
        if (!allowedRoles.includes(userInfo.role)) {
           
            return <Navigate to="/dashboard" replace />;
        }
    }
    
   
    return children;
};

export default ProtectedRoute;
