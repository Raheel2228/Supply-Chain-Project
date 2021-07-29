import React, { useState, SyntheticEvent } from "react";
import { MenuItem, Button } from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import { useApi } from "../util/api";

export type ScriptFile = {
  scriptFilePath: string;
  updatedAt: string;
};

const areScriptFilesEqual = (a: ScriptFile, b: ScriptFile) =>
  a.scriptFilePath === b.scriptFilePath;

const ScriptFileSelect = Select.ofType<ScriptFile>();

interface ScriptFileselectorProps {
  label?: string;
  onChange?: (scriptFilePath: string) => void;
  defaultValue?: string;
  disabled?: boolean;
}

export default function ScriptFileSelector({
  label = "Select script file",
  onChange,
  defaultValue = "",
  disabled = false,
}: ScriptFileselectorProps) {
  const [scriptFilePath, setScriptFilePath] = useState<string>(defaultValue);

  const { data } = useApi("/scriptFiles");

  const handleScriptFileSelect = (
    scriptFile: ScriptFile,
    event?: SyntheticEvent<HTMLElement>
  ) => {
    event?.preventDefault();
    event?.stopPropagation();

    // Send new script file path to parent
    onChange && onChange(scriptFile.scriptFilePath);
    setScriptFilePath(scriptFile.scriptFilePath);
  };

  const renderScript: ItemRenderer<ScriptFile> = (
    scriptFile,
    { modifiers, handleClick }
  ) => {
    if (!scriptFile.scriptFilePath || !modifiers.matchesPredicate) {
      return null;
    }
    return (
      <MenuItem
        active={modifiers.active}
        key={scriptFile.scriptFilePath}
        icon={scriptFilePath === scriptFile.scriptFilePath ? "tick" : "blank"}
        onClick={handleClick}
        text={scriptFile.scriptFilePath}
        shouldDismissPopover
      />
    );
  };

  return (
    <>
      <ScriptFileSelect
        itemPredicate={(query, item) =>
          item.scriptFilePath.toLowerCase().includes(query.toLowerCase())
        }
        itemRenderer={renderScript}
        itemsEqual={areScriptFilesEqual}
        items={data?.scriptFiles || []}
        noResults={<MenuItem disabled={true} text="No results." />}
        onItemSelect={handleScriptFileSelect}
        popoverProps={{ minimal: true, fill: true }}
        disabled={disabled}
      >
        <Button
          fill
          icon="code-block"
          disabled={disabled}
          text={scriptFilePath || "Select script file…"}
          rightIcon="double-caret-vertical"
        />
      </ScriptFileSelect>
    </>
  );
}
