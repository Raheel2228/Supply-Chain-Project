import React, { useState } from "react";
import {
  Breadcrumbs,
  IBreadcrumbProps,
  HTMLTable,
  Icon,
  Button,
  Callout,
} from "@blueprintjs/core";
import { Link, useHistory } from "react-router-dom";
import NewScriptDialog from "./NewScriptDialog";
import { useApi } from "../util/api";
import DelayedSpinner from "../common/DelayedSpinner";
import { Script } from "./ScriptSelector";
import { formatTimestamp } from "../util/date";
import { Helmet } from "react-helmet-async";
import { routerBreadcrumbRenderer } from "../nav/RouterBreadcrumb";

const BREADCRUMBS: IBreadcrumbProps[] = [
  { href: "/admin/scripts", text: "Scripts", current: true },
];

export default function AdminScripts() {
  const history = useHistory();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const showCreateScriptDialog = () => setDialogOpen(true);
  const hideCreateScriptDialog = () => setDialogOpen(false);

  const { error, data } = useApi("/scripts");

  let content;
  if (error) {
    content = <Callout intent="danger">{String(error)}</Callout>;
  } else if (!data) {
    content = <DelayedSpinner />;
  } else {
    content = (
      <HTMLTable
        interactive
        style={{ width: "100%" }}
        className="sticky-header"
      >
        <thead>
          <tr>
            <th>
              Script Name &nbsp; <Icon icon="sort-asc" />
            </th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {data.scripts.map((script: Script) => (
            <tr
              key={script.id}
              onClick={() => history.push(`/admin/scripts/${script.id}`)}
            >
              <td>
                <Link to={`/admin/scripts/${script.id}`}>{script.name}</Link>
              </td>
              <td>{formatTimestamp(script.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    );
  }

  return (
    <>
      <Helmet>
        <title>Scripts</title>
      </Helmet>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={BREADCRUMBS}
          breadcrumbRenderer={routerBreadcrumbRenderer}
        />
        <Button
          intent="primary"
          text="Create Script"
          icon="plus"
          onClick={showCreateScriptDialog}
        />
      </div>
      {content}
      <br />
      <NewScriptDialog isOpen={dialogOpen} onClose={hideCreateScriptDialog} />
    </>
  );
}
