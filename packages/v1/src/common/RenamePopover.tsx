import React, { useState } from "react";
import {
  Popover,
  FormGroup,
  InputGroup,
  Classes,
  Button,
  IPopoverProps,
} from "@blueprintjs/core";

interface IRenamePopoverProps extends IPopoverProps {
  label: string;
  currentName: string;
  onSave: (newName: string) => void;
  target: string | JSX.Element;
}

export default function RenamePopover({
  label,
  currentName,
  onSave,
  target,
  ...rest
}: IRenamePopoverProps) {
  const [name, setName] = useState<string>(currentName);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(name.trim());
  };

  return (
    <Popover
      hasBackdrop
      content={
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "16px", width: "300px" }}>
            <FormGroup label={label} labelFor="renameInput">
              <InputGroup
                id="renameInput"
                autoFocus
                autoComplete="off"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
              />
            </FormGroup>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button className={Classes.POPOVER_DISMISS} type="button">
                Cancel
              </Button>
              <Button
                className={Classes.POPOVER_DISMISS}
                intent="primary"
                type="submit"
              >
                Save
              </Button>
            </div>
          </div>
        </form>
      }
      target={target}
      {...rest}
    />
  );
}
