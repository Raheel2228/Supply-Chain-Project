import React, { useState } from "react";
import {
  Breadcrumbs,
  IBreadcrumbProps,
  Button,
  Callout,
} from "@blueprintjs/core";
import NewClientDialog from "./NewClientDialog";
import DelayedSpinner from "../common/DelayedSpinner";
import { useApi } from "../util/api";
import ClientCard from "../common/ClientCard";
import { Helmet } from "react-helmet-async";
import { routerBreadcrumbRenderer } from "../nav/RouterBreadcrumb";
import { PrivilegeLevel } from "./ClientPrivilegeLevelSelector";

export type Client = {
  id: string;
  name: string;
  logoUrl: string;
  frozen: boolean;
};

const BREADCRUMBS: IBreadcrumbProps[] = [
  { href: "/admin/clients", text: "Clients", current: true },
];

export default function AdminClients() {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const { error, data } = useApi("/clients");

  let content;
  if (error) {
    content = <Callout intent="danger">{String(error)}</Callout>;
  } else if (!data) {
    content = <DelayedSpinner />;
  } else {
    content = (
      <div className="client-card-grid">
        {data!.clients.map((client: Client) => (
          <ClientCard
            key={client.id}
            privilegeLevel={PrivilegeLevel.CLIENT_ADMIN}
            globalAdmin
            client={client}
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
        <Button
          intent="primary"
          text="Create Client"
          icon="plus"
          onClick={() => setDialogOpen(true)}
        />
      </div>
      {content}
      {dialogOpen && (
        <NewClientDialog onClose={() => setDialogOpen(false)} isOpen />
      )}
    </>
  );
}
