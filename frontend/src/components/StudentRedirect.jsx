import { Navigate } from 'react-router-dom';
import { getRole, getToken } from '../utils/auth';

/**
 * Marketing pages (home, login, course catalogue...) are for visitors. A logged-in student is sent
 * to their portal instead – so the browser's Back button never leaves the portal until they log out.
 */
const StudentRedirect = ({ children }) =>
  getToken() && getRole() === 'student' ? <Navigate to="/dashboard" replace /> : children;

export default StudentRedirect;
