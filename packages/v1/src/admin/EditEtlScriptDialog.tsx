import React, { useState, FormEvent } from "react";
import {
  Button,
  Classes,
  Dialog,
  RadioGroup,
  Radio,
  Callout,
} from "@blueprintjs/core";
import { useAuthFetch } from "../util/api";
import { AppToaster } from "../common/toaster";
import { EtlScript } from "./AdminClientScripts";
import ScriptFileSelector from "./ScriptFileSelector";

interface IEditEtlScriptDialogProps {
  isOpen: boolean;
  onSave?: () => void;
  onClose?: (event?: React.SyntheticEvent<HTMLElement>) => void;
  datasetType: string;
  etlScript?: EtlScript;
  clientId: string;
}

export default function EditEtlScriptDialog({
  isOpen,
  onClose,
  datasetType,
  etlScript,
  onSave,
  clientId,
}: IEditEtlScriptDialogProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [needed, setNeeded] = useState<boolean>(etlScript?.needed ?? true);
  const [scriptFilePath, setScriptFilePath] = useState<string>(
    etlScript?.scriptFilePath ?? ""
  );

  const authFetch = useAuthFetch();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    if (needed && !scriptFilePath.trim()) {
      setError("Please specify script file path, or mark as not needed.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // If ETL script ID, update it
      if (etlScript?.id) {
        if (needed) {
          await authFetch(`/etlScripts/${etlScript.id}`, {
            method: "PATCH",
            body: JSON.stringify({
              needed,
              scriptFilePath,
            }),
          });
        } else {
          await authFetch(`/etlScripts/${etlScript.id}`, { method: "DELETE" });
        }
      } else if (needed) {
        // Otherwise, create ETL script (if needed)
        await authFetch(`/etlScripts`, {
          method: "POST",
          body: JSON.stringify({
            datasetType,
            needed,
            scriptFilePath,
            clientId,
          }),
        });
      }

      AppToaster.show({
        message: "ETL Script updated",
        intent: "success",
      });
      onSave && onSave();
      onClose && onClose();
    } catch (error) {
      setError(String(error));
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog isOpen onClose={onClose} title={`${datasetType} ETL Script`}>
      {error && <Callout intent="danger">{error}</Callout>}
      <form onSubmit={handleSubmit}>
        <div className={Classes.DIALOG_BODY}>
          <RadioGroup
            onChange={(e: FormEvent<HTMLInputElement>) =>
              setNeeded(e.currentTarget.value === "yes")
            }
            selectedValue={needed ? "yes" : "no"}
          >
            <Radio label="Script file:" value="yes" />
            <div style={{ margin: "8px 0 8px 32px" }}>
              <ScriptFileSelector
                disabled={!needed}
                defaultValue={scriptFilePath}
                onChange={(newScriptFilePath) =>
                  setScriptFilePath(newScriptFilePath)
                }
              />
            </div>
            <br />
            <Radio label="ETL script not needed" value="no" />
          </RadioGroup>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" intent="primary" loading={loading}>
              Save
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
