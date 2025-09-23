// CloudStream - Modern Streaming Platform
// This is now a fully functional streaming platform with authentication

import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to dashboard (authentication will handle showing login if needed)
  return <Navigate to="/dashboard" replace />;
};

export default Index;
