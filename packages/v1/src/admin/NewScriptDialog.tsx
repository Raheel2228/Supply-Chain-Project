import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  Classes,
  InputGroup,
  IDialogProps,
  Callout,
} from "@blueprintjs/core";
import { useHistory } from "react-router-dom";
import { useApi } from "../util/api";
import ScriptFileSelector from "./ScriptFileSelector";

interface INewScriptDialogProps extends IDialogProps {
  onClose: () => void;
}

export default function NewScriptDialog({
  isOpen,
  onClose,
  ...rest
}: INewScriptDialogProps) {
  const history = useHistory();

  const [name, setName] = useState<string>("");
  const [scriptFilePath, setScriptFilePath] = useState<string>("");

  const createScript = useApi(
    `/scripts`,
    { method: "POST", body: JSON.stringify({ name, scriptFilePath }) },
    false
  );

  useEffect(() => {
    const newScriptId = createScript.data?.script?.id;
    if (newScriptId) {
      onClose();
      history.push(`/admin/scripts/${newScriptId}`);
    }
  }, [history, createScript, onClose]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (createScript.loading) return;
    createScript.fire();
  };

  return (
    <Dialog
      icon="console"
      title="Create Script"
      onClose={onClose}
      isOpen={isOpen}
      {...rest}
    >
      {createScript.error && (
        <Callout intent="danger">{String(createScript.error)}</Callout>
      )}
      <form onSubmit={handleSubmit}>
        <div className={Classes.DIALOG_BODY}>
          <table style={{ width: "100%" }}>
            <tr>
              <td>Script Name</td>
              <td>
                <InputGroup
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  required
                  type="text"
                  autoFocus
                  fill
                />
              </td>
            </tr>
            <tr>
              <td>Script File</td>
              <td>
                <ScriptFileSelector
                  defaultValue={scriptFilePath}
                  onChange={(newScriptFilePath) =>
                    setScriptFilePath(newScriptFilePath)
                  }
                />
              </td>
            </tr>
          </table>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={onClose} type="button">
              Cancel
            </Button>
            <Button
              type="submit"
              intent="primary"
              loading={createScript.loading}
            >
              Create
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
