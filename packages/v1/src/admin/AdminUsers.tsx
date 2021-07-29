import React, { useState } from "react";
import {
  Breadcrumbs,
  IBreadcrumbProps,
  HTMLTable,
  Button,
  Callout,
  Icon,
} from "@blueprintjs/core";
import InviteUserDialog from "./InviteUserDialog";
import { useAuthFetch, useApi } from "../util/api";
import DelayedSpinner from "../common/DelayedSpinner";
import { AppToaster } from "../common/toaster";
import { Helmet } from "react-helmet-async";
import { routerBreadcrumbRenderer } from "../nav/RouterBreadcrumb";
import { showConfirm } from "../common/ImperativeDialog";

export type UserId = string;

export type User = {
  id: UserId;
  email: string;
  contactEmail: string | null;
  name: string;
  globalAdmin: boolean;
};

const BREADCRUMBS: IBreadcrumbProps[] = [
  { href: "/admin/users", text: "Users", current: true },
];

export default function AdminUsers() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState<boolean>(false);
  const authFetch = useAuthFetch();
  const { error, data, fire } = useApi("/users/globalAdmins");

  if (error) {
    return <Callout intent="danger">{String(error)}</Callout>;
  } else if (!data) {
    return <DelayedSpinner />;
  }

  const users: User[] = data.users;

  const handleChangeRoleClick = async (user: User) => {
    const confirmation = await showConfirm(
      user.globalAdmin
        ? `Remove global admin permissions from ${user.name}? Any client admin permissions will remain unaffected. This will take effect on the user’s next login.`
        : `Grant global admin permissions to ${user.name}? This user will have acess to all data within all client workspaces. This will take effect on the user’s next login.`,
      user.globalAdmin
        ? "Remove Global Admin Permissions"
        : "Grant Global Admin Permissions"
    );
    if (!confirmation) return;
    try {
      await authFetch(`/users/globalAdmins/${user.id}`, {
        method: user.globalAdmin ? "DELETE" : "POST",
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

  return (
    <>
      <Helmet>
        <title>Users</title>
      </Helmet>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={BREADCRUMBS}
          breadcrumbRenderer={routerBreadcrumbRenderer}
        />
        <Button
          intent="primary"
          text="Create User"
          icon="new-person"
          onClick={() => setInviteDialogOpen(true)}
        />
      </div>
      <HTMLTable striped style={{ width: "100%" }} className="sticky-header">
        <thead>
          <tr>
            <th style={{ width: "150px" }}>Role</th>
            <th>Name</th>
            <th>
              Email &nbsp; <Icon icon="sort-asc" />
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.globalAdmin && "Global Admin"}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <Button
                  minimal
                  small
                  intent="primary"
                  text="Change Role"
                  onClick={() => handleChangeRoleClick(user)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
      {/* <Paginate pageCount={3} pageRangeDisplayed={5} marginPagesDisplayed={2} /> */}
      {inviteDialogOpen && (
        <InviteUserDialog
          onClose={() => setInviteDialogOpen(false)}
          isOpen={inviteDialogOpen}
          onAddUser={fire}
        />
      )}
    </>
  );
}
