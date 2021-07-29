import React, { useState } from "react";
import {
  HTMLTable,
  Button,
  H3,
  Callout,
  NonIdealState,
  Popover,
  Classes,
} from "@blueprintjs/core";
import InviteUserDialog from "./InviteUserDialog";
import ClientPrivilegeLevelSelector, {
  PrivilegeLevel,
} from "./ClientPrivilegeLevelSelector";
import { useApi, useAuthFetch } from "../util/api";
import { AppToaster } from "../common/toaster";
import { ClientPrivilege } from "./AdminClient";
import UserScriptPrivilegesDialog from "./UserScriptPrivilegesDialog";
import { showConfirm } from "../common/ImperativeDialog";
import { privilegeLabel } from "./ClientPrivilegeLevelSelector";

interface IAdminClientUsersProps {
  clientId: string;
}

export default function AdminClientUsers({ clientId }: IAdminClientUsersProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState<boolean>(false);
  const [editScriptPrivilegesUserId, setEditScriptPrivilegesUserId] = useState<
    string | null
  >(null);

  const authFetch = useAuthFetch();
  const { error, data, fire } = useApi(`/clientPrivileges/${clientId}`);

  if (error) {
    return (
      <Callout intent="danger">Error loading users: {String(error)}</Callout>
    );
  }

  const privileges: ClientPrivilege[] = data?.clientPrivileges;

  const handleChangeRoleClick = async (
    privilege: ClientPrivilege,
    newPrivilegeLevel: PrivilegeLevel
  ) => {
    const dangerText =
      newPrivilegeLevel === PrivilegeLevel.CLIENT_OBSERVER
        ? "Changing an existing user to an observer will remove their access to all scripts and models, which could have unintended consequences."
        : "";
    const confirmation = await showConfirm(
      `Change ${privilege.user?.name} to ${privilegeLabel(
        newPrivilegeLevel
      )}? ${dangerText}`
    );
    if (!confirmation) return;
    try {
      await authFetch(`/clientPrivileges/${clientId}/${privilege.userId}`, {
        method: "PATCH",
        body: JSON.stringify({ privilegeLevel: newPrivilegeLevel }),
      });

      AppToaster.show({
        message: "User role updated",
        intent: "success",
      });
      fire();
    } catch (error) {
      console.error(error);
      AppToaster.show({
        message: "Error changing user role",
        intent: "danger",
      });
    }
  };

  const handleRemoveUserClick = async (privilege: ClientPrivilege) => {
    const confirmation = await showConfirm(
      `Remove ${privilege.user?.name} from this client? This will not delete the user’s account or remove access to other client workspaces.`,
      "Remove User",
      "Cancel",
      true
    );
    if (!confirmation) return;
    try {
      await authFetch(`/clientPrivileges/${clientId}/${privilege.userId}`, {
        method: "DELETE",
      });

      AppToaster.show({
        message: "User removed",
      });
      fire();
    } catch (error) {
      console.error(error);
      AppToaster.show({
        message: "Error removing user",
        intent: "danger",
      });
    }
  };

  return (
    <>
      <div style={{ display: "flex" }}>
        <H3 style={{ flexGrow: 1 }}>Users</H3>
        <Button
          intent="primary"
          text="Invite User"
          icon="new-person"
          onClick={() => setInviteDialogOpen(true)}
        />
      </div>
      {privileges?.length === 0 && (
        <NonIdealState
          icon="user"
          title="No Users"
          description="Invite a user to this client workspace."
          action={
            <Button
              intent="primary"
              text="Invite User"
              icon="new-person"
              onClick={() => setInviteDialogOpen(true)}
            />
          }
        />
      )}
      {privileges?.length > 0 && (
        <HTMLTable striped style={{ width: "100%" }} className="sticky-header">
          <thead>
            <tr>
              <th style={{ width: "150px" }}>Role</th>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {privileges.map((privilege) => (
              <tr key={privilege.userId}>
                <td>{privilegeLabel(privilege.privilegeLevel)}</td>
                <td>{privilege.user?.name}</td>
                <td>{privilege.user?.email}</td>
                <td>
                  <Button
                    minimal
                    intent="primary"
                    text="Edit Script Access"
                    disabled={
                      privilege.privilegeLevel !== PrivilegeLevel.CLIENT_USER
                    }
                    title="Client admins have access to all scripts; observers have access to none."
                    onClick={() =>
                      setEditScriptPrivilegesUserId(privilege.userId)
                    }
                  />
                  &nbsp;&nbsp;
                  <Popover
                    hasBackdrop
                    content={
                      <div
                        className={Classes.POPOVER_DISMISS}
                        style={{ padding: "16px" }}
                      >
                        <ClientPrivilegeLevelSelector
                          value={privilege.privilegeLevel}
                          onChange={(newLevel) =>
                            handleChangeRoleClick(privilege, newLevel)
                          }
                        />
                      </div>
                    }
                    target={
                      <Button minimal intent="primary" text="Change Role" />
                    }
                  />
                  &nbsp;&nbsp;
                  <Button
                    minimal
                    intent="danger"
                    text="Remove"
                    onClick={() => handleRemoveUserClick(privilege)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      )}
      <InviteUserDialog
        onClose={() => setInviteDialogOpen(false)}
        onAddUser={fire}
        isOpen={inviteDialogOpen}
        clientId={clientId!}
      />
      {editScriptPrivilegesUserId && (
        <UserScriptPrivilegesDialog
          clientId={clientId}
          isOpen
          userId={editScriptPrivilegesUserId}
          onClose={() => setEditScriptPrivilegesUserId(null)}
        />
      )}
    </>
  );
}
