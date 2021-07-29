import React, { FC, useState, useEffect, useContext } from "react";
import {
  HeaderWrapper,
  TimeLineItem,
  Timeline,
  TimeLineArrow,
  SOPSelection,
  Label,
  UserControl,
} from "./styles";
import DoubleArrowIcon from "@material-ui/icons/DoubleArrow";
import { Select } from "antd";
import { PortfolioContext } from "../../contexts/PortfolioContext";

import { getClientId, searchSOP } from "../../helpers/util";
import { getSOPVersions, createVersion } from "../../helpers/SOP.services";
import { Menu, Dropdown } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  PlusCircleFilled,
} from "@ant-design/icons";

const Header: FC = (props) => {
  const [state, setState] = useState({
    financialPlan: true,
    supplyPlan: true,
    demandPlan: true,
    executiveSignoff: true,
  });
  const {
    sopVersions,
    setSopVersions,
    currentSopVersions,
    setCurrentSopVersions,
  } = useContext(PortfolioContext);
  useEffect(() => {
    if (!sopVersions) {
      getSOPVersions(getClientId()).then((res) => {
        setSopVersions(res.data.sopVersions);
        setCurrentSopVersions(
          Number(localStorage.getItem("SOPID"))
            ? Number(localStorage.getItem("SOPID"))
            : res.data.sopVersions[0].id
        );
        // localStorage.setItem("SOPID", res.data.sopVersions[0].id);
      });
    }
  }, []);

  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<BellOutlined />}>
        Notifications
      </Menu.Item>
      <Menu.Item key="3" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Item
        key="2"
        onClick={() => {
          //  @ts-ignore
          props.logout();
        }}
        icon={<LogoutOutlined />}
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  const { Option } = Select;

  return (
    <HeaderWrapper>
      {currentSopVersions && (
        <Timeline>
          <SOPSelection>
            <Label>SOP</Label>

            <Select
              onChange={(value) => {
                setCurrentSopVersions(value);
                localStorage.setItem("SOPID", value);
                window.location.reload();
              }}
              value={currentSopVersions}
              defaultValue={currentSopVersions}
              style={{ width: 100 }}
            >
              {
                sopVersions &&
                  sopVersions.map((item: any) => (
                    <Option value={item.id}>{item.versionName}</Option>
                  ))

                // <Option value="mrf-2">MRF-2</Option>
                // <Option value="mrf-3">MRF-3</Option>
                // <Option value="mrf-4">MRF-4</Option>
              }
              <Option value={0} style={{ cursor: "pointer" }} disabled={true}>
                {" "}
                <span
                  onClick={() => {
                    setSopVersions(false);
                    createVersion({}).then((res) => {
                      setSopVersions(res.data.sopVersions);
                      setCurrentSopVersions(
                        res.data.sopVersions[res.data.sopVersions.length - 1].id
                      );
                      localStorage.setItem(
                        "SOPID",
                        res.data.sopVersions[res.data.sopVersions.length - 1].id
                      );
                      window.location.reload();
                    });
                  }}
                >
                  Add <PlusCircleFilled />
                </span>
              </Option>
            </Select>
          </SOPSelection>
          <TimeLineItem
            locked={searchSOP(currentSopVersions, sopVersions)?.financialVersion}
          >
            <p>Financial Plan</p>
          </TimeLineItem>
          <TimeLineArrow
            locked={searchSOP(currentSopVersions, sopVersions)?.financialVersion}
          >
            <DoubleArrowIcon />
          </TimeLineArrow>
          <TimeLineItem
            locked={searchSOP(currentSopVersions, sopVersions)?.demandVersion}
          >
            <p>Demand Plan</p>
          </TimeLineItem>
          <TimeLineArrow
            locked={searchSOP(currentSopVersions, sopVersions)?.demandVersion}
          >
            <DoubleArrowIcon />
          </TimeLineArrow>
          <TimeLineItem
            locked={searchSOP(currentSopVersions, sopVersions)?.supplyVersion}
          >
            <p>Supply Plan</p>
          </TimeLineItem>

          <TimeLineArrow
            locked={searchSOP(currentSopVersions, sopVersions)?.supplyVersion}
          >
            <DoubleArrowIcon />
          </TimeLineArrow>
          <TimeLineItem
            locked={
              searchSOP(currentSopVersions, sopVersions)?.supplyVersion &&
              searchSOP(currentSopVersions, sopVersions)?.demandVersion &&
              searchSOP(currentSopVersions, sopVersions)?.financialVersion
            }
          >
            <p>Executive Signoff</p>
          </TimeLineItem>
        </Timeline>
      )}
      <UserControl>
        <Dropdown.Button
          overlay={menu}
          placement="bottomCenter"
          icon={<UserOutlined />}
        >
          user@izba.co
        </Dropdown.Button>
      </UserControl>
    </HeaderWrapper>
  );
};

export default Header;
