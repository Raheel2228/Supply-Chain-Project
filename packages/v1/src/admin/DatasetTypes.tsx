import React, { useState, useEffect } from "react";
import {
  H4,
  Callout,
  NonIdealState,
  IBreadcrumbProps,
  Breadcrumbs,
} from "@blueprintjs/core";
import { useApi } from "../util/api";
import AdminClientScriptDetails from "./AdminClientScriptDetails";
import { ScriptProvision, EtlScript } from "./AdminClientScripts";
import useQueryParams from "../util/useQueryParams";
import DelayedSpinner from "../common/DelayedSpinner";
import { routerBreadcrumbRenderer } from "../nav/RouterBreadcrumb";
import { clientPath } from "../util/route";

export enum DatasetTypeRestrictionLevel {
  RESTRICTED = "RESTRICTED",
}

export type DatasetTypeRestriction = {
  type: string;
  clientId: string;
  level: DatasetTypeRestrictionLevel;
};

export type DatasetTypePrivilege = {
  type: string;
  clientId: string;
  userId: string;
};

export default function DatasetTypes() {
  const { clientId } = useQueryParams();
  const [etlScriptsMap, setEtlScriptsMap] = useState<Map<string, EtlScript>>(
    () => new Map()
  );

  const { error, data, fire } = useApi(
    `/scriptProvisions/client/${clientId}?includeScripts=true`
  );

  const { data: etlScriptsData, fire: etlScriptsFire } = useApi(
    `/etlScripts/client/${clientId}`
  );

  const { data: restrictions, fire: restrictionsFire } = useApi(
    `/datasetTypeRestrictions/client/${clientId}`
  );

  useEffect(() => {
    const map = new Map<string, EtlScript>();
    const etls: EtlScript[] = etlScriptsData?.etlScripts || [];
    etls.forEach((etl) => {
      map.set(etl.datasetType, etl);
    });
    setEtlScriptsMap(map);
  }, [etlScriptsData]);

  const handleDetailsChange = () => {
    fire();
    etlScriptsFire();
    restrictionsFire();
  };

  if (!clientId) return <Callout intent="danger">Missing client ID</Callout>;

  if (error) {
    return (
      <Callout intent="danger">Error loading scripts: {String(error)}</Callout>
    );
  }

  const provisions: ScriptProvision[] = data?.scriptProvisions;
  const datasetTypeRestrictions: string[] =
    restrictions?.datasetTypeRestrictions;

  if (!provisions || !datasetTypeRestrictions) return <DelayedSpinner />;

  if (provisions?.length === 0)
    return <NonIdealState title="No Dataset Types" icon="console" />;

  const BREADCRUMBS: IBreadcrumbProps[] = [
    {
      href: clientPath(clientId, "datasetTypes"),
      text: "Dataset Types",
      current: true,
    },
  ];
  return (
    <>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={BREADCRUMBS}
          breadcrumbRenderer={routerBreadcrumbRenderer}
        />
      </div>
      {provisions?.map((provision) => (
        <React.Fragment key={provision.scriptId}>
          <H4 style={{ margin: "16px 16px 8px 16px" }}>
            {provision.script!.name}
          </H4>
          <AdminClientScriptDetails
            mode="clientAdmin"
            clientId={clientId}
            script={provision.script!}
            etlScriptsMap={etlScriptsMap}
            restrictedDatasetTypes={restrictions.datasetTypeRestrictions}
            onChange={handleDetailsChange}
          />
        </React.Fragment>
      ))}
    </>
  );
}
