import React, { useState, ChangeEvent } from "react";
import {
  Button,
  Classes,
  Dialog,
  Callout,
  UL,
  Checkbox,
  Spinner,
  Switch,
} from "@blueprintjs/core";
import { useAuthFetch, useApi } from "../util/api";
import { PrivilegeLevel } from "../admin/ClientPrivilegeLevelSelector";
import { ClientPrivilege } from "../admin/AdminClient";
import { Report } from "./Reports";
import { useUserState } from "../common/UserDataLoader";
import { useHistory } from "react-router";
import { ModelPrivilege } from "../model/ModelPrivilegesDialog";
import CopyableTextInput from "../common/CopyableTextInput";
import { showConfirm } from "../common/ImperativeDialog";
import { clientPath } from "../util/route";
import { UserLabel } from "../user/UserSelector";

export type ReportPrivilege = {
  reportId: string;
  userId: string;
  privilegeLevel: PrivilegeLevel;
};

interface IReportPrivilegesDialogProps {
  isOpen: boolean;
  onSave?: () => void;
  onClose?: (event?: React.SyntheticEvent<HTMLElement>) => void;
  clientId: string;
  report: Report;
  // Indiciates if ReportViewer is still loading report data
  parentLoading?: boolean;
}

export default function ReportPrivilegesDialog({
  isOpen,
  onClose,
  onSave,
  clientId,
  report,
  parentLoading = false,
}: IReportPrivilegesDialogProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const history = useHistory();
  const { user } = useUserState();
  const authFetch = useAuthFetch();

  // The users in this client
  const clientPrivilegesQuery = useApi(`/clientPrivileges/${clientId}`);

  // The users that have access to this report
  const reportPrivilegesQuery = useApi(`/reportPrivileges/${report.id}`);

  // The users that have access to the parent model
  const modelPrivilegesQuery = useApi(`/modelPrivileges/${report.modelId}`);

  const clientPrivileges: ClientPrivilege[] =
    clientPrivilegesQuery.data?.clientPrivileges;

  const reportPrivileges: ReportPrivilege[] =
    reportPrivilegesQuery.data?.reportPrivileges;

  const modelPrivileges: ModelPrivilege[] =
    modelPrivilegesQuery.data?.modelPrivileges;

  const handleReportPrivilegeChange = async (
    userId: string,
    privileged: boolean
  ) => {
    setLoading(true);
    setError("");
    try {
      if (!clientId || !userId) {
        throw new Error("Missing client ID or user ID");
      }
      if (userId === user?.id && privileged === false) {
        if (!(await showConfirm("Remove yourself from this report?"))) return;
      }
      // Create or delete privilege
      const method = privileged ? "POST" : "DELETE";
      await authFetch(`/reportPrivileges/${report.id}/${userId}`, {
        method,
      });
      // If user removed own access, return to reports list.
      if (userId === user?.id && privileged === false) {
        history.replace(clientPath(clientId, "reports"));
      }

      onSave && onSave();
      reportPrivilegesQuery.fire();
    } catch (error) {
      setError(String(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePublicChange = async (
    newPublic: boolean,
    newPublicInputs: boolean
  ) => {
    setLoading(true);
    setError("");
    try {
      await authFetch(`/reports/${report.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          public: newPublic,
          publicInputs: newPublicInputs,
        }),
      });
      // This relies on parent to re-fetch data and pass new status back in to dialog
      onSave && onSave();
    } catch (error) {
      setError(String(error));
    } finally {
      setLoading(false);
    }
  };

  const anyError =
    error || clientPrivilegesQuery.error || reportPrivilegesQuery.error;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Invite Collaborators to “${report.name}”`}
    >
      <Callout icon="info-sign">
        Collaborators can view, rename, and manage other collaborators. <br />
        Collaborators on the model that created this report always have access.
      </Callout>
      {anyError && <Callout intent="danger">{anyError}</Callout>}
      <div className={Classes.DIALOG_BODY}>
        <p>Allow access to these workspace users:</p>
        {(!reportPrivileges || !clientPrivileges || !modelPrivileges) && (
          <Spinner />
        )}
        {reportPrivileges && clientPrivileges && modelPrivileges && (
          <UL style={{ listStyle: "none" }}>
            {clientPrivileges.map((clientPrivilege) => {
              const modelPrivileged =
                modelPrivileges.filter(
                  (privilege) => privilege.userId === clientPrivilege.userId
                ).length > 0;
              const privileged =
                reportPrivileges.filter(
                  (privilege) => privilege.userId === clientPrivilege.userId
                ).length > 0;
              return (
                <li key={clientPrivilege.userId}>
                  <Checkbox
                    disabled={
                      modelPrivileged ||
                      loading ||
                      reportPrivilegesQuery.loading
                    }
                    checked={modelPrivileged || privileged}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleReportPrivilegeChange(
                        clientPrivilege.userId,
                        e.target.checked
                      )
                    }
                    labelElement={<UserLabel user={clientPrivilege.user!} />}
                  />
                </li>
              );
            })}
          </UL>
        )}
        <br />
        {/* Since this relies on report data changing, disable if parent is loading */}
        <Switch
          label="Enable link sharing"
          disabled={loading || parentLoading}
          checked={report.public}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handlePublicChange(e.target.checked, report.publicInputs);
          }}
        />
        <div style={{ paddingLeft: "32px" }}>
          {report.public && (
            <Checkbox
              label="Show sidebar with input values and input dataset names"
              disabled={loading || parentLoading}
              checked={report.publicInputs}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handlePublicChange(report.public, e.target.checked);
              }}
            />
          )}
          {report.public && (
            <CopyableTextInput
              label="Anyone with this link can view this report"
              value={`${window.location.origin}/viewReport/${report.id}`}
              readOnly
              fill
            />
          )}
        </div>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button
            type="button"
            onClick={onClose}
            loading={loading || parentLoading}
          >
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
