import React from "react";
import { MenuItem, Button } from "@blueprintjs/core";
import { Select, ItemRenderer } from "@blueprintjs/select";
import { ReportState } from "../report/Reports";

export enum StateFilterValue {
  ALL = "ALL",
  UNSAVED = "UNSAVED",
  SAVED = "SAVED",
  ARCHIVED = "ARCHIVED",
}

const { ALL, UNSAVED, SAVED, ARCHIVED } = StateFilterValue;

const capitalize = (s: string) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const stateLabel = (value: StateFilterValue | ReportState) =>
  capitalize(value.toString().toLowerCase());

const StateFilterValueSelect = Select.ofType<StateFilterValue>();

interface IStateFilterProps {
  value: StateFilterValue;
  onChange: (newValue: StateFilterValue) => void;
}

const itemRenderer: ItemRenderer<StateFilterValue> = (
  value,
  { modifiers, handleClick }
) => {
  return (
    <MenuItem
      active={modifiers.active}
      key={value}
      onClick={handleClick}
      text={stateLabel(value)}
      shouldDismissPopover={false}
    />
  );
};

export default function StateFilter({ value, onChange }: IStateFilterProps) {
  return (
    <StateFilterValueSelect
      items={[ALL, UNSAVED, SAVED, ARCHIVED]}
      itemRenderer={itemRenderer}
      onItemSelect={(item) => onChange(item)}
      popoverProps={{ minimal: true }}
      filterable={false}
      activeItem={value}
    >
      <Button
        icon="folder-open"
        rightIcon="caret-down"
        text={stateLabel(value)}
      />
    </StateFilterValueSelect>
  );
}
