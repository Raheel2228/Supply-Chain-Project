import { Classes, Radio, RadioGroup } from "@blueprintjs/core";
import React, { FormEvent } from "react";

export enum PrivilegeLevel {
  CLIENT_ADMIN = "CLIENT_ADMIN",
  CLIENT_USER = "CLIENT_USER",
  CLIENT_OBSERVER = "CLIENT_OBSERVER",
  MODEL_FULL_ACCESS = "MODEL_FULL_ACCESS",
  REPORT_OWNER = "REPORT_OWNER",
  REPORT_VIEW_ONLY = "REPORT_VIEW_ONLY",
  SCRIPT_VIEW_ONLY = "SCRIPT_VIEW_ONLY",
}

export const privilegeLabel = (privilege: PrivilegeLevel) => {
  switch (privilege) {
    case PrivilegeLevel.CLIENT_ADMIN:
      return "Client Admin";
    case PrivilegeLevel.CLIENT_USER:
      return "Regular User";
    case PrivilegeLevel.CLIENT_OBSERVER:
      return "Observer";
    default:
      return privilege;
  }
};

export const privilegeDescription = (privilege: PrivilegeLevel) => {
  switch (privilege) {
    case PrivilegeLevel.CLIENT_ADMIN:
      return "Can view and modify all users’ models, datasets, and reports in the workspace. Can manage users and restricted dataset types.";
    case PrivilegeLevel.CLIENT_USER:
      return "Can view and modify specific models, datasets, and reports in the workspace.";
    case PrivilegeLevel.CLIENT_OBSERVER:
      return "Can only view reports shared with them (no model or dataset access).";
    default:
      return "";
  }
};

interface ClientPrivilegeLevelSelectorProps {
  value: PrivilegeLevel;
  onChange: (newPrivilegeLevel: PrivilegeLevel) => void;
}

const clientPrivilegeLevels = [
  PrivilegeLevel.CLIENT_ADMIN,
  PrivilegeLevel.CLIENT_USER,
  PrivilegeLevel.CLIENT_OBSERVER,
];

export default function ClientPrivilegeLevelSelector({
  value,
  onChange,
}: ClientPrivilegeLevelSelectorProps) {
  return (
    <RadioGroup
      onChange={(e: FormEvent<HTMLInputElement>) =>
        onChange(e.currentTarget.value as PrivilegeLevel)
      }
      selectedValue={value}
    >
      {clientPrivilegeLevels.map((level) => (
        <Radio
          // @ts-ignore
          label={
            <>
              {privilegeLabel(level)}
              <div className={Classes.TEXT_MUTED} style={{ marginTop: "4px" }}>
                {privilegeDescription(level)}
              </div>
            </>
          }
          value={level}
        />
      ))}
    </RadioGroup>
  );
}
