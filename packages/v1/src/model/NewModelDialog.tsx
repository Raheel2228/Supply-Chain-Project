import React, { useState, ChangeEvent, useEffect } from "react";
import {
  Button,
  Dialog,
  Classes,
  InputGroup,
  FormGroup,
  HTMLSelect,
  Callout,
} from "@blueprintjs/core";
import { useHistory } from "react-router-dom";
import { Script } from "../admin/ScriptSelector";
import { useApi, useAuthFetch } from "../util/api";
import useQueryParams from "../util/useQueryParams";
import { useUserState } from "../common/UserDataLoader";
import { PrivilegeLevel } from "../admin/ClientPrivilegeLevelSelector";
import { ScriptProvision } from "../admin/AdminClientScripts";
import { ScriptPrivilege } from "../admin/UserScriptPrivilegesDialog";
import { Model } from "./Models";

interface INewModelDialogProps {
  isOpen: boolean;
  onClose?: (event?: React.SyntheticEvent<HTMLElement>) => void;
  defaultScriptId?: string;
}

export default function NewModelDialog({
  isOpen,
  onClose,
  defaultScriptId = "",
}: INewModelDialogProps) {
  const history = useHistory();
  const { clientId } = useQueryParams();
  const { user, clientPrivilegeLevel } = useUserState();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [name, setName] = useState<string>("");
  const [scriptId, setScriptId] = useState<string>(defaultScriptId);

  const [allowedScripts, setAllowedScripts] = useState<Script[]>([]);

  const scriptProvisionsQuery = useApi(`/scriptProvisions/client/${clientId}`);
  const scriptPrivilegesQuery = useApi(
    `/scriptPrivileges/client/${clientId}/user/${user?.id}`
  );
  const modelsQuery = useApi(`/models/?clientId=${clientId}`);

  useEffect(() => {
    // Compute both explicit and implicit script access
    if (
      scriptProvisionsQuery.data?.scriptProvisions &&
      scriptPrivilegesQuery.data?.scriptPrivileges &&
      modelsQuery.data?.models
    ) {
      // Global or client admin can use all scripts
      if (
        user?.globalAdmin ||
        clientPrivilegeLevel === PrivilegeLevel.CLIENT_ADMIN
      ) {
        setAllowedScripts(
          scriptProvisionsQuery.data.scriptProvisions.map(
            (provision: ScriptProvision) => provision.script
          )
        );
        return;
      }
      const scriptIds: string[] = scriptPrivilegesQuery.data.scriptPrivileges.map(
        (privilege: ScriptPrivilege) => privilege.scriptId
      );
      const modelScriptIds: string[] = modelsQuery.data.models.map(
        (model: Model) => model.scriptId
      );
      const newAllowedScripts: Script[] = [];
      scriptProvisionsQuery.data.scriptProvisions.forEach(
        ({ script }: ScriptProvision) => {
          const id = script!.id;
          if (scriptIds.includes(id) || modelScriptIds.includes(id)) {
            newAllowedScripts.push(script as Script);
          }
        }
      );
      setAllowedScripts(newAllowedScripts);
    }
  }, [
    clientPrivilegeLevel,
    modelsQuery.data,
    scriptPrivilegesQuery.data,
    scriptProvisionsQuery.data,
    user,
  ]);

  const authFetch = useAuthFetch();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    if (!scriptId) {
      setError("Please select a model template.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await authFetch(`/models`, {
        method: "POST",
        body: JSON.stringify({
          clientId,
          scriptId,
          name,
        }),
      });

      const newModelId = result.model.id;
      history.push(`/modelSetup/${newModelId}?clientId=${clientId}`);
    } catch (error) {
      setError(String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      icon="cube-add"
      onClose={onClose}
      title="Create Model"
      isOpen={isOpen}
    >
      {error && <Callout intent="danger">{error}</Callout>}
      <form onSubmit={handleSubmit}>
        <div className={Classes.DIALOG_BODY}>
          <FormGroup
            label="Model Name"
            labelFor="modelNameInput"
            labelInfo="(required)"
          >
            <InputGroup
              id="modelNameInput"
              type="text"
              autoComplete="off"
              required
              autoFocus
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
            />
          </FormGroup>
          <FormGroup
            label="Model Template"
            labelFor="modelScriptInput"
            labelInfo="(required)"
          >
            <HTMLSelect
              value={scriptId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setScriptId(e.currentTarget.value)
              }
            >
              <option value="">(None)</option>
              {allowedScripts.map((script: Script) => (
                <option key={script.id} value={script.id}>
                  {script.name}
                </option>
              ))}
            </HTMLSelect>
          </FormGroup>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={onClose} type="button" text="Cancel" />
            <Button
              intent="primary"
              type="submit"
              loading={loading}
              text="Create"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
}
