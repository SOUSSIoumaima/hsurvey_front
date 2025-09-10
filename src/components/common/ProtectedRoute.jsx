import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  

  const isAuthenticated = !!user;
  

  
  if (!isAuthenticated) {
   
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  return children;
};

export default ProtectedRoute; 