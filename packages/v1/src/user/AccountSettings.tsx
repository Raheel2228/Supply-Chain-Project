import React, { useState } from "react";
import {
  Breadcrumbs,
  IBreadcrumbProps,
  Button,
  FormGroup,
  InputGroup,
  ControlGroup,
  Spinner,
} from "@blueprintjs/core";
import { useAuthFetch } from "../util/api";
import { Helmet } from "react-helmet-async";
import { routerBreadcrumbRenderer } from "../nav/RouterBreadcrumb";
import { useUserState } from "../common/UserDataLoader";
import { showPrompt } from "../common/ImperativeDialog";
import { User } from "../admin/AdminUsers";
import { AppToaster } from "../common/toaster";
import { useAuth0 } from "@auth0/auth0-react";

export type Client = {
  id: string;
  name: string;
  logoUrl: string;
  frozen: boolean;
};

const BREADCRUMBS: IBreadcrumbProps[] = [
  { href: "/account", text: "Account Settings", current: true },
];

export default function AccountSettings() {
  const { isLoading, user } = useAuth0();
  const { user: appUser } = useUserState();
  const authFetch = useAuthFetch();

  const [saving, setSaving] = useState<boolean>(false);

  if (isLoading || !user || !appUser || saving) {
    return <Spinner />;
  }

  const preferredEmail = appUser.contactEmail || appUser.email;

  // Handle change to user name or contact email
  const updateUser = async (userChanges: Partial<User>) => {
    setSaving(true);
    try {
      await authFetch(`/users/${appUser.id}`, {
        method: "PATCH",
        body: JSON.stringify(userChanges),
      });
      // Previous user profile is cached in UserDataLoader; hard reload will clear cache.
      window.location.reload();
    } catch (error) {
      AppToaster.show({
        message: `Error updating user profile: ${String(error)}`,
        intent: "danger",
      });
    }
    setSaving(false);
  };

  const editName = async () => {
    const name = await showPrompt("Enter new name:", appUser.name, "Save");
    if (!name) return;
    await updateUser({ name: name.trim() });
  };

  const editContactEmail = async () => {
    const contactEmail = await showPrompt(
      "Enter new contact email address:",
      preferredEmail,
      "Save"
    );
    if (!contactEmail) return;
    await updateUser({ contactEmail: contactEmail.trim() });
  };

  const changePassword = async () => {
    setSaving(true);
    try {
      await authFetch(`/users/${appUser.id}/resetPassword`, {
        method: "POST",
      });
      AppToaster.show({
        message: `An email will be sent to ${appUser.email} with a link to change your password.`,
        intent: "primary",
        timeout: 10000,
      });
    } catch (error) {
      AppToaster.show({
        message: `Error sending password change email: ${String(error)}`,
        intent: "danger",
      });
    }
    setSaving(false);
  };

  return (
    <div className="account-settings">
      <Helmet>
        <title>Account Settings</title>
      </Helmet>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={BREADCRUMBS}
          breadcrumbRenderer={routerBreadcrumbRenderer}
        />
      </div>

      <FormGroup
        label="Account Email Address"
        helperText="Used to log in or reset your password. To change this email address, please contact us."
      >
        <InputGroup disabled value={appUser.email} />
      </FormGroup>

      <FormGroup label="Name">
        <ControlGroup fill>
          <InputGroup disabled fill value={appUser.name} />
          <Button icon="edit" onClick={editName}>
            Edit
          </Button>
        </ControlGroup>
      </FormGroup>

      <FormGroup
        label="Contact Email Address"
        helperText="Reports and notifications will be sent to this email address."
      >
        <ControlGroup fill>
          <InputGroup disabled fill value={preferredEmail} />
          <Button icon="edit" onClick={editContactEmail}>
            Edit
          </Button>
        </ControlGroup>
      </FormGroup>

      <FormGroup label="Password">
        <ControlGroup fill>
          <Button icon="key" onClick={changePassword}>
            Change Password
          </Button>
        </ControlGroup>
      </FormGroup>
    </div>
  );
}
