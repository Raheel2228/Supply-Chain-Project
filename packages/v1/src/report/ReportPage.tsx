import React from "react";
import { PrivilegeLevel } from "../admin/ClientPrivilegeLevelSelector";
import ObserverReportViewer from "./ObserverReportViewer";
import ReportEditor from "./ReportEditor";
import { useUserState } from "../common/UserDataLoader";

/**
 * This component renders the report viewer that matches the user’s privilege level
 */
export default function ReportPage() {
  const { loading, clientPrivilegeLevel } = useUserState();

  if (loading) return null;

  const isObserver = clientPrivilegeLevel === PrivilegeLevel.CLIENT_OBSERVER;

  return isObserver ? <ObserverReportViewer /> : <ReportEditor />;
}
