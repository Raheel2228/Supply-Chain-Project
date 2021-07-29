import React from "react";
import { MenuItem, Button, Menu } from "@blueprintjs/core";
import { Select, ItemRenderer, ItemListRenderer } from "@blueprintjs/select";
import { ReportState } from "../report/Reports";
import { stateLabel } from "./StateFilter";

const { UNSAVED, SAVED, ARCHIVED } = ReportState;

const ReportStateSelect = Select.ofType<ReportState>();

interface IStateSelectorProps {
  value: ReportState;
  onChange: (newValue: ReportState) => void;
  disabled?: boolean;
}

const renderMenu: ItemListRenderer<ReportState> = ({ items, itemsParentRef, query, renderItem }) => {
  const renderedItems = items.map(renderItem).filter(item => item != null);
  return (
      <Menu ulRef={itemsParentRef}>
          <MenuItem
              disabled={true}
              text="Move report to…"
          />
          {renderedItems}
      </Menu>
  );
};

const itemRenderer: ItemRenderer<ReportState> = (
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

export default function StateSelector({
  value,
  onChange,
  disabled = false,
}: IStateSelectorProps) {
  return (
    <ReportStateSelect
      items={[UNSAVED, SAVED, ARCHIVED]}
      itemListRenderer={renderMenu}
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
        disabled={disabled}
      />
    </ReportStateSelect>
  );
}
