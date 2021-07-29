import React, { useState, useCallback } from "react";
import {
  Breadcrumbs,
  IBreadcrumbProps,
  HTMLTable,
  Icon,
  Callout,
  NonIdealState,
  Spinner,
} from "@blueprintjs/core";
import { Link, useHistory } from "react-router-dom";
import { useApi } from "../util/api";
import DelayedSpinner from "../common/DelayedSpinner";
import { formatTimestamp } from "../util/date";
import useQueryParams from "../util/useQueryParams";
import { Helmet } from "react-helmet-async";
import Paginate from "../nav/Paginate";
import DebouncedInputGroup from "../common/DebouncedInputGroup";
import { routerBreadcrumbRenderer } from "../nav/RouterBreadcrumb";
import { StateFilterValue } from "../common/StateFilter";
import { Report, ReportStatusIcon } from "./Reports";

const pageSize = 100;

export default function ObserverReports() {
  const history = useHistory();
  const { clientId } = useQueryParams();

  const [filterText, setFilterText] = useState<string>("");
  const [page, setPage] = useState(1);

  const filterParams = new URLSearchParams({
    clientId: clientId!,
    ...(filterText && { filterText }),
    state: StateFilterValue.ALL,
    page: page.toString(),
    pageSize: pageSize.toString(),
  }).toString();

  const BREADCRUMBS: IBreadcrumbProps[] = [{ text: "Reports", current: true }];

  const { loading, error, data } = useApi(`/reports?${filterParams}`);

  const handleFilterTextChange = useCallback((newValue) => {
    setFilterText(newValue);
    setPage(1);
  }, []);

  const empty =
    data?.reports?.length === 0 && page === 1 && filterText === "" && !loading;

  let content;
  if (error) {
    content = <Callout intent="danger">{String(error)}</Callout>;
  } else if (!data) {
    content = <DelayedSpinner />;
  } else if (empty) {
    content = <NonIdealState title="No Reports" icon="document" />;
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
              <th style={{ width: "40px" }}></th>
              <th>Name</th>
              <th>
                Created At &nbsp; <Icon icon="sort-desc" />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.reports.map((report: Report) => (
              <tr
                key={report.id}
                onClick={() =>
                  history.push(`/reports/${report.id}?clientId=${clientId}`)
                }
              >
                <td>
                  <ReportStatusIcon report={report} />
                </td>
                <td>
                  <Link to={`/reports/${report.id}?clientId=${clientId}`}>
                    {report.name}
                  </Link>
                </td>
                <td>{formatTimestamp(report.startTime)}</td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
        {data.reports.length === 0 && (
          <NonIdealState
            title="No Results"
            description={`Try adjusting your search filter.`}
            icon="document"
          />
        )}
        <Paginate
          page={page}
          onChange={setPage}
          allowNext={data.reports.length === pageSize}
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Reports</title>
      </Helmet>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={BREADCRUMBS}
          breadcrumbRenderer={routerBreadcrumbRenderer}
        />
        <div className="filter-row">
          {loading && <Spinner size={Spinner.SIZE_SMALL} />}
          <DebouncedInputGroup
            leftIcon="search"
            type="text"
            placeholder={`Search by name…`}
            value={filterText}
            onValueChange={handleFilterTextChange}
          />
        </div>
      </div>
      {content}
    </>
  );
}
