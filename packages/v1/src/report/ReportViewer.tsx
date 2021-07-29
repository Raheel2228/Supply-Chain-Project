import React, { useState, useEffect, Fragment } from "react";
import {
  Button,
  Classes,
  Tooltip,
  Card,
  H3,
  Callout,
  ProgressBar,
  Icon,
  Tabs,
  Tab,
  Collapse,
} from "@blueprintjs/core";
import DatasetLabel from "../dataset/DatasetLabel";
import ModelInput from "../model/ModelInput";
import { useHistory } from "react-router";
import {
  ScriptSchema,
  Dataset,
  computeInputGroups,
  ScriptInputDataset,
  ScriptInput,
  InputGroup,
} from "../util/scriptSchema";
import { Report, ReportState, ReportBlob } from "./Reports";
import BlobViewer from "./BlobViewer";
import DatasetDownloadButton from "../dataset/DatasetDownloadButton";
import { formatTimestamp } from "../util/date";

// ReportTabs are constructed by iterating through a report’s blobs and datasets
type ReportTab = {
  blobs: ReportBlob[];
  datasets: Dataset[];
};

// Used if the report has blobs/datasets with no explicit tab name
const defaultTabName = "Report";

interface IReportViewerProps {
  /** Report to display. Must include .blobs, .outputDatasets, and .script */
  report: Report;
  /** Controls display of sidebar: always for owner, never for observer, conditional for public. Setting to public will change API endpoints. */
  viewMode: "owner" | "observer" | "public";
  /** Content to display in the top of the sidebar */
  sidebarExtras?: JSX.Element | string;
  /** If viewing as owner, used to restrict input dataset labels */
  datasetTypeRestrictions?: string[];
}

export default function ReportViewer({
  report,
  viewMode,
  sidebarExtras,
  datasetTypeRestrictions,
}: IReportViewerProps) {
  const history = useHistory();
  const [tabs, setTabs] = useState<Map<string, ReportTab>>(() => new Map());
  const [tabNames, setTabNames] = useState<string[]>([]);
  const [currentTabName, setCurrentTabName] = useState<string>("");

  const [inputGroups, setInputGroups] = useState<Map<string, InputGroup>>(
    () => new Map()
  );

  const [sidebarPref, setSidebarPref] = useState<boolean>(
    localStorage.getItem("showReportSidebar") !== "false"
  );
  useEffect(() => {
    localStorage.setItem("showReportSidebar", sidebarPref.toString());
  }, [sidebarPref]);
  const toggleSidebar = () => setSidebarPref(!sidebarPref);

  // Allow showing sidebar to owner, or to public if public inputs are enabled
  // TODO should observers see public inputs in observer mode?
  const canShowSidebar =
    viewMode === "owner" || (viewMode === "public" && report.publicInputs);

  const running =
    report.state === ReportState.WAITING ||
    report.state === ReportState.RUNNING;

  // When report arrives/udpates, figure out the tabs to show
  useEffect(() => {
    if (running || !report?.blobs) return;

    const tabs = new Map<string, ReportTab>();
    report.blobs.forEach((blob) => {
      const tabName = blob.reportTab || defaultTabName;
      if (tabs.has(tabName)) {
        tabs.get(tabName)?.blobs.push(blob);
      } else {
        tabs.set(tabName, { blobs: [blob], datasets: [] });
      }
    });
    report.outputDatasets?.forEach((dataset) => {
      const tabName = dataset.reportTab || defaultTabName;
      if (tabs.has(tabName)) {
        tabs.get(tabName)?.datasets.push(dataset);
      } else {
        tabs.set(tabName, { blobs: [], datasets: [dataset] });
      }
    });
    setTabs(tabs);

    // Use explicit tab order if provided by report
    // Add any missing tabs at the end (implicit tab order)
    setTabNames(Array.from(new Set([...(report.tabs || []), ...tabs.keys()])));
  }, [report, running]);

  useEffect(() => {
    // Default to first tab, if a tab is not selected
    // (This is a separate effect to prevent recomputing all tabs when current changes)
    if (running || currentTabName || tabNames.length === 0) return;
    setCurrentTabName(tabNames[0]);
  }, [currentTabName, running, tabNames]);

  const scriptSchema: ScriptSchema = report.script!.schema;

  useEffect(() => {
    const newGroups = computeInputGroups(scriptSchema);
    setInputGroups(newGroups);
  }, [scriptSchema]);

  if (report.state === ReportState.ERROR) {
    return (
      <Callout intent="danger">
        <p>
          There was an error running this report. Please check the model inputs
          and re-run the model.
        </p>
        <p className={Classes.TEXT_MUTED}>
          Report ID: {report.id}, Model ID: {report.modelId}
        </p>
        {viewMode === "owner" && report.modelId && (
          <Button
            intent="primary"
            onClick={() =>
              history.push(
                `/models/${report.modelId}?clientId=${report.clientId}`
              )
            }
          >
            View Model
          </Button>
        )}
      </Callout>
    );
  }

  const datasetRenderer = (inputDataset: ScriptInputDataset) => (
    <DatasetLabel
      key={inputDataset.id}
      {...inputDataset}
      dataset={report.inputDatasets[inputDataset.id]}
      enablePreview={viewMode === "owner"}
      restricted={datasetTypeRestrictions?.includes(inputDataset.type)}
    />
  );

  const inputRenderer = (input: ScriptInput) => (
    <ModelInput
      key={input.id}
      value={report.inputs[input.id]}
      {...input}
      disabled
      clientId={report.clientId}
    />
  );

  return (
    <>
      {sidebarPref && canShowSidebar && (
        <Card style={{ flex: "0 0 300px" }}>
          {sidebarExtras}
          <H3>Model Inputs</H3>
          {Array.from(inputGroups).map(([groupName, group]) => (
            <Fragment key={groupName}>
              {group.toggle && inputRenderer(group.toggle)}
              {/* Only show these if there is no toggle, or toggle is on */}
              <Collapse
                isOpen={!group.toggle || report.inputs[groupName] === true}
                keepChildrenMounted={false}
                component="section"
              >
                {group.toggle && <br />}
                {group.inputDatasets.map(datasetRenderer)}
                {group.inputs.map(inputRenderer)}
              </Collapse>
              <hr className="input-group-divider" />
            </Fragment>
          ))}
          <br />
          <p className={Classes.TEXT_MUTED}>
            {report.scheduled ? "Automatically generated at " : "Created at "}
            {formatTimestamp(report.startTime)}
          </p>
        </Card>
      )}

      {canShowSidebar && (
        <Tooltip
          content="Click to toggle sidebar"
          targetTagName="div"
          targetClassName="sidebar-toggle"
        >
          <div onClick={toggleSidebar}>
            <Icon icon={sidebarPref ? "chevron-left" : "chevron-right"} />
          </div>
        </Tooltip>
      )}

      {running && (
        <Card style={{ flexGrow: 1 }}>
          <div
            style={{
              margin: "16px auto",
              maxWidth: "200px",
              textAlign: "center",
            }}
          >
            <H3>Report running...</H3>
            <br />
            <ProgressBar intent="primary" animate stripes />
          </div>
        </Card>
      )}

      {!running && (
        <Card style={{ flexGrow: 1, paddingTop: 0 }}>
          <div className={Classes.RUNNING_TEXT}>
            <div className="report-tab-list">
              <Tabs
                onChange={(newTab) => setCurrentTabName(newTab.toString())}
                selectedTabId={currentTabName}
              >
                {tabNames.map((tabName) => (
                  <Tab key={tabName} id={tabName} title={tabName} />
                ))}
              </Tabs>
              <hr />
            </div>
            {tabs.get(currentTabName)?.blobs.map((blob) => (
              <BlobViewer
                key={blob.id}
                publicMode={viewMode === "public"}
                blob={blob}
              />
            ))}
            <h4>Datasets</h4>
            {tabs.get(currentTabName)?.datasets.map((dataset) => (
              <DatasetDownloadButton key={dataset.id} dataset={dataset} />
            ))}
            <br />
          </div>
        </Card>
      )}
    </>
  );
}
