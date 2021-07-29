import React, { useState, ChangeEvent } from "react";
import {
  Button,
  Classes,
  Dialog,
  Callout,
  UL,
  Checkbox,
  Spinner,
} from "@blueprintjs/core";
import { useAuthFetch, useApi } from "../util/api";
import { PrivilegeLevel } from "../admin/ClientPrivilegeLevelSelector";
import { ClientPrivilege } from "../admin/AdminClient";
import { Model } from "./Models";
import { useUserState } from "../common/UserDataLoader";
import { useHistory } from "react-router";
import { showConfirm } from "../common/ImperativeDialog";
import { clientPath } from "../util/route";
import { UserLabel } from "../user/UserSelector";

export type ModelPrivilege = {
  modelId: string;
  userId: string;
  privilegeLevel: PrivilegeLevel;
};

interface IModelPrivilegesDialogProps {
  isOpen: boolean;
  onSave?: () => void;
  onClose?: (event?: React.SyntheticEvent<HTMLElement>) => void;
  clientId: string;
  model: Model;
}

export default function ModelPrivilegesDialog({
  isOpen,
  onClose,
  onSave,
  clientId,
  model,
}: IModelPrivilegesDialogProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const history = useHistory();
  const { user } = useUserState();
  const authFetch = useAuthFetch();

  // The users in this client
  const clientPrivilegesQuery = useApi(`/clientPrivileges/${clientId}`);

  // The users that have access to this model
  const modelPrivilegesQuery = useApi(`/modelPrivileges/${model.id}`);

  const clientPrivileges: ClientPrivilege[] =
    clientPrivilegesQuery.data?.clientPrivileges;

  const modelPrivileges: ModelPrivilege[] =
    modelPrivilegesQuery.data?.modelPrivileges;

  const handleModelPrivilegeChange = async (
    userId: string,
    privileged: boolean
  ) => {
    setLoading(true);
    setError("");
    try {
      if (!clientId || !userId) {
        throw new Error("Missing client ID or user ID");
      }
      if (userId === user?.id && privileged === false) {
        if (!(await showConfirm("Remove yourself from this model?"))) return;
      }
      // Create or delete privilege
      const method = privileged ? "POST" : "DELETE";
      await authFetch(`/modelPrivileges/${model.id}/${userId}`, {
        method,
      });
      // If user removed own access, return to models list.
      if (userId === user?.id && privileged === false) {
        history.replace(clientPath(clientId, "models"));
      }

      onSave && onSave();
      modelPrivilegesQuery.fire();
    } catch (error) {
      setError(String(error));
    } finally {
      setLoading(false);
    }
  };

  const anyError =
    error || clientPrivilegesQuery.error || modelPrivilegesQuery.error;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Invite Collaborators to “${model.name}”`}
    >
      <Callout icon="info-sign">
        Collaborators have full access, including adding/removing collaborators
        and viewing all reports created by this model.
      </Callout>
      {anyError && <Callout intent="danger">{anyError}</Callout>}
      <div className={Classes.DIALOG_BODY}>
        <p>Allow access to these workspace users:</p>
        {(!modelPrivileges || !clientPrivileges) && <Spinner />}
        {modelPrivileges && clientPrivileges && (
          <UL style={{ listStyle: "none" }}>
            {clientPrivileges.map((clientPrivilege) => {
              const observer =
                clientPrivilege.privilegeLevel ===
                PrivilegeLevel.CLIENT_OBSERVER;
              const privileged =
                modelPrivileges.filter(
                  (privilege) => privilege.userId === clientPrivilege.userId
                ).length > 0;
              return (
                <li key={clientPrivilege.userId}>
                  <Checkbox
                    disabled={
                      loading || modelPrivilegesQuery.loading || observer
                    }
                    checked={privileged}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleModelPrivilegeChange(
                        clientPrivilege.userId,
                        e.target.checked
                      )
                    }
                    labelElement={<UserLabel user={clientPrivilege.user!} />}
                  />
                </li>
              );
            })}
          </UL>
          // TODO add button if globalAdmin or clientAdmin to invite new user
        )}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button type="button" onClick={onClose} loading={loading}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
