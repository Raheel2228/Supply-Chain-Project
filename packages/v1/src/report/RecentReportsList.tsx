import React from "react";
import { Callout, NonIdealState, Classes } from "@blueprintjs/core";
import { Link } from "react-router-dom";
import { useApi } from "../util/api";
import DelayedSpinner from "../common/DelayedSpinner";
import { useUserState } from "../common/UserDataLoader";
import { Report, ReportStatusIcon } from "./Reports";

interface IRecentReportsListProps {
  clientId: string;
  modelId?: string;
  count?: number;
}

export default function RecentReportsList({
  clientId,
  modelId,
  count = 10,
}: IRecentReportsListProps) {
  const { adminMode } = useUserState();

  const filterParams = new URLSearchParams({
    clientId,
    ...(modelId && { modelId }),
    ...(adminMode && { showAll: "true" }),
    page: "1",
    pageSize: count.toString(),
  }).toString();

  const { error, data } = useApi(`/reports?${filterParams}`);

  let content;
  if (error) {
    content = <Callout intent="danger">{String(error)}</Callout>;
  } else if (!data) {
    content = <DelayedSpinner />;
  } else if (data.reports?.length === 0) {
    content = (
      <NonIdealState
        title="No Reports"
        description="Run this model to get started."
        icon="document"
      />
    );
  } else {
    content = (
      <ul className={Classes.MENU}>
        {data.reports.map((report: Report) => (
          <li key={report.id}>
            <Link
              to={`/reports/${report.id}?clientId=${clientId}`}
              className={Classes.MENU_ITEM}
            >
              <ReportStatusIcon report={report} showTooltip={false} />
              <div
                className={Classes.TEXT_OVERFLOW_ELLIPSIS + " " + Classes.FILL}
              >
                {report.name}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div style={{ minWidth: "200px", maxWidth: "300px", minHeight: "60px" }}>
      {content}
    </div>
  );
}
