import { Navigate, useLocation } from 'react-router-dom';
import { dashboardPathFor, getRole, getToken } from '../utils/auth';

/**
 * Shows the page only to logged-in users with one of the given roles.
 * This is for navigation only – the server enforces the real permissions.
 */
const ProtectedRoute = ({ roles, children }) => {
  const location = useLocation();

  if (!getToken()) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const role = getRole();
  if (roles && !roles.includes(role)) {
    return <Navigate to={dashboardPathFor(role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
