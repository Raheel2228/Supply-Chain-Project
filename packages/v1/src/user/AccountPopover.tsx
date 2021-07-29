import React from "react";
import { Classes, Menu, Popover } from "@blueprintjs/core";
import { useHistory } from "react-router";

import DelayedSpinner from "../common/DelayedSpinner";
import { useUserState } from "../common/UserDataLoader";
import useQueryParams from "../util/useQueryParams";
import { useAuth0 } from "@auth0/auth0-react";

export default function AccountPopover({
  target,
}: {
  target: string | JSX.Element;
}) {
  const { isLoading, user, logout } = useAuth0();
  const { user: appUser } = useUserState();
  const history = useHistory();
  const { clientId } = useQueryParams();

  if (isLoading || !user) {
    return <DelayedSpinner size={20} />;
  }

  return (
    <Popover
      content={
        <>
          <div style={{ padding: "16px", textAlign: "center" }}>
            <img
              src={user.picture}
              alt="Profile"
              style={{ maxHeight: "50px", borderRadius: "50%" }}
            />

            <h2 style={{ margin: "8px" }}>{appUser?.name}</h2>
            <p>{appUser?.email}</p>

            {process.env.NODE_ENV === "development" && (
              <details>
                <summary>Debugging Info</summary>
                <pre
                  className={Classes.CODE_BLOCK}
                  style={{
                    width: "300px",
                    textAlign: "left",
                    overflowX: "scroll",
                  }}
                >
                  {JSON.stringify(user, null, 2)}
                  {JSON.stringify(appUser, null, 2)}
                </pre>
              </details>
            )}
          </div>
          <Menu>
            <Menu.Item
              icon="user"
              onClick={() => history.push(`/account?clientId=${clientId}`)}
              text="Account Settings"
            />
            <Menu.Item icon="log-out" onClick={() => logout()} text="Log Out" />
          </Menu>
        </>
      }
    >
      {target}
    </Popover>
  );
}
