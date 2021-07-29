import React from "react";
import { Card, Classes, Tooltip, Icon } from "@blueprintjs/core";
import { Link, useHistory } from "react-router-dom";
import { Client } from "../admin/AdminClients";
import { clientPath } from "../util/route";
import { PrivilegeLevel } from "../admin/ClientPrivilegeLevelSelector";

interface IClientCardProps {
  client: Client;
  privilegeLevel: PrivilegeLevel;
  globalAdmin?: boolean;
}

const ClientCard = ({
  client,
  privilegeLevel,
  globalAdmin = false,
}: IClientCardProps) => {
  const history = useHistory();
  const route: string = globalAdmin
    ? `/admin/clients/${client.id}`
    : clientPath(client.id, "home", privilegeLevel);
  const handleClick = (
    e: React.MouseEvent<HTMLDivElement | HTMLAnchorElement>
  ) => {
    // Allow ctrl/cmd-click to open in new tab
    if (!(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      history.push(route);
    }
  };

  return (
    <Card
      className="client-card"
      interactive
      key={client.id}
      onClick={handleClick}
    >
      <Link
        className={Classes.HEADING + " " + Classes.TEXT_LARGE}
        to={route}
        onClick={handleClick}
      >
        <span />
        {client.logoUrl && <img src={client.logoUrl} alt="" />}
        <span>
          {client.frozen && (
            <Tooltip content="Not allowed to run models">
              <Icon
                icon="disable"
                intent="danger"
                style={{ margin: "-4px 16px 0 0" }}
              />
            </Tooltip>
          )}
          {client.name}
        </span>
      </Link>
    </Card>
  );
};

export default ClientCard;
