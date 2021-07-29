import React, { useState } from "react";
import {
  Button,
  Dialog,
  Classes,
  InputGroup,
  IDialogProps,
  Callout,
} from "@blueprintjs/core";
import { useHistory } from "react-router-dom";
import ScriptSelector, { Script } from "./ScriptSelector";
import { useAuthFetch } from "../util/api";
import { AppToaster } from "../common/toaster";

interface INewClientDialogProps extends IDialogProps {
  onClose: () => void;
}

export default function NewClientDialog({
  isOpen,
  onClose,
  ...rest
}: INewClientDialogProps) {
  const history = useHistory();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [name, setName] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [scripts, setScripts] = useState<Script[]>([]);

  const authFetch = useAuthFetch();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const clientResult = await authFetch(`/clients`, {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          id: id.trim(),
          logoUrl: logoUrl.trim(),
        }),
      });
      const newClientId = clientResult.client?.id;

      if (newClientId) {
        // Add the selected ETL scripts
        const promises = scripts.map((script) =>
          authFetch(`/scriptProvisions/${script.id}/${newClientId}`, {
            method: "POST",
          })
            .then(() => {})
            .catch(() => {
              // Notify user if script failed to add, but don’t stop the process
              AppToaster.show({
                message: `Error adding “${script.name}” to client`,
                intent: "danger",
              });
            })
        );
        await Promise.all(promises);
        onClose();
        history.push(`/admin/clients/${newClientId}`);
      }
    } catch (error) {
      setLoading(false);
      setError(String(error));
    }
  };

  return (
    <Dialog
      icon="office"
      title="Create Client"
      onClose={onClose}
      isOpen={isOpen}
      {...rest}
    >
      {error && <Callout intent="danger">{error}</Callout>}
      <form onSubmit={handleSubmit}>
        <div className={Classes.DIALOG_BODY}>
          <table style={{ width: "100%" }}>
            <tbody>
              <tr>
                <td>Client Name</td>
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
                <td>Client ID</td>
                <td>
                  <InputGroup
                    value={id}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setId(e.target.value.toLowerCase())
                    }
                    required
                    type="text"
                    fill
                    pattern="[a-z0-9]{3,12}"
                    placeholder="Short, human-readable ID"
                    title="Unique, short ID consisting of 3–12 numbers or letters"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  Client Logo{" "}
                  <span className={Classes.TEXT_MUTED}>(Optional)</span>
                </td>
                <td>
                  {/* <FileInput text="Upload a PNG or JPG logo" /> */}
                  <InputGroup
                    type="text"
                    fill
                    placeholder="Enter image URL"
                    value={logoUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setLogoUrl(e.target.value)
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>Provisioned Scripts</td>
                <td>
                  <ScriptSelector
                    onChange={(scripts) => setScripts(scripts)}
                    defaultValue={scripts}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" intent="primary" loading={loading}>
              Create
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
