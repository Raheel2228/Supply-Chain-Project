import React, { useState } from "react";
import { HTMLTable, Button, Classes, Dialog } from "@blueprintjs/core";
import { Script } from "./ScriptSelector";
import { ScriptSchema } from "../util/scriptSchema";
import { EtlScript } from "./AdminClientScripts";
import EditEtlScriptDialog from "./EditEtlScriptDialog";
import { formatTimestamp } from "../util/date";
import DatasetList, { DatasetListMode } from "../dataset/DatasetList";
import DatasetTypeRestrictionDialog from "./DatasetTypeRestrictionDialog";

interface IAdminClientScriptDetailsProps {
  clientId: string;
  script: Script;
  etlScriptsMap: Map<string, EtlScript>;
  onChange: () => void;
  mode: "globalAdmin" | "clientAdmin";
  restrictedDatasetTypes?: string[];
}

/**
 * This is used both in the global admin “Provisioned Scripts” section of a client,
 * and the client admin “Dataset Types” tab, since they share a lot of structure.
 */
export default function AdminClientScriptDetails({
  clientId,
  script,
  etlScriptsMap,
  onChange,
  mode,
  restrictedDatasetTypes,
}: IAdminClientScriptDetailsProps) {
  const [etlScriptDialog, setEtlScriptDialog] = useState<string | null>(null);
  const [viewDatasetsOfType, setViewDatasetsOfType] = useState<string | null>(
    null
  );
  // Dataset type to show restriction dialog for (this could use a better name)
  const [restrictionDialog, setRestrictionDialog] = useState<string | null>(
    null
  );

  const schema: ScriptSchema = script.schema;

  // Map unique dataset types to the labels of input datasets of that type
  const datasetTypes: Map<string, string[]> = new Map();

  for (const { type, label } of schema.inputDatasets) {
    if (!datasetTypes.has(type)) datasetTypes.set(type, []);
    datasetTypes.get(type)?.push(label);
  }

  const editRestrictionButton = (datasetType: string) => {
    let icon: "shield" | undefined;
    let text = "Not Restricted";

    if (restrictedDatasetTypes?.includes(datasetType)) {
      icon = "shield";
      text = "Restricted";
    }
    return (
      <Button
        text={text}
        icon={icon}
        onClick={() => setRestrictionDialog(datasetType)}
      />
    );
  };

  return (
    <>
      <HTMLTable striped className="admin-client-script-details-table">
        <tbody>
          {[...datasetTypes.keys()].map((datasetType) => {
            const etl = etlScriptsMap.get(datasetType);

            return (
              <tr key={datasetType}>
                <td>
                  {datasetType}{" "}
                  <span className={Classes.TEXT_MUTED}>
                    ({datasetTypes.get(datasetType)?.join(", ")})
                  </span>
                </td>
                {mode === "globalAdmin" && (
                  <td>
                    {etl
                      ? `Updated ${formatTimestamp(etl.updatedAt)}`
                      : "Not needed"}
                  </td>
                )}
                <td>
                  <Button
                    minimal
                    icon="folder-open"
                    intent="primary"
                    text="View Datasets"
                    onClick={() => setViewDatasetsOfType(datasetType)}
                  />
                </td>
                {mode === "globalAdmin" && (
                  <td>
                    <Button
                      minimal
                      intent="primary"
                      icon={etl ? "edit" : "plus"}
                      text="ETL"
                      onClick={() => setEtlScriptDialog(datasetType)}
                    />
                  </td>
                )}
                {mode === "clientAdmin" && (
                  <td>{editRestrictionButton(datasetType)}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </HTMLTable>

      {viewDatasetsOfType && (
        <Dialog
          isOpen
          onClose={() => setViewDatasetsOfType(null)}
          icon="folder-open"
          title={`${viewDatasetsOfType} Datasets`}
          style={{ width: "100%", maxWidth: "850px" }}
        >
          <DatasetList
            clientId={clientId}
            typeFilter={viewDatasetsOfType}
            mode={DatasetListMode.PREVIEW}
          />
        </Dialog>
      )}

      {restrictionDialog && (
        <DatasetTypeRestrictionDialog
          isOpen
          clientId={clientId}
          datasetType={restrictionDialog}
          restricted={restrictedDatasetTypes!.includes(restrictionDialog)}
          onSave={onChange}
          onClose={() => setRestrictionDialog(null)}
        />
      )}

      {etlScriptDialog && (
        <EditEtlScriptDialog
          isOpen
          clientId={clientId}
          datasetType={etlScriptDialog}
          etlScript={etlScriptsMap.get(etlScriptDialog)}
          onSave={onChange}
          onClose={() => setEtlScriptDialog(null)}
        />
      )}
    </>
  );
}
