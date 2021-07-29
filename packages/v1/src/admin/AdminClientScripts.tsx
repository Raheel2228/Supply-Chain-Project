import React, { useState, useEffect } from "react";
import {
  Button,
  H3,
  Card,
  H4,
  Popover,
  Position,
  Classes,
  Callout,
  NonIdealState,
  Tag,
} from "@blueprintjs/core";
import { useApi, useAuthFetch } from "../util/api";
import { AppToaster } from "../common/toaster";
import ScriptSelector, { Script } from "./ScriptSelector";
import { Client } from "./AdminClients";
import AdminClientScriptDetails from "./AdminClientScriptDetails";
import { showConfirm } from "../common/ImperativeDialog";

export declare const ScriptProvisionSetupState: {
  NEEDED: "NEEDED";
  PENDING: "PENDING";
  COMPLETE: "COMPLETE";
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export declare type ScriptProvisionSetupState = typeof ScriptProvisionSetupState[keyof typeof ScriptProvisionSetupState];

export type ScriptProvision = {
  scriptId: string;
  clientId: string;
  state: ScriptProvisionSetupState;
  script?: Script;
  client?: Client;
};

export type EtlScript = {
  id: string;
  clientId: string;
  datasetType: string;
  needed: boolean;
  scriptFilePath: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const setupStateIntents: Record<
  ScriptProvisionSetupState,
  "none" | "warning" | "success"
> = {
  NEEDED: "none",
  PENDING: "warning",
  COMPLETE: "success",
};

const setupStateLabels: Record<ScriptProvisionSetupState, string> = {
  NEEDED: "waiting for client",
  PENDING: "waiting for admin",
  COMPLETE: "complete",
};

interface IAdminClientScriptsProps {
  clientId: string;
}

export default function AdminClientScripts({
  clientId,
}: IAdminClientScriptsProps) {
  const [scriptsToAdd, setScriptsToAdd] = useState<Script[]>([]);
  const [etlScriptsMap, setEtlScriptsMap] = useState<Map<string, EtlScript>>(
    () => new Map()
  );

  const authFetch = useAuthFetch();
  const { error, data, fire } = useApi(
    `/scriptProvisions/client/${clientId}?includeScripts=true`
  );

  const { data: etlScriptsData, fire: etlScriptsFire } = useApi(
    `/etlScripts/client/${clientId}`
  );
  useEffect(() => {
    const map = new Map<string, EtlScript>();
    const etls: EtlScript[] = etlScriptsData?.etlScripts || [];
    etls.forEach((etl) => {
      map.set(etl.datasetType, etl);
    });
    setEtlScriptsMap(map);
  }, [etlScriptsData]);

  const handleDetailsChange = () => {
    fire();
    etlScriptsFire();
  };

  if (error) {
    return (
      <Callout intent="danger">Error loading scripts: {String(error)}</Callout>
    );
  }

  const provisions: ScriptProvision[] = data?.scriptProvisions;

  const handleAddScriptsClick = async () => {
    const promises = scriptsToAdd.map((script) =>
      authFetch(`/scriptProvisions/${script.id}/${clientId}`, {
        method: "POST",
      })
        .then(() => {
          AppToaster.show({
            message: `“${script.name}” added`,
            intent: "success",
          });
        })
        .catch((error) => {
          let errorString = String(error);
          let intent: "danger" | "warning" = "danger";
          if (errorString.includes("Unique constraint failed")) {
            errorString = `Client already has “${script.name}”`;
            intent = "warning";
          } else {
            errorString = `Error adding “${script.name}”`;
          }
          AppToaster.show({
            message: errorString,
            intent,
          });
        })
    );
    await Promise.all(promises);
    fire();
  };

  const handleRemoveScriptClick = async (script: Script) => {
    const confirmation = await showConfirm(
      `Remove ${script.name} from this client?`
    );
    if (!confirmation) return;
    try {
      await authFetch(`/scriptProvisions/${script.id}/${clientId}`, {
        method: "DELETE",
      });

      AppToaster.show({
        message: "Script deprovisioned",
      });
      fire();
    } catch (error) {
      console.error(error);
      AppToaster.show({
        message: "Error deprovisioning script",
        intent: "danger",
      });
    }
  };

  const setSetupNeeded = async (script: Script) => {
    const confirmation = await showConfirm(
      `Mark this script as needing setup? This client will be unable to run models based on ${script.name} until the script is re-enabled.`
    );
    if (!confirmation) return;
    try {
      await authFetch(
        `/scriptProvisions/${script.id}/${clientId}/markSetupNeeded`,
        { method: "POST" }
      );

      AppToaster.show({
        message: "Script provision updated",
        intent: "success",
      });
      fire();
    } catch (error) {
      console.error(error);
      AppToaster.show({
        message: "Error updating script provision",
        intent: "danger",
      });
    }
  };

  const handleScriptStatusClick = async (scriptProvision: ScriptProvision) => {
    const script = scriptProvision.script!;
    if (scriptProvision.state === "COMPLETE") {
      setSetupNeeded(script);
      return;
    }

    const confirmation = await showConfirm(
      `Mark this script as ready, and notify the client that models based on ${script.name} are ready to use? Please ensure all needed ETL scripts are set up.`
    );
    if (!confirmation) return;
    try {
      await authFetch(
        `/scriptProvisions/${script.id}/${clientId}/notifyComplete`,
        { method: "POST" }
      );

      AppToaster.show({
        message: "Client notified",
        intent: "success",
      });
      fire();
    } catch (error) {
      console.error(error);
      AppToaster.show({
        message: "Error notifying client",
        intent: "danger",
      });
    }
  };

  return (
    <Card>
      <div style={{ display: "flex" }}>
        <H3 style={{ flexGrow: 1 }}>Provisioned Scripts</H3>
        <Popover
          position={Position.BOTTOM}
          hasBackdrop={true}
          canEscapeKeyClose={false}
          content={
            <div style={{ width: "400px", padding: "16px" }}>
              <ScriptSelector
                label="Select scripts to add"
                onChange={(scripts) => setScriptsToAdd(scripts)}
                defaultValue={scriptsToAdd}
              />
              <br />
              <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button
                  className={Classes.POPOVER_DISMISS}
                  onClick={() => setScriptsToAdd([])}
                >
                  Cancel
                </Button>
                <Button
                  intent="primary"
                  onClick={handleAddScriptsClick}
                  className={Classes.POPOVER_DISMISS}
                  disabled={!scriptsToAdd.length}
                >
                  Save
                </Button>
              </div>
            </div>
          }
          target={<Button intent="primary" text="Add Scripts" icon="plus" />}
        />
      </div>
      {provisions?.length === 0 && (
        <NonIdealState
          title="No Scripts"
          description="Provision scripts to allow this client to create models."
          icon="console"
        />
      )}
      {provisions?.length > 0 && (
        <>
          {provisions.map((provision) => (
            <React.Fragment key={provision.scriptId}>
              <div
                style={{ display: "flex", marginTop: "16px", padding: "4px" }}
              >
                <H4 style={{ marginBottom: "-8px" }}>
                  {provision.script!.name}
                </H4>
                <Button
                  style={{ margin: "-8px 0 0 8px" }}
                  minimal
                  intent="danger"
                  onClick={() => handleRemoveScriptClick(provision.script!)}
                  title="Remove"
                  icon="trash"
                />
                <div style={{ flex: 1 }} />
                <Button
                  minimal={provision.state !== "PENDING"}
                  intent="primary"
                  onClick={() => handleScriptStatusClick(provision)}
                  text={
                    provision.state === "COMPLETE"
                      ? "Mark as Setup Needed"
                      : "Enable Script & Notify Ready"
                  }
                />
                &nbsp;&nbsp;
                <Tag intent={setupStateIntents[provision.state]} minimal>
                  Setup status: {setupStateLabels[provision.state]}
                </Tag>
              </div>
              <AdminClientScriptDetails
                mode="globalAdmin"
                clientId={clientId}
                script={provision.script!}
                etlScriptsMap={etlScriptsMap}
                onChange={handleDetailsChange}
              />
            </React.Fragment>
          ))}
        </>
      )}
    </Card>
  );
}
