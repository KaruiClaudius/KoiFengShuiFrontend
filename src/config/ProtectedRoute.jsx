import { Navigate } from "react-router-dom";
import { PATHS } from "../routes/paths";
import { useAuth } from "../context/AuthContext";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isLoggedIn, user } = useAuth();
  const userRole = user?.roleId;

  if (!isLoggedIn) {
    return <Navigate to={PATHS.auth} replace />;
  }

  if (requiredRole !== null && userRole !== requiredRole) {
    return <Navigate to={PATHS.home} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  requiredRole: PropTypes.number,
};

export default ProtectedRoute;
