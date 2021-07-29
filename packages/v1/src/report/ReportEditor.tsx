import React, { useState, useEffect } from "react";
import {
  Breadcrumbs,
  IBreadcrumbProps,
  Button,
  Tooltip,
  H3,
  Popover,
  Callout,
  Menu,
  MenuItem,
  Icon,
} from "@blueprintjs/core";
import { useHistory, useParams } from "react-router";
import DelayedSpinner from "../common/DelayedSpinner";
import { useAuthFetch, useApi } from "../util/api";
import { AppToaster } from "../common/toaster";
import useQueryParams from "../util/useQueryParams";
import { Report, ReportState } from "./Reports";
import ReportDetailsPopover from "./ReportDetailsPopover";
import ScrollToTopOnMount from "../common/ScrollToTopOnMount";
import ReportPrivilegesDialog from "./ReportPrivilegesDialog";
import ReportViewer from "./ReportViewer";
import { Helmet } from "react-helmet-async";
import RouterBreadcrumb, {
  routerBreadcrumbRenderer,
} from "../nav/RouterBreadcrumb";
import { showConfirm } from "../common/ImperativeDialog";
import RerunModelButton from "../model/RerunModelButton";
import TagList from "../common/TagList";
import StateSelector from "../common/StateSelector";
import { clientPath } from "../util/route";

type ReportUpdateInput = {
  name?: string | null;
  description?: string | null;
  public?: boolean | null;
  state?: ReportState | null;
};

interface ReportParams {
  reportId: string;
}

const reportCompleteAudio = new Audio("/reportComplete.mp3");

export default function ReportEditor() {
  const history = useHistory();
  const authFetch = useAuthFetch();
  const { reportId } = useParams<ReportParams>();
  const { clientId } = useQueryParams();

  const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false);

  const [updating, setUpdating] = useState<boolean>(false);
  // Only play sound and show success favicon on first report run, not when viewing later
  const [playSoundEffect, setPlaySoundEffect] = useState<
    "no" | "pending" | "played"
  >("no");

  const { loading, error, data, fire } = useApi(`/reports/${reportId}`);
  const datasetTypeRestrictionsQuery = useApi(
    `/datasetTypeRestrictions/client/${clientId}/currentUser`
  );

  const report: Report = data?.report;
  const reportState = report?.state;
  const running =
    reportState === ReportState.WAITING || reportState === ReportState.RUNNING;
  // Unsaved, saved, or archived
  const editable = !(running || reportState === ReportState.ERROR);

  const showShareDialog = () => setShareDialogOpen(true);
  const hideShareDialog = () => setShareDialogOpen(false);

  // While running, poll server to check for changes
  useEffect(() => {
    let worker: Worker;
    // Fire interval in a Web Worker to avoid throttling when tab is inactive
    if (running && !error) {
      const code = `setInterval(() => { postMessage(''); }, 2000);`;
      const codeBlob = new Blob([code], { type: "application/javascript" });
      worker = new Worker(URL.createObjectURL(codeBlob));
      worker.onmessage = () => fire();
    }
    return () => worker?.terminate();
  }, [error, running, fire]);

  // Update favicon to reflect report status
  useEffect(() => {
    const icon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!icon) return;
    if (running) {
      icon.href = "/favicon-progress.png";
      // Set flag to play sound effect when finished
      setPlaySoundEffect("pending");
    } else if (reportState === ReportState.ERROR) {
      icon.href = "/favicon-error.png";
    } else if (playSoundEffect !== "no") {
      icon.href = "/favicon-success.png";
      // Catch promise if playback fails (Safari)
      reportCompleteAudio.play()?.catch((e) => {});
      setPlaySoundEffect("played");
    } else {
      icon.href = "/favicon-32x32.png";
    }
    return () => {
      icon.href = "/favicon-32x32.png";
    };
  }, [reportState, running, playSoundEffect]);

  if (error) {
    return (
      <Callout intent="danger">
        Error loading this report: {String(error)}
      </Callout>
    );
  } else if (!report || !datasetTypeRestrictionsQuery.data) {
    return <DelayedSpinner />;
  }

  const handleUpdate = async (
    reportUpdateInput: ReportUpdateInput,
    tags?: string[]
  ) => {
    setUpdating(true);
    try {
      await authFetch(`/reports/${reportId}`, {
        method: "PATCH",
        body: JSON.stringify(reportUpdateInput),
      });
      if (tags) {
        await authFetch(`/reports/${reportId}/tags`, {
          method: "PUT",
          body: JSON.stringify(tags),
        });
      }
      fire();
    } catch (error) {
      AppToaster.show({
        message: "Error updating report",
        intent: "danger",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = async () => {
    const confirmation = await showConfirm(
      "Permanently delete this report? This action cannot be undone.",
      "Delete",
      "Cancel",
      true
    );
    if (confirmation) {
      setUpdating(true);
      try {
        await authFetch(`/reports/${reportId}`, {
          method: "DELETE",
        });
        AppToaster.show({
          message: "Report deleted",
          intent: "primary",
          icon: "trash",
        });
        history.replace(clientPath(clientId!, "reports"));
      } catch (error) {
        AppToaster.show({
          message: "Error deleting report",
          intent: "danger",
        });
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleScheduleClick = () =>
    history.push(
      `/models/${report.modelId}?clientId=${clientId}&showSchedule=true`
    );

  const BREADCRUMBS: IBreadcrumbProps[] = [
    { href: clientPath(clientId!, "reports"), text: "Reports" },
    {
      href: `/models/${report.modelId}?clientId=${clientId}`,
      text: (
        <>
          <Icon icon="cube" />
          {report.model?.name}
        </>
      ),
    },
    {
      text: report.name,
      current: true,
    },
  ];

  const currentBreadcrumbRenderer = (props: IBreadcrumbProps) => (
    <>
      <RouterBreadcrumb current {...props} />
      <div style={{ marginLeft: "13px" }}>
        <TagList tags={report.tags?.map(({ tag }) => tag) || []} />
      </div>
      {editable && (
        <ReportDetailsPopover
          report={report}
          onSave={handleUpdate}
          target={
            <Tooltip content="Edit Report Info">
              <Button icon="edit" disabled={updating} loading={updating} />
            </Tooltip>
          }
        />
      )}
    </>
  );

  const datasetTypeRestrictions: string[] =
    datasetTypeRestrictionsQuery.data.datasetTypeRestrictions;

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
          currentBreadcrumbRenderer={currentBreadcrumbRenderer}
        />
        {editable && (
          <Button text="Share" icon="new-person" onClick={showShareDialog} />
        )}
        {editable && (
          <StateSelector
            value={reportState}
            onChange={(state) => handleUpdate({ state })}
            disabled={updating}
          />
        )}
        <RerunModelButton report={report} />
        <Popover
          position="bottom"
          content={
            <Menu>
              <MenuItem
                text="Schedule Automatic Reports"
                icon="time"
                onClick={handleScheduleClick}
              />
              <MenuItem
                intent="danger"
                text="Delete Report"
                icon="trash"
                onClick={handleDeleteClick}
              />
            </Menu>
          }
        >
          <Button icon="more" title="More report options" />
        </Popover>
      </div>

      <div style={{ display: "flex", marginTop: "16px" }}>
        <ReportViewer
          report={report}
          viewMode="owner"
          datasetTypeRestrictions={datasetTypeRestrictions}
          sidebarExtras={
            <>
              {editable && report.description && (
                <>
                  <H3>Report Description</H3>
                  <p>{report.description}</p>
                  <br />
                </>
              )}
            </>
          }
        />
      </div>
      {shareDialogOpen && clientId && (
        <ReportPrivilegesDialog
          isOpen
          onClose={hideShareDialog}
          clientId={clientId}
          report={report}
          onSave={fire}
          parentLoading={loading}
        />
      )}
    </>
  );
}
