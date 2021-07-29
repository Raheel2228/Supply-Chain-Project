import React, { useState, FormEvent } from "react";
import {
  Button,
  Dialog,
  Classes,
  InputGroup,
  Callout,
  Switch,
} from "@blueprintjs/core";
import { useAuthFetch } from "../util/api";
import { AppToaster } from "../common/toaster";
import ClientPrivilegeLevelSelector, {
  PrivilegeLevel,
} from "./ClientPrivilegeLevelSelector";

interface IInviteUserDialogProps {
  isOpen: boolean;
  onClose?: (event?: React.SyntheticEvent<HTMLElement>) => void;
  onAddUser?: () => void;
  clientId?: string;
}

export default function InviteUserDialog({
  isOpen,
  onClose,
  onAddUser,
  clientId,
}: IInviteUserDialogProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [privilegeLevel, setPrivilegeLevel] = useState<PrivilegeLevel>(
    PrivilegeLevel.CLIENT_USER
  );
  const [globalAdmin, setGlobalAdmin] = useState<boolean>(false);

  const authFetch = useAuthFetch();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      let result;
      // If client ID, send invite (which wil create user, if necessary)
      // Both global and client admins can do this
      if (clientId) {
        result = await authFetch(`/invites`, {
          method: "POST",
          body: JSON.stringify({
            clientId,
            name,
            email,
            privilegeLevel,
          }),
        });
      } else {
        // If no client ID, just create user
        // Only global admins can do this
        result = await authFetch(`/users`, {
          method: "POST",
          body: JSON.stringify({ name, email }),
        });
        // If set as global admin, update that
        const userId = result.user.id;
        if (globalAdmin) {
          await authFetch(`/users/globalAdmins/${userId}`, { method: "POST" });
        }
      }

      AppToaster.show({
        message: clientId ? "User invited" : "User created",
        intent: "success",
      });
      onAddUser && onAddUser();
      onClose && onClose();
    } catch (error) {
      let errorString = String(error);
      if (errorString.includes("Unique constraint failed")) {
        errorString = "A user with this email address already exists";
      }
      setError(errorString);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      icon="new-person"
      onClose={onClose}
      title={clientId ? "Invite User" : "Create User"}
      isOpen={isOpen}
    >
      {error && <Callout intent="danger">{error}</Callout>}
      <form onSubmit={handleSubmit}>
        <div className={Classes.DIALOG_BODY}>
          <table style={{ width: "100%" }}>
            <tbody>
              <tr>
                <td>Name</td>
                <td>
                  <InputGroup
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setName(e.target.value)
                    }
                    required
                    type="text"
                    autoFocus
                    autoComplete="off"
                    fill
                  />
                </td>
              </tr>
              <tr>
                <td>Email</td>
                <td>
                  <InputGroup
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    required
                    type="email"
                    autoComplete="off"
                    fill
                  />
                </td>
              </tr>
              <tr>
                <td>Role</td>
                <td style={{ paddingTop: "8px" }}>
                  {clientId && (
                    <ClientPrivilegeLevelSelector
                      value={privilegeLevel}
                      onChange={(newLevel) => setPrivilegeLevel(newLevel)}
                    />
                  )}
                  {!clientId && (
                    <Switch
                      label="Global Admin"
                      checked={globalAdmin}
                      onChange={(e: FormEvent<HTMLInputElement>) => {
                        setGlobalAdmin(e.currentTarget.checked);
                      }}
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          <Callout>
            {clientId
              ? "User will receive an email invitation to create an account, or to access this client workspace in their existing account."
              : "User will receive an email to set their account password."}
            {globalAdmin && (
              <strong>
                <br />
                This user will have acess to all data within all client
                workspaces.
              </strong>
            )}
          </Callout>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={onClose} type="button">
              Cancel
            </Button>
            {/* <Button type="submit" intent="primary">Invite and add another</Button> */}
            <Button type="submit" intent="primary" loading={loading}>
              {clientId ? "Invite" : "Create"}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
