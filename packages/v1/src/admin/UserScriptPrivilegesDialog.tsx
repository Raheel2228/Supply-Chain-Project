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
import { PrivilegeLevel } from "./ClientPrivilegeLevelSelector";
import { ScriptProvision } from "./AdminClientScripts";

export type ScriptPrivilege = {
  scriptId: string;
  clientId: string;
  userId: string;
  privilegeLevel: PrivilegeLevel;
};

interface IUserScriptPrivilegesDialogProps {
  isOpen: boolean;
  onSave?: () => void;
  onClose?: (event?: React.SyntheticEvent<HTMLElement>) => void;
  clientId: string;
  userId: string;
}

export default function UserScriptPrivilegesDialog({
  isOpen,
  onClose,
  onSave,
  clientId,
  userId,
}: IUserScriptPrivilegesDialogProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const authFetch = useAuthFetch();

  // The scripts the client has access to
  const scriptProvisionsQuery = useApi(
    `/scriptProvisions/client/${clientId}?includeScripts=true`
  );
  // The scripts the user has access to
  const scriptPrivilegesQuery = useApi(
    `/scriptPrivileges/client/${clientId}/user/${userId}`
  );

  const scriptProvisions: ScriptProvision[] =
    scriptProvisionsQuery.data?.scriptProvisions;

  const scriptPrivileges: ScriptPrivilege[] =
    scriptPrivilegesQuery.data?.scriptPrivileges;

  const handleScriptPrivilegeChange = async (
    scriptId: string,
    privileged: boolean
  ) => {
    setLoading(true);
    setError("");
    try {
      if (!clientId || !scriptId) {
        throw new Error("Missing client ID or script ID");
      }
      // Create or delete restriction
      const method = privileged ? "POST" : "DELETE";
      await authFetch(`/scriptPrivileges/${clientId}/${scriptId}/${userId}`, {
        method,
      });

      onSave && onSave();
      scriptPrivilegesQuery.fire();
    } catch (error) {
      setError(String(error));
    } finally {
      setLoading(false);
    }
  };

  const anyError =
    error || scriptProvisionsQuery.error || scriptPrivilegesQuery.error;

  return (
    <Dialog isOpen onClose={onClose} title="Script Access">
      <Callout icon="info-sign">
        In addition to scripts selected below, users implicitly have access to
        scripts used by any models shared with them.
      </Callout>
      {anyError && <Callout intent="danger">{anyError}</Callout>}
      <div className={Classes.DIALOG_BODY}>
        {(!scriptPrivileges || !scriptProvisions) && <Spinner />}
        {scriptPrivileges && scriptProvisions && (
          <UL style={{ listStyle: "none" }}>
            {scriptProvisions.map((scriptProvision) => {
              const privileged =
                scriptPrivileges.filter(
                  (privilege) => privilege.scriptId === scriptProvision.scriptId
                ).length > 0;
              return (
                <li key={scriptProvision.scriptId}>
                  <Checkbox
                    disabled={loading || scriptPrivilegesQuery.loading}
                    checked={privileged}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleScriptPrivilegeChange(
                        scriptProvision.scriptId,
                        e.target.checked
                      )
                    }
                    label={scriptProvision.script?.name}
                  />
                </li>
              );
            })}
          </UL>
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
