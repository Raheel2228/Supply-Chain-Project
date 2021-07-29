import React from "react";
import { Callout, H1, Classes, H5 } from "@blueprintjs/core";
import { useParams } from "react-router";
import DelayedSpinner from "../common/DelayedSpinner";
import { useApi } from "../util/api";
import { Report } from "./Reports";
import ReportViewer from "./ReportViewer";
import ThemeSwitcher from "../common/Theme";
import config from "../config";
import { formatTimestamp } from "../util/date";
import { Helmet } from "react-helmet-async";

interface ReportParams {
  reportId: string;
}

export default function PublicReportPage() {
  const { reportId } = useParams<ReportParams>();
  const { error, data } = useApi(`/reports/public/${reportId}`, {});
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

  return (
    <div className="public-report-wrapper">
      <Helmet>
        <title>{report.name}</title>
      </Helmet>
      <header className="public-report-header">
        <div>
          <H1>{report.name}</H1>
          <ThemeSwitcher />
        </div>
        <H5 className={Classes.TEXT_MUTED}>
          {formatTimestamp(report.startTime)}
        </H5>
      </header>

      <section style={{ display: "flex", marginTop: "16px" }}>
        <ReportViewer report={report} viewMode="public" />
      </section>
      <footer className="public-report-footer">
        <span>Powered by {config.appName}</span>
        <a href={config.contactUrl}>Contact</a>
        <a href={config.privacyUrl}>Privacy</a>
        <a href="/legal">Legal</a>
      </footer>
    </div>
  );
}
