import React from "react";
import { PrivilegeLevel } from "../admin/ClientPrivilegeLevelSelector";
import ObserverReports from "./ObserverReports";
import Reports from "./Reports";
import { useUserState } from "../common/UserDataLoader";

/**
 * This component renders the reports list that matches the user’s privilege level
 */
export default function ReportsPage() {
  const { loading, clientPrivilegeLevel } = useUserState();

  if (loading) return null;

  const isObserver = clientPrivilegeLevel === PrivilegeLevel.CLIENT_OBSERVER;

  return isObserver ? <ObserverReports /> : <Reports />;
}
