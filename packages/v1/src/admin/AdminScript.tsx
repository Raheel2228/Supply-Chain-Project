import React, { useState } from "react";
import {
  Breadcrumbs,
  IBreadcrumbProps,
  Button,
  Tooltip,
  Callout,
  Card,
  H3,
  H6,
  Classes,
} from "@blueprintjs/core";
import ModelInput from "../model/ModelInput";
import { useHistory, useParams } from "react-router";
import RenamePopover from "../common/RenamePopover";
import DelayedSpinner from "../common/DelayedSpinner";
import { useAuthFetch, useApi } from "../util/api";
import { AppToaster } from "../common/toaster";
import { Script } from "./ScriptSelector";
import ScriptFileSelector from "./ScriptFileSelector";
import DatasetLabel from "../dataset/DatasetLabel";
import { Helmet } from "react-helmet-async";
import RouterBreadcrumb, { routerBreadcrumbRenderer } from "../nav/RouterBreadcrumb";
import { showPrompt } from "../common/ImperativeDialog";

export interface AdminScriptParams {
  scriptId: string;
}

export default function AdminScript() {
  const history = useHistory();
  const { scriptId } = useParams<AdminScriptParams>();
  const [updating, setUpdating] = useState<boolean>(false);

  const authFetch = useAuthFetch();
  const { error, data, fire } = useApi(`/scripts/${scriptId}`);

  if (error) {
    return <Callout intent="danger">{String(error)}</Callout>;
  } else if (!data) {
    return <DelayedSpinner />;
  }

  const script: Script = data.script;
  const scriptSchema = script.schema;

  const handleDeleteClick = async () => {
    const confirmation = await showPrompt(
      "This will permanently delete all models and reports associated with this script. This action cannot be undone. Type “delete” to continue.",
      "",
      "Delete",
      "Cancel",
      true
    );
    if (confirmation?.trim().toLowerCase() === "delete") {
      setUpdating(true);
      try {
        await authFetch(`/scripts/${scriptId}`, {
          method: "DELETE",
        });
        AppToaster.show({
          message: "Script deleted",
          intent: "primary",
          icon: "trash",
        });
        history.replace("/admin/scripts");
      } catch (error) {
        AppToaster.show({
          message: `Error deleting script: ${error.toString()}`,
          intent: "danger",
        });
      } finally {
        setUpdating(false);
      }
    }
  };

  // Allow updating name or script file path independently
  const handleUpdate = async (
    name = script.name,
    scriptFilePath = script.scriptFilePath
  ) => {
    setUpdating(true);
    try {
      await authFetch(`/scripts/${scriptId}`, {
        method: "PATCH",
        body: JSON.stringify({ name, scriptFilePath }),
      });
      AppToaster.show({
        message: "Script updated",
        intent: "success",
      });
      fire();
    } catch (error) {
      AppToaster.show({
        message: `Error updating script: ${error.toString()}`,
        intent: "danger",
      });
    } finally {
      setUpdating(false);
    }
  };

  const breadcrumbs: IBreadcrumbProps[] = [
    { href: "/admin/scripts", text: "Scripts" },
    { href: `/admin/scripts/${script.id}`, text: script.name, current: true },
  ];

  const currentBreadcrumbRenderer = (props: IBreadcrumbProps) => (
    <>
      <RouterBreadcrumb current {...props} />
      <RenamePopover
        currentName={script.name}
        onSave={handleUpdate}
        target={
          <Tooltip content="Rename Script">
            <Button icon="edit" disabled={updating} />
          </Tooltip>
        }
        label="Script Name"
      />
    </>
  );

  return (
    <>
      <Helmet>
        <title>{script.name}</title>
      </Helmet>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={breadcrumbs}
          breadcrumbRenderer={routerBreadcrumbRenderer}
          currentBreadcrumbRenderer={currentBreadcrumbRenderer}
        />
      </div>

      <br />

      <div style={{ margin: "0 auto", maxWidth: "500px" }}>
        <H3>Preview of Inputs</H3>
        <Card>
          {scriptSchema.inputDatasets?.map((dataset) => (
            <DatasetLabel key={dataset.id} {...dataset} />
          ))}
          {scriptSchema.inputs?.map((input) => (
            <ModelInput
              key={input.id}
              value={input.defaultValue || ""}
              {...input}
              onChange={() => {}}
              clientId={""}
            />
          ))}
        </Card>
        <br />

        <H3>Raw JSON Schema</H3>
        <pre
          className={Classes.CODE_BLOCK}
          style={{ textAlign: "left", overflowX: "auto" }}
        >
          {JSON.stringify(scriptSchema, null, 2)}
        </pre>
        <br />

        <H3>Danger Zone</H3>
        <Card>
          <Callout intent="warning">
            The inputs and input datasets of the schema
            <em> must not be modified</em> (except for changing their
            titles/descriptions or adding optional inputs). If material changes
            need to be made to the script schema, a new and separate script
            should be created.
          </Callout>
          <H6 style={{ margin: "16px 0" }}>Script File</H6>
          <ScriptFileSelector
            disabled={updating}
            defaultValue={script.scriptFilePath}
            onChange={(newScriptFilePath) => {
              if (newScriptFilePath !== script.scriptFilePath) {
                handleUpdate(script.name, newScriptFilePath);
              }
            }}
          />
          <br />
          <Callout>
            If you have modified the schema without changing the script file,
            reload it to ensure changes are visible in clients’ models.
            <Button
              style={{ margin: "8px auto 0 auto", display: "block" }}
              outlined
              icon="refresh"
              text="Reload Script Schema"
              onClick={() => handleUpdate()}
              disabled={updating}
            />
          </Callout>
          <br />
          <Button
            outlined
            intent="danger"
            text="Permanently Delete Script"
            icon="trash"
            disabled={updating}
            onClick={handleDeleteClick}
          />
        </Card>
      </div>
    </>
  );
}
