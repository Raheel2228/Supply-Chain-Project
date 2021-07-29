import React, { useState, useCallback } from "react";
import {
  Breadcrumbs,
  IBreadcrumbProps,
  HTMLTable,
  Icon,
  Button,
  Tooltip,
  Callout,
  NonIdealState,
  Spinner,
} from "@blueprintjs/core";
import { Link, useHistory } from "react-router-dom";
import NewModelDialog from "./NewModelDialog";
import Paginate from "../nav/Paginate";
import { useApi } from "../util/api";
import DelayedSpinner from "../common/DelayedSpinner";
import { Script } from "../admin/ScriptSelector";
import { formatTimestamp } from "../util/date";
import useQueryParams from "../util/useQueryParams";
import { ModelInputValue } from "./ModelInput";
import { Dataset } from "../util/scriptSchema";
import { useUserState } from "../common/UserDataLoader";
import { Helmet } from "react-helmet-async";
import DebouncedInputGroup from "../common/DebouncedInputGroup";
import { routerBreadcrumbRenderer } from "../nav/RouterBreadcrumb";
import { clientPath } from "../util/route";
import { UserId } from "../admin/AdminUsers";
import useMemoryState from "../util/useMemoryState";

export interface ModelInputValues {
  [key: string]: ModelInputValue;
}

export interface ModelInputDatasets {
  [key: string]: Dataset;
}

export type ModelSchedule = {
  // Very limited cron syntax supported. Minute/hour is in user timezone
  cronString: string;
  // Specifies the difference in minutes from UTC
  timezoneOffset: number;
  tags: string[];
  // User IDs to share report with and email link to
  recipients: UserId[];
  markSaved: boolean;
  onlyKeepLatest: boolean;
  // UTC date string, to track when the schedule was updated
  updatedAt: string;
};

export type Model = {
  id: string;
  clientId: string;
  scriptId: string;
  schedule?: ModelSchedule | null;
  name: string;
  inputs?: ModelInputValues;
  inputDatasets?: ModelInputDatasets;
  lastRun?: Date;
  script?: Script;
};

export default function Models() {
  const history = useHistory();
  const { clientId } = useQueryParams();
  const { adminMode } = useUserState();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const showCreateModelDialog = () => setDialogOpen(true);
  const hideCreateModelDialog = () => setDialogOpen(false);

  const [filterText, setFilterText] = useMemoryState<string>(
    "modelsFilterText",
    ""
  );
  const [page, setPage] = useMemoryState<number>("modelsPage", 1);
  const pageSize = 100;

  const filterParams = new URLSearchParams({
    clientId: clientId!,
    ...(filterText && { filterText }),
    ...(adminMode && { showAll: "true" }),
    page: page.toString(),
    pageSize: pageSize.toString(),
  }).toString();

  const BREADCRUMBS: IBreadcrumbProps[] = [
    { href: clientPath(clientId!, "models"), text: "Models", current: true },
  ];

  const { loading, error, data } = useApi(`/models?${filterParams}`);

  const handleFilterTextChange = useCallback(
    (newValue) => {
      setFilterText(newValue);
      setPage(1);
    },
    [setFilterText, setPage]
  );

  const modelLink = (model: Model) =>
    `/models/${model.id}?clientId=${clientId}`;

  const createModelButton = (
    <Button
      intent="primary"
      text="Create Model"
      icon="cube-add"
      onClick={showCreateModelDialog}
    />
  );

  const empty =
    data?.models?.length === 0 && page === 1 && filterText === "" && !loading;

  let content;

  if (error) {
    content = <Callout intent="danger">{String(error)}</Callout>;
  } else if (!data) {
    content = <DelayedSpinner />;
  } else if (empty) {
    content = (
      <NonIdealState
        title="No Models"
        description="Create your first model to run reports and gain insights."
        icon="cube"
        action={createModelButton}
      />
    );
  } else {
    content = (
      <>
        <HTMLTable
          striped
          interactive
          style={{ width: "100%" }}
          className="sticky-header"
        >
          <thead>
            <tr>
              <th style={{ width: "32px" }}></th>
              <th>Name</th>
              <th>Template</th>
              <th>
                Last Run &nbsp; <Icon icon="sort-desc" />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.models.map((model: Model) => (
              <tr key={model.id} onClick={() => history.push(modelLink(model))}>
                <td>
                  {model.schedule && (
                    <Tooltip content="Scheduled to run automatically">
                      <Icon icon="time" />
                    </Tooltip>
                  )}
                </td>
                <td>
                  <Link to={modelLink(model)}>{model.name}</Link>
                </td>
                <td>{model.script?.name}</td>
                <td>
                  {model.lastRun ? formatTimestamp(model.lastRun) : "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
        <Paginate
          page={page}
          onChange={setPage}
          allowNext={data.models.length === pageSize}
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Models</title>
      </Helmet>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={BREADCRUMBS}
          breadcrumbRenderer={routerBreadcrumbRenderer}
        />
        {createModelButton}
      </div>
      {/* There is another empty check here so that the input doesn’t get unmounted and lose focus while searching, but still doesn’t show if truly empty. */}
      {!empty && (
        <div className="filter-row">
          <DebouncedInputGroup
            leftIcon="search"
            type="text"
            placeholder={`Search by name or template…`}
            value={filterText}
            onValueChange={handleFilterTextChange}
          />
          {loading && <Spinner size={Spinner.SIZE_SMALL} />}
        </div>
      )}
      {content}
      {dialogOpen && <NewModelDialog isOpen onClose={hideCreateModelDialog} />}
    </>
  );
}
