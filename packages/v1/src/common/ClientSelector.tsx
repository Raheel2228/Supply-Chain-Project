import React, { ChangeEvent } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  Popover,
  Menu,
  Button,
  Classes,
  Tooltip,
  Switch,
  Spinner,
} from "@blueprintjs/core";
import useQueryParams from "../util/useQueryParams";
import config from "../config";
import { useUserState } from "./UserDataLoader";
import { PrivilegeLevel } from "../admin/ClientPrivilegeLevelSelector";
import { clientPath } from "../util/route";
import DelayedSpinner from "./DelayedSpinner";

// TODO if global admin, should we have a separate list of all clients?

export default function ClientSelector() {
  const { clientId } = useQueryParams();
  const history = useHistory();
  const location = useLocation();

  const {
    loading,
    clientPrivileges,
    clientPrivilegeLevel,
    currentClient,
    user,
    adminMode,
    setAdminMode,
  } = useUserState();

  if (loading) return <DelayedSpinner size={Spinner.SIZE_SMALL} />;

  let currentClientName = currentClient?.name || config.appName;
  const currentClientLogoUrl = currentClient?.logoUrl || "";

  // Override current client if in global admin UI, or visiting a client they don’t have a privilege for
  if (
    user?.globalAdmin &&
    (location.pathname.startsWith("/admin") || !currentClient)
  ) {
    currentClientName = "Global Admin";
  }

  // Show switch if inside a client, and either global or client admin
  const showAdminModeSwitch =
    !!clientId &&
    (user?.globalAdmin || clientPrivilegeLevel === PrivilegeLevel.CLIENT_ADMIN);

  // If global admin visiting client without privilege, force admin mode (otherwise they would see nothing)
  // const forceAdminMode = showAdminModeSwitch && !currentClientPrivilege;

  return (
    <>
      <Popover
        content={
          <Menu large>
            {user?.globalAdmin && (
              <Menu.Item
                onClick={() => history.push("/admin/clients")}
                text="Global Admin"
                icon="wrench"
              />
            )}
            <Menu.Divider title="My Workspaces" />
            {clientPrivileges.map((privilege) => (
              <Menu.Item
                key={privilege.clientId}
                onClick={() =>
                  history.push(
                    clientPath(
                      privilege.clientId,
                      "home",
                      privilege.privilegeLevel
                    )
                  )
                }
                text={privilege.client?.name || privilege.clientId}
              />
            ))}
          </Menu>
        }
      >
        <Tooltip content="Switch Workspace">
          <Button
            title="Options"
            className={Classes.MINIMAL}
            rightIcon="caret-down"
            large
          >
            <strong>{currentClientName}</strong>
          </Button>
        </Tooltip>
      </Popover>
      {currentClientLogoUrl && (
        <img
          alt=""
          src={currentClientLogoUrl}
          style={{ height: "30px", width: "auto", margin: "0 8px" }}
        />
      )}
      {showAdminModeSwitch && (
        <Tooltip content="View data from all users in the workspace">
          <Switch
            label="View as Admin"
            checked={adminMode}
            style={{ margin: "auto 8px" }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setAdminMode(e.target.checked);
            }}
          />
        </Tooltip>
      )}
    </>
  );
}
