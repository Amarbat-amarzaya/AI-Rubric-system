import { Navigate } from "react-router-dom";

const parseStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const RoleRoute = ({ children, allowedRoles }) => {
  const user = parseStoredUser();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default RoleRoute;
