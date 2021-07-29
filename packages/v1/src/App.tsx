import React from "react";
import { Router, Route, Switch, Link, Redirect } from "react-router-dom";
import {
  Button,
  Classes,
  Navbar,
  NavbarGroup,
  Alignment,
  Spinner,
  Callout,
  ButtonGroup,
} from "@blueprintjs/core";
import { Helmet, HelmetProvider } from "react-helmet-async";
import "./App.css";
import Models from "./model/Models";
import Model from "./model/ModelEditor";
import ModelSetup from "./model/ModelSetup";
import ReportPage from "./report/ReportPage";
import ReportsPage from "./report/ReportsPage";
import Datasets from "./dataset/Datasets";
import Users from "./admin/Users";
import AdminClients from "./admin/AdminClients";
import AdminScripts from "./admin/AdminScripts";
import AdminUsers from "./admin/AdminUsers";
import Nav from "./nav/Nav";
import AdminClient from "./admin/AdminClient";
import AdminScript from "./admin/AdminScript";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import history from "./util/history";
import AccountPopover from "./user/AccountPopover";
import PrivateRoute from "./nav/PrivateRoute";
import ClientSelector from "./common/ClientSelector";
import Clients from "./common/Clients";
import ErrorBoundary from "./ErrorBoundary";
import config from "./config";
import DatasetTypes from "./admin/DatasetTypes";
import UserDataLoader, { useUserState } from "./common/UserDataLoader";
import LegalInfo from "./LegalInfo";
import ThemeSwitcher, { useThemeUpdate, getTheme } from "./common/Theme";
import PublicReportPage from "./report/PublicReportViewer";
import AccountSettings from "./user/AccountSettings";
import PageNotFound from "./common/PageNotFound";

import V2 from "v2/src/App";

export default function App() {
  // Redirect the user to the previous route after login
  const onRedirectCallback = (appState: any) => {
    // TODO was push before auth0 update, but replace seems better
    history.push(
      appState && appState.targetUrl
        ? appState.targetUrl
        : window.location.pathname
    );
  };

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Auth0Provider
          domain={config.domain!}
          clientId={config.clientId!}
          redirectUri={window.location.origin}
          audience={config.audience!}
          onRedirectCallback={onRedirectCallback}
        >
          <Router history={history}>
            <Switch>
              {/** TODO: should be pushed to private route once ready*/}
              <Route path="/v2">
                {/*  @ts-ignore */}
                <V2 logout={() => alert("test")} />
              </Route>
              {/* Special case for public-facing report viewer */}
              <Route path="/viewReport/:reportId">
                <PublicReportPage />
              </Route>
              {/* The rest of the app */}
              <Route>
                <PrivateApp />
              </Route>
            </Switch>
          </Router>
        </Auth0Provider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

function PrivateApp() {
  const { isLoading: auth0Loading } = useAuth0();

  useThemeUpdate(getTheme());

  if (auth0Loading) {
    return (
      <div style={{ marginTop: "50px" }}>
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <Helmet
        defaultTitle={config.appName}
        titleTemplate={`%s | ${config.appName}`}
      />
      <UserDataLoader />
      {/* <header className="main-header">
        <Navbar>
          <NavbarGroup align={Alignment.LEFT}>
            <ClientSelector />
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            <ThemeSwitcher />
            <AccountPopover
              target={
                <Button
                  title="User Options"
                  className={Classes.MINIMAL}
                  icon="user"
                />
              }
            />
          </NavbarGroup>
        </Navbar>
      </header> */}
      <div className="nav-content-wrapper">
        {/* <Nav /> */}
        <div className="main-content-wrapper">
          <section className="main-content" style={{ padding: 0 }}>
            <ContentSwitch />
          </section>
          {/* <footer className="main-footer">
            <span>{config.copyrightNotice}</span>
            <a href={config.contactUrl}>Contact</a>
            <a href={config.privacyUrl}>Privacy</a>
            <Link to="/legal">Legal</Link>
          </footer> */}
        </div>
      </div>
    </>
  );
}

function ContentSwitch() {
  const { loading, user } = useUserState();
  const { logout } = useAuth0();
  if (loading) return null;

  // A <Switch> looks through its children <Route>s and
  // renders the first one that matches the current URL.
  // TODO look into upgrading to react-router v6
  return (
    <Switch>
      <Route exact path="/legal">
        <LegalInfo />
      </Route>
      <PrivateRoute path="/account">
        <AccountSettings />
      </PrivateRoute>
      <PrivateRoute path="/modelSetup/:modelId">
        <ModelSetup />
      </PrivateRoute>
      <PrivateRoute path="/models/:modelId">
        <Model />
      </PrivateRoute>
      <PrivateRoute path="/models">
        <Models />
      </PrivateRoute>
      <PrivateRoute path="/reports/:reportId">
        <ReportPage />
      </PrivateRoute>
      <PrivateRoute path="/reports">
        <ReportsPage />
      </PrivateRoute>
      <PrivateRoute path="/datasets">
        <Datasets />
      </PrivateRoute>
      <PrivateRoute path="/clients" exact>
        <Clients />
      </PrivateRoute>
      <PrivateRoute path="/v2">
        <V2
          // @ts-ignore
          logout={() => {
            logout();
            localStorage.clear();
          }}
        />
      </PrivateRoute>
      {/* These two are for client or global admin */}
      <PrivateRoute path="/users">
        <Users />
      </PrivateRoute>
      <PrivateRoute path="/datasetTypes">
        <DatasetTypes />
      </PrivateRoute>
      {user?.globalAdmin && (
        <>
          <PrivateRoute path="/admin/clients/:clientId">
            <AdminClient />
          </PrivateRoute>
          <PrivateRoute path="/admin/clients" exact>
            <AdminClients />
          </PrivateRoute>
          <PrivateRoute path="/admin/scripts/:scriptId">
            <AdminScript />
          </PrivateRoute>
          <PrivateRoute path="/admin/scripts" exact>
            <AdminScripts />
          </PrivateRoute>
          <PrivateRoute path="/admin/users">
            <AdminUsers />
          </PrivateRoute>
          {/* to be changed after mvp */}
          <PrivateRoute exact path="/">
            <Redirect to="/v2" />
          </PrivateRoute>
        </>
      )}
      {/* to be changed after mvp */}
      <PrivateRoute exact path="/">
        <Redirect to="/v2" />
      </PrivateRoute>
      <Route>
        <PageNotFound />
      </Route>
    </Switch>
  );
}
