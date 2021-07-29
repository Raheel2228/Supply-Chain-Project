import SvgIcon from "@material-ui/core/SvgIcon";
import React, { FC } from "react";

import { ReactComponent as Logo } from "./../../assets/img/logo.svg";
import { links } from "./links";
import {
  Footer,
  LogoWrapper,
  Menu,
  MenuItem,
  MenuItemIcon,
  MenuItemLabel,
  MenuWrapper,
  MyNavLink,
  Sidebar,
  Workspace,
} from "./styles";

const Navigation: FC = () => {
  // TODO remove /v2 prefix after deployed at root of the domain
  const menuItems = links.map(({ slug, label, icon }) => (
    <MyNavLink to={`/v2${slug}`} exact={true}>
      <MenuItem className={"menuItem"}>
        <MenuItemIcon>
          <SvgIcon component={icon} />
        </MenuItemIcon>
        <MenuItemLabel>{label}</MenuItemLabel>
      </MenuItem>
    </MyNavLink>
  ));

  return (
    <Sidebar>
      <MenuWrapper>
        <LogoWrapper>
          <Logo />
        </LogoWrapper>
        <Menu>{menuItems}</Menu>
      </MenuWrapper>
      <Footer>
        <Workspace>{"Bala"}</Workspace>
      </Footer>
    </Sidebar>
  );
};

export default Navigation;
