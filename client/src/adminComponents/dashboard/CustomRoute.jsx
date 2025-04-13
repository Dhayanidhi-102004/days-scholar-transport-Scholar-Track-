import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const CustomRoute = ({ element: Element, ...rest }) => {
  // Check if user is authenticated
  const isAuthenticated = sessionStorage.getItem('isAdmin');

  return (
    <Route
      {...rest}
      element={isAuthenticated ? <Element /> : <Navigate to="/admin/login" />}
    />
  );
};

export default CustomRoute;
