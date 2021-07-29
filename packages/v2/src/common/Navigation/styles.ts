import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { palette } from "../../assets/theme/palette";

export const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: ${palette.dustyBlue};
  width: 235px;
  height: 100vh;
`;

export const MenuWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const LogoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  background: ${palette.blue};
  padding: 20px;
  margin-bottom: 30px;

  & > svg {
    width: 150px;
    height: 50px;
  }
`;

export const Menu = styled.div`
  display: flex;
  flex-direction: column;
`;

export const MenuItem = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  color: ${palette.white};
  align-items: center;
  padding: 3px;
  margin: 3px 0px;
  cursor: pointer;

  &.active {
    background: ${palette.blue};
  }

  &:hover {
    background: ${palette.blue};
  }
`;

export const MenuItemIcon = styled.div`
  margin-left: 15px;
  margin-top: 3px;

  & svg {
    height: 24px;
  }
`;

export const MenuItemLabel = styled.div`
  margin-left: 10px;
  font-size: 14px;
`;

export const Footer = styled.div`
  display: flex;
`;

export const Workspace = styled.p`
  color: ${palette.white};
  border-top: 1px solid ${palette.white50};
  flex-grow: 1;
  padding: 20px;
  margin: 0px;
  font-size: 20px;
  display: flex;
  justify-content: center;
`;

export const MyNavLink = styled(NavLink)`
  &.active .menuItem {
    background: ${palette.blue};
  }
`;
