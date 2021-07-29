import React from "react";
import { Breadcrumbs, IBreadcrumbProps, Callout } from "@blueprintjs/core";
import { useParams } from "react-router";
import DelayedSpinner from "../common/DelayedSpinner";
import { useApi } from "../util/api";
import useQueryParams from "../util/useQueryParams";
import { Report } from "./Reports";
import ScrollToTopOnMount from "../common/ScrollToTopOnMount";
import ReportViewer from "./ReportViewer";
import { Helmet } from "react-helmet-async";
import { routerBreadcrumbRenderer } from "../nav/RouterBreadcrumb";
import { clientPath } from "../util/route";

interface ReportParams {
  reportId: string;
}

export default function ObserverReportViewer() {
  const { reportId } = useParams<ReportParams>();
  const { clientId } = useQueryParams();

  const { error, data } = useApi(`/reports/${reportId}`);

  const report: Report = data?.report;

  if (error) {
    return (
      <Callout intent="danger">
        Error loading this report: {String(error)}
      </Callout>
    );
  } else if (!report) {
    return <DelayedSpinner />;
  }

  const BREADCRUMBS: IBreadcrumbProps[] = [
    { href: clientPath(clientId!, "reports"), text: "Reports" },
    {
      text: report.name,
      current: true,
    },
  ];

  return (
    <>
      <Helmet>
        <title>{report.name}</title>
      </Helmet>
      <ScrollToTopOnMount />
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={BREADCRUMBS}
          breadcrumbRenderer={routerBreadcrumbRenderer}
        />
      </div>

      <div style={{ display: "flex", marginTop: "16px" }}>
        <ReportViewer report={report} viewMode="observer" />
      </div>
    </>
  );
}
