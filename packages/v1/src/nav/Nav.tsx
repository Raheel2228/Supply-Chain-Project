import { Classes, H6 } from "@blueprintjs/core";
import React from "react";
import { Route, Switch } from "react-router-dom";
import "../App.css";
import AdminClientViewCallout from "../admin/AdminClientViewCallout";
import useQueryParams from "../util/useQueryParams";
import { useUserState } from "../common/UserDataLoader";
import { PrivilegeLevel } from "../admin/ClientPrivilegeLevelSelector";
import { clientPath } from "../util/route";
import NavTab from "./NavTab";

export default function Nav() {
  const { clientId } = useQueryParams();
  const { loading, user, clientPrivilegeLevel } = useUserState();

  if (loading || !user) return null;

  // If user has no access or is only an observer, don’t display nav
  const hasNoAccess = !(user.globalAdmin || clientId);
  const isObserver = clientPrivilegeLevel === PrivilegeLevel.CLIENT_OBSERVER;
  if (hasNoAccess || isObserver) return null;

  return (
    <div className="main-sidebar">
      {user.globalAdmin && clientId && (
        <Switch>
          {/* Empty route is to show admin callout on non-global-admin pages as fallback route */}
          <Route path="/admin" />
          <Route path="/">
            <AdminClientViewCallout />
          </Route>
        </Switch>
      )}
      <div className={"main-nav " + Classes.TABS + " " + Classes.VERTICAL}>
        <nav className={Classes.TAB_LIST}>
          <Switch>
            <Route path="/admin">
              <NavTab to="/admin/clients" icon="office" label="Clients" />
              <NavTab to="/admin/scripts" icon="console" label="Scripts" />
              <NavTab to="/admin/users" icon="people" label="Users" />
              <NavTab to="/v2" icon="grouped-bar-chart" label="Capabl v2" />
            </Route>
            {clientId && (
              <Route path="/">
                <NavTab
                  to={clientPath(clientId, "models")}
                  icon="cube"
                  label="Models"
                />
                <NavTab
                  to={clientPath(clientId, "reports")}
                  icon="document"
                  label="Reports"
                />
                <NavTab
                  to={clientPath(clientId, "datasets")}
                  icon="database"
                  label="Datasets"
                />
                <NavTab to="/v2" icon="grouped-bar-chart" label="Capabl v2" />
                {(user.globalAdmin ||
                  clientPrivilegeLevel === PrivilegeLevel.CLIENT_ADMIN) && (
                  <>
                    <br />
                    <span className="main-nav-label">
                      <H6>Workspace Admin</H6>
                    </span>
                    <NavTab
                      to={clientPath(clientId, "users")}
                      icon="people"
                      label="Users"
                      title="(Workspace Admin) Users"
                    />
                    <NavTab
                      to={clientPath(clientId, "datasetTypes")}
                      icon="data-lineage"
                      label="Dataset Types"
                      title="(Workspace Admin) Dataset Types"
                    />
                  </>
                )}
              </Route>
            )}
          </Switch>
        </nav>
      </div>
    </div>
  );
}
