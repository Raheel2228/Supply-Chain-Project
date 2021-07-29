import React from "react";
import { Classes, Icon, IconName } from "@blueprintjs/core";
import { NavLink } from "react-router-dom";

interface INavTabProps {
  to: string;
  icon: IconName;
  label: string;
  title?: string;
}

export default function NavTab({ to, icon, label, title }: INavTabProps) {
  return (
    <NavLink
      activeClassName={Classes.ACTIVE}
      className={Classes.TAB}
      to={to}
      title={title || label}
    >
      <Icon icon={icon} />
      <span className="main-nav-label">{label}</span>
    </NavLink>
  );
}
