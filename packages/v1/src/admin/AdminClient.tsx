import React from "react";
import {
  Breadcrumbs,
  IBreadcrumbProps,
  Button,
  Tooltip,
  H3,
  Card,
  Callout,
} from "@blueprintjs/core";
import { PrivilegeLevel } from "./ClientPrivilegeLevelSelector";
import { useHistory, useParams } from "react-router";
import DelayedSpinner from "../common/DelayedSpinner";
import { useApi, useAuthFetch } from "../util/api";
import { AppToaster } from "../common/toaster";
import { Client } from "./AdminClients";
import RenamePopover from "../common/RenamePopover";
import AdminClientUsers from "./AdminClientUsers";
import AdminClientScripts from "./AdminClientScripts";
import { useUserState } from "../common/UserDataLoader";
import { Helmet } from "react-helmet-async";
import RouterBreadcrumb, { routerBreadcrumbRenderer } from "../nav/RouterBreadcrumb";
import { showConfirm, showPrompt } from "../common/ImperativeDialog";
import { clientPath } from "../util/route";
import { User } from "./AdminUsers";

export type ClientPrivilege = {
  clientId: string;
  userId: string;
  privilegeLevel: PrivilegeLevel;
  user?: User;
  client?: Client;
};

type ClientUpdateInput = {
  name?: string;
  logoUrl?: string;
  frozen?: boolean;
};

export interface AdminClientParams {
  clientId: string;
}

export default function AdminClient() {
  const history = useHistory();
  const { clientId } = useParams<AdminClientParams>();
  const { setAdminMode } = useUserState();

  const authFetch = useAuthFetch();
  const { data, error, fire } = useApi(`/clients/${clientId}`);

  if (!error && !data) {
    return <DelayedSpinner />;
  } else if (error) {
    return <Callout intent="danger">{String(error)}</Callout>;
  }

  const client: Client = data.client;

  const handleFreezeClick = async () => {
    if (!client.frozen) {
      const confirmation = await showConfirm(
        "This client will no longer be able to run any models until a global admin re-allows it. This client can continue to view existing datasets and reports.",
        "Freeze Client",
        "Cancel",
        true
      );
      if (!confirmation) return;
    }
    handleUpdate({ frozen: !client.frozen });
  };

  const handleDeleteClick = async () => {
    const confirmation = await showPrompt(
      "This will permanently delete all models, datasets, and reports created by this client. Any publicly-shared reports will no longer be accessible. This action cannot be undone. Type “delete” to continue.",
      "",
      "Delete",
      "Cancel",
      true
    );
    if (confirmation?.trim().toLowerCase() === "delete") {
      AppToaster.show({
        message: "Deleting client (this could take a while)...",
        timeout: 0,
      });
      try {
        await authFetch(`/clients/${clientId}`, {
          method: "DELETE",
        });
        AppToaster.clear();
        AppToaster.show({
          message: "Client deleted",
          intent: "primary",
          icon: "trash",
        });
        history.replace("/admin/clients");
      } catch (error) {
        AppToaster.show({
          message: "Error deleting client",
          intent: "danger",
        });
      }
    }
  };

  const handleUpdate = async (data: ClientUpdateInput) => {
    try {
      await authFetch(`/clients/${clientId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      AppToaster.show({
        message: "Client updated",
        intent: "success",
      });
      fire();
    } catch (error) {
      AppToaster.show({
        message: "Error updating client",
        intent: "danger",
      });
    }
  };

  const BREADCRUMBS: IBreadcrumbProps[] = [
    { href: "/admin/clients", text: "Clients" },
    { href: `/admin/clients/${client.id}`, text: client.name, current: true },
  ];

  const currentBreadcrumbRenderer = (props: IBreadcrumbProps) => (
    <>
      <RouterBreadcrumb current {...props} />
      <RenamePopover
        currentName={client.name}
        onSave={(name) => handleUpdate({ name })}
        target={
          <Tooltip content="Rename Client">
            <Button icon="edit" />
          </Tooltip>
        }
        label="Client Name"
      />
      {client.logoUrl && (
        <img
          alt="Client Logo"
          src={client.logoUrl}
          style={{ height: "30px", width: "auto", marginLeft: "16px" }}
        />
      )}
      <RenamePopover
        currentName={client.logoUrl}
        onSave={(logoUrl) => handleUpdate({ logoUrl })}
        target={
          <Tooltip content="Edit Logo">
            <Button icon="media" />
          </Tooltip>
        }
        label="Client Logo Image URL"
      />
    </>
  );

  return (
    <>
      <Helmet>
        <title>{client.name}</title>
      </Helmet>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={BREADCRUMBS}
          breadcrumbRenderer={routerBreadcrumbRenderer}
          currentBreadcrumbRenderer={currentBreadcrumbRenderer}
        />
        <Button
          intent="primary"
          text="Client View"
          rightIcon="arrow-right"
          onClick={() => {
            setAdminMode(true);
            history.push(clientPath(client.id, "home"));
          }}
        />
      </div>
      <br />
      <Card>
        <AdminClientUsers clientId={clientId!} />
      </Card>
      <br />
      <AdminClientScripts clientId={clientId!} />

      <br />
      <Card>
        <H3>Danger Zone</H3>
        {client.frozen && (
          <Button
            outlined
            text="Re-Allow Client to Run Models"
            icon="undo"
            intent="success"
            onClick={handleFreezeClick}
          />
        )}
        {!client.frozen && (
          <Button
            outlined
            intent="danger"
            text="Disallow Client from Running Models"
            icon="disable"
            onClick={handleFreezeClick}
          />
        )}
        <br />
        <br />
        <details>
          <summary>Additional Options</summary>
          <Button
            outlined
            intent="danger"
            text="Permanently Delete Client"
            icon="trash"
            onClick={handleDeleteClick}
          />
        </details>
      </Card>
    </>
  );
}
