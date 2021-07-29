import React, { useEffect } from "react";
import { RouteProps } from "react-router";
import { Route } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const PrivateRoute = ({ children, path, ...rest }: RouteProps) => {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (isLoading || isAuthenticated) return;

    const fn = async () => {
      await loginWithRedirect({
        appState: {
          targetUrl: window.location.pathname + window.location.search,
        },
      });
    };
    fn();
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  return (
    <Route path={path} {...rest}>
      {isAuthenticated ? children : null}
    </Route>
  );
};

export default PrivateRoute;
