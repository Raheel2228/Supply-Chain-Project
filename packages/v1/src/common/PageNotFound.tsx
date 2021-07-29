import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button, ButtonGroup, Callout, Classes } from "@blueprintjs/core";
import { useUserState } from "./UserDataLoader";
import { Link } from "react-router-dom";
import config from "../config";

export default function PageNotFound() {
  const { loginWithRedirect } = useAuth0();
  const { user } = useUserState();

  return (
    <Callout title="Page Not Found" intent="warning">
      {!user && <p>You may need to log in to see this page.</p>}
      <ButtonGroup>
        {!user && <Button onClick={() => loginWithRedirect()} text="Log in" />}
        <Link className={Classes.BUTTON} to="/">
          Go to {config.appName} Home
        </Link>
      </ButtonGroup>
    </Callout>
  );
}
