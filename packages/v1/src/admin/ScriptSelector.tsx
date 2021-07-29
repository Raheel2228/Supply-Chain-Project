import React, { useState, useEffect, SyntheticEvent } from "react";
import { MenuItem } from "@blueprintjs/core";
import { ItemRenderer, MultiSelect } from "@blueprintjs/select";
import { useApi } from "../util/api";
import { ScriptSchema } from "../util/scriptSchema";

export type Script = {
  id: string;
  name: string;
  scriptFilePath: string;
  schema: ScriptSchema;
  createdAt: Date;
  updatedAt: Date;
};

const areScriptsEqual = (a: Script, b: Script) =>
  a.id === b.id || a.name.toLowerCase() === b.name.toLowerCase();

const ScriptMultiSelect = MultiSelect.ofType<Script>();

interface ScriptSelectorProps {
  label?: string;
  onChange?: (scripts: Script[]) => void;
  defaultValue?: Script[];
}

export default function ScriptSelector({
  label = "Select scripts",
  onChange,
  defaultValue = [],
}: ScriptSelectorProps) {
  const [scripts, setScripts] = useState<Script[]>(defaultValue);

  const { data } = useApi("/scripts");

  // Send new script selection to parent
  useEffect(() => {
    onChange && onChange(scripts);
  }, [onChange, scripts]);

  const handleScriptSelect = (
    script: Script,
    event?: SyntheticEvent<HTMLElement>
  ) => {
    event?.preventDefault();
    event?.stopPropagation();

    const scriptIndex = scripts.indexOf(script);
    if (scriptIndex === -1) {
      setScripts([...scripts, script]);
    } else {
      setScripts(
        scripts.filter((_script) => !areScriptsEqual(_script, script))
      );
    }
  };
  const handleScriptRemove = (script: string, index: number) => {
    setScripts(scripts.filter((_script, i) => i !== index));
  };

  const renderScript: ItemRenderer<Script> = (
    script,
    { modifiers, handleClick }
  ) => {
    if (!modifiers.matchesPredicate) return null;
    return (
      <MenuItem
        active={modifiers.active}
        icon={scripts.includes(script) ? "tick" : "blank"}
        key={script.id}
        onClick={handleClick}
        text={script.name}
        shouldDismissPopover={false}
      />
    );
  };
  return (
    <ScriptMultiSelect
      fill
      itemPredicate={(query, item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      }
      itemRenderer={renderScript}
      itemsEqual={areScriptsEqual}
      items={data?.scripts || []}
      noResults={<MenuItem disabled={true} text="No results." />}
      onItemSelect={handleScriptSelect}
      popoverProps={{ minimal: true }}
      tagRenderer={(script) => script.name}
      tagInputProps={{
        // leftIcon: "console",
        // @ts-ignore
        onRemove: handleScriptRemove,
      }}
      placeholder={label}
      selectedItems={scripts}
      resetOnSelect
    />
  );
}
