import React from "react";
import {
  Breadcrumbs,
  IBreadcrumbProps,
  NonIdealState,
  AnchorButton,
} from "@blueprintjs/core";
import { Redirect } from "react-router-dom";
import config from "../config";
import DelayedSpinner from "./DelayedSpinner";
import ClientCard from "./ClientCard";
import { Helmet } from "react-helmet-async";
import { routerBreadcrumbRenderer } from "../nav/RouterBreadcrumb";
import { useUserState } from "./UserDataLoader";
import { clientPath } from "../util/route";

const BREADCRUMBS: IBreadcrumbProps[] = [
  { href: "/clients", text: "My Workspaces", current: true },
];

export default function Clients() {
  const { loading, clientPrivileges } = useUserState();
  const clientCount = clientPrivileges.length;

  let content;
  if (loading) {
    content = <DelayedSpinner />;
  } else if (clientCount === 0) {
    return (
      <NonIdealState
        icon="office"
        title="No Workspaces"
        description="You currently don’t have access to any workspaces. Please contact us to help you get started."
        action={<AnchorButton href={config.contactUrl} text="Contact Us" />}
      />
    );
  } else if (clientCount === 1) {
    // If user only has 1 client, redirect to that one
    const clientId = clientPrivileges[0].clientId;
    const privilegeLevel = clientPrivileges[0].privilegeLevel;
    return <Redirect to={clientPath(clientId, "home", privilegeLevel)} />;
  } else {
    content = (
      <div className="client-card-grid">
        {clientPrivileges.map((privilege) => (
          <ClientCard
            key={privilege.client!.id}
            client={privilege.client!}
            privilegeLevel={privilege.privilegeLevel}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Clients</title>
      </Helmet>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={BREADCRUMBS}
          breadcrumbRenderer={routerBreadcrumbRenderer}
        />
      </div>
      {content}
    </>
  );
}
