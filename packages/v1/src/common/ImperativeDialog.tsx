import React, { useState } from "react";
import {
  Dialog,
  FormGroup,
  InputGroup,
  Classes,
  Button,
} from "@blueprintjs/core";
import { render, unmountComponentAtNode } from "react-dom";

export async function showConfirm(
  message: string,
  confirmButton = "OK",
  cancelButton = "Cancel",
  destructive = false
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const dialogRoot = document.createElement("div");
    document.body.appendChild(dialogRoot);

    const onFinish = (result: boolean) => {
      unmountComponentAtNode(dialogRoot);
      document.body.removeChild(dialogRoot);
      resolve(result);
    };

    const onCancel = () => onFinish(false);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onFinish(true);
    };

    render(
      <Dialog
        isOpen
        onClose={onCancel}
        canOutsideClickClose={false}
        enforceFocus
      >
        <div className={Classes.DIALOG_BODY}>{message}</div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <form onSubmit={handleSubmit}>
              <Button type="button" onClick={onCancel}>
                {cancelButton}
              </Button>
              <Button
                intent={destructive ? "danger" : "primary"}
                type="submit"
                autoFocus
              >
                {confirmButton}
              </Button>
            </form>
          </div>
        </div>
      </Dialog>,
      dialogRoot
    );
  });
}

export async function showPrompt(
  message: string,
  defaultValue = "",
  confirmButton = "OK",
  cancelButton = "Cancel",
  destructive = false
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const dialogRoot = document.createElement("div");
    document.body.appendChild(dialogRoot);

    const onSubmit = (result: string | null) => {
      unmountComponentAtNode(dialogRoot);
      document.body.removeChild(dialogRoot);
      resolve(result);
    };

    const onCancel = () => onSubmit(null);

    render(
      <PromptDialog
        {...{
          message,
          defaultValue,
          confirmButton,
          cancelButton,
          destructive,
          onSubmit,
          onCancel,
        }}
      />,
      dialogRoot
    );
  });
}

interface IPromptDialogProps {
  message: string;
  defaultValue: string;
  onSubmit: (result: string) => void;
  onCancel: () => void;
  confirmButton?: string;
  cancelButton?: string;
  destructive?: boolean;
}

function PromptDialog({
  message,
  defaultValue,
  onSubmit,
  onCancel,
  confirmButton,
  cancelButton,
  destructive,
}: IPromptDialogProps) {
  const [value, setValue] = useState<string>(defaultValue);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <Dialog isOpen onClose={onCancel} canOutsideClickClose={false} enforceFocus>
      <form onSubmit={handleSubmit}>
        <div className={Classes.DIALOG_BODY}>
          <FormGroup label={message} labelFor="promptInput">
            <InputGroup
              id="promptInput"
              autoFocus
              autoComplete="off"
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setValue(e.target.value)
              }
              style={{ marginTop: "8px" }}
              required
            />
          </FormGroup>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button type="button" onClick={onCancel}>
              {cancelButton}
            </Button>
            <Button intent={destructive ? "danger" : "primary"} type="submit">
              {confirmButton}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
