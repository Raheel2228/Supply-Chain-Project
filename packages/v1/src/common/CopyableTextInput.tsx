import React, { useState, useRef } from "react";
import {
  ControlGroup,
  InputGroup,
  FormGroup,
  Button,
  Icon,
} from "@blueprintjs/core";
import { AppToaster } from "./toaster";

interface ICopyableTextInputProps {
  value: string;
  label?: string;
  readOnly: boolean;
  fill?: boolean;
}

/**
 * This component simply displays a (optionally read-only) text input, with a copy
 * button attached to it, to easily copy the text to the user’s clipboard.
 */
export default function CopyableTextInput({
  value,
  label,
  readOnly,
  fill = false,
}: ICopyableTextInputProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const copyText = () => {
    if (!inputRef.current) return;
    // iOS complicates copying text
    // From https://stackoverflow.com/a/34046084/702643
    if (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) {
      const el = inputRef.current;
      const range = document.createRange();

      el.contentEditable = "true";
      el.readOnly = false;
      range.selectNodeContents(el);

      const s = window.getSelection();
      s?.removeAllRanges();
      s?.addRange(range);

      el.setSelectionRange(0, 999999); // A big number, to cover anything that could be inside the element.

      el.contentEditable = "false";
      el.readOnly = readOnly;

      document.execCommand("copy");
    }
    try {
      inputRef.current.select();
      document.execCommand("copy");
      setCopied(true);
      AppToaster.show({
        message: "Copied to clipboard",
        icon: "duplicate",
        intent: "success",
        timeout: 2000,
      });
    } catch (error) {
      AppToaster.show({
        message: "Press ctrl+c to copy.",
        intent: "warning",
      });
    }
  };

  return (
    <FormGroup label={label}>
      <ControlGroup fill={fill}>
        <InputGroup
          type="text"
          inputRef={(ref) => (inputRef.current = ref)}
          readOnly={readOnly}
          value={value}
          onClick={() => inputRef.current?.select()}
          fill={fill}
        />
        <Button
          intent={copied ? "success" : "none"}
          onClick={copyText}
          title="Click to copy link"
        >
          <Icon icon={copied ? "tick" : "clipboard"} />
        </Button>
      </ControlGroup>
    </FormGroup>
  );
}
