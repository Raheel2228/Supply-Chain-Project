import React, { useCallback, useState, useEffect } from "react";
import {
  Button,
  H5,
  Popover,
  Position,
  Menu,
  MenuItem,
  Classes,
  Dialog,
  InputGroup,
  ControlGroup,
  Colors,
  Callout,
  Tooltip,
  Icon,
  MenuDivider,
} from "@blueprintjs/core";
import { useDropzone } from "react-dropzone";

import config from "../config";
import { useApi } from "../util/api";
import { formatTimestamp } from "../util/date";
import { Dataset, ScriptInputDataset } from "../util/scriptSchema";
import { AppToaster } from "../common/toaster";
import DatasetList, { DatasetListMode } from "./DatasetList";
import DatasetDrawer, { DatasetDrawerMode } from "./DatasetDrawer";
import { showConfirm } from "../common/ImperativeDialog";
import { getDisplayTitle } from "./DatasetLabel";
import ScriptInputDatasetDrawer from "../model/ScriptInputDatasetDrawer";

interface DatasetSelectorProps extends ScriptInputDataset {
  onChange?: (newDataset: Dataset | null) => void;
  dataset?: Dataset;
  clientId?: string;
}

enum DatasetDialog {
  NONE,
  UPLOAD,
  SELECT,
  EDIT,
  PREVIEW,
  SCRIPT_INFO,
}

// Special dataset ID to always use the latest dataset of that type
const LATEST = "LATEST";

/**
 * This controlled component does not save a selected or uploaded dataset to a model.
 * It handles selecting, uploading, and editing datasets independent of a model.
 * It will pass the new dataset in onChange for ModelEditor to save to model.
 */
export default function DatasetSelector({
  id,
  label,
  optional,
  type,
  formatPreview,
  onChange,
  dataset,
  clientId,
  longDescription,
  sampleDatasetUrl,
}: DatasetSelectorProps) {
  const [dialog, setDialog] = useState<DatasetDialog>(DatasetDialog.NONE);

  // For uploading new dataset
  const [file, setFile] = useState<File | undefined>(undefined);

  // Dataset that is selected, but not yet saved/confirmed
  const [pendingDataset, setPendingDataset] = useState<Dataset | undefined>(
    dataset
  );
  // If currently saved is always use latest
  const alwaysUsingLatest = dataset?.id === LATEST;
  // Update selected if dataset from parent changes
  useEffect(() => setPendingDataset(dataset), [dataset]);

  // Fetch the latest dataset, to check if selected is outdated or
  // to display a dataset name if “Always use latest” is selected
  const latestQuery = useApi(
    `/datasets?clientId=${clientId}&type=${type}&onlyLatestOne=true`
  );
  const latestDataset: Dataset | null = latestQuery.data?.datasets
    ? latestQuery.data.datasets[0]
    : null;
  // If currently-selected dataset is not the latest
  const outdated =
    !alwaysUsingLatest &&
    dataset &&
    latestDataset &&
    new Date(dataset.createdAt) < new Date(latestDataset.createdAt);

  const setLatestDataset = () => {
    const previousDataset = dataset;
    onChange && onChange(latestDataset!);
    AppToaster.show({
      message: "Newest dataset selected",
      action: {
        onClick: () => onChange && previousDataset && onChange(previousDataset),
        text: "Undo",
      },
      icon: "updated",
    });
  };

  const handleAlwaysUseLatestClick = async () => {
    const confirm = await showConfirm(
      "This model (including scheduled runs) will automatically use the newest dataset of this type. This could lead to unexpected results.",
      "Always Use Latest"
    );
    if (confirm) {
      onChange &&
        onChange({
          id: LATEST,
          clientId: clientId!,
          createdAt: new Date().toISOString(),
          fileName: "",
          title: "Always use latest",
          type,
          url: "",
          inputSheet: null,
          reportId: null,
          reportTab: null,
          state: null,
        });
      setDialog(DatasetDialog.NONE);
    }
  };

  const onFileDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: File[]) => {
      console.log(acceptedFiles);
      console.log(rejectedFiles);
      // Do something with the files
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setDialog(DatasetDialog.UPLOAD);
      } else if (rejectedFiles.length === 1) {
        AppToaster.show({
          message:
            "Invalid dataset file. Please upload a .csv, .tsv, .txt, or .xlsx file up to 15MB.",
          intent: "danger",
        });
      } else if (rejectedFiles.length > 1) {
        AppToaster.show({
          message: `Please upload a single file for this dataset (${rejectedFiles.length} files were selected)`,
          intent: "danger",
        });
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: onFileDrop,
    noClick: true,
    multiple: false,
    maxSize: 15 * 1024 * 1024,
    accept: ".csv,.tsv,.txt,.xlsx",
  });

  if (!clientId) {
    return <Callout intent="danger">Missing client ID</Callout>;
  }

  const handleDatasetSelect = (newDataset: Dataset) =>
    setPendingDataset(newDataset);

  const handleDatasetEdit = (newDataset: Dataset) => {
    // If set to always using latest, don’t switch to specific dataset when editing and creating a new copy
    if (!alwaysUsingLatest) {
      onChange && onChange(newDataset);
    } else {
      // But do re-fetch the latest dataset for consistency
      latestQuery.fire();
    }
  };

  const handleDatasetClear = () => {
    setDialog(DatasetDialog.NONE);
    onChange && onChange(null);
  };

  const allowClearing = dataset && optional;
  // Allow if a dataset is selected, or if always using latest and the latest has loaded
  const allowEditing =
    dataset && config.enableSpread && (!alwaysUsingLatest || latestDataset);
  const allowPreview = dataset && (!alwaysUsingLatest || latestDataset);

  const optionsMenu = (
    <Menu>
      <MenuItem
        icon="folder-open"
        text="Select existing dataset"
        onClick={() => setDialog(DatasetDialog.SELECT)}
      />
      <MenuItem icon="cloud-upload" text="Upload new dataset" onClick={open} />
      {(allowEditing || allowClearing) && <MenuDivider />}
      {allowEditing && (
        <MenuItem
          icon="manually-entered-data"
          text="Edit selected dataset"
          onClick={() => setDialog(DatasetDialog.EDIT)}
        />
      )}
      {allowClearing && (
        <MenuItem
          icon="small-cross"
          text="Clear selection"
          onClick={handleDatasetClear}
        />
      )}
    </Menu>
  );

  return (
    <>
      {/** @ts-ignore */}
      <div
        className={
          "dataset-selector " + (isDragActive ? Classes.ELEVATION_2 : "")
        }
        {...getRootProps()}
      >
        {/* Label and format preview */}
        <H5>
          {label}
          {optional === true && (
            <span className={Classes.TEXT_MUTED}>&nbsp;(optional)</span>
          )}
          {(formatPreview.length > 0 ||
            longDescription ||
            sampleDatasetUrl) && (
            <Button
              style={{ margin: "-5px 0 -2px 12px" }}
              minimal
              small
              icon="info-sign"
              color={Colors.GRAY1}
              title="View details about this dataset type"
              onClick={() => setDialog(DatasetDialog.SCRIPT_INFO)}
            />
          )}
        </H5>

        {/* Hidden file upload input */}
        <input {...getInputProps()} />

        {/* Current dataset and option buttons */}
        <ControlGroup>
          {dataset && (
            <InputGroup
              type="text"
              value={getDisplayTitle(dataset)}
              title={getDisplayTitle(dataset)}
              leftIcon={alwaysUsingLatest ? "updated" : undefined}
              disabled
              fill
            />
          )}
          {outdated && (
            <Tooltip
              content={
                <>
                  <strong>Newer dataset available (click to use)</strong>
                  <br />
                  {latestDataset!.title}{" "}
                  <span style={{ marginLeft: "16px", float: "right" }}>
                    {formatTimestamp(latestDataset!.createdAt)}
                  </span>
                  <hr className="inset" />
                  <strong>Currently selected</strong>
                  <br />
                  {dataset!.title}{" "}
                  <span style={{ marginLeft: "16px", float: "right" }}>
                    {formatTimestamp(dataset!.createdAt)}
                  </span>
                </>
              }
            >
              <Button
                icon={<Icon icon="outdated" intent="warning" />}
                // Set latest dataset immediately (since it’s not in dialog with confirm button)
                onClick={setLatestDataset}
              />
            </Tooltip>
          )}
          {allowPreview && (
            <Button
              icon="eye-open"
              title="View Dataset"
              onClick={() => setDialog(DatasetDialog.PREVIEW)}
            />
          )}
          <Popover
            content={optionsMenu}
            target={
              <Button
                title="Dataset Options"
                intent={isDragActive ? "primary" : "none"}
                icon={isDragActive ? "cloud-upload" : "more"}
                text={
                  isDragActive
                    ? "Drop file to upload"
                    : !dataset && "Select or drag file"
                }
              />
            }
            position={Position.BOTTOM}
          />
        </ControlGroup>
      </div>

      <ScriptInputDatasetDrawer
        isOpen={dialog === DatasetDialog.SCRIPT_INFO}
        onClose={() => setDialog(DatasetDialog.NONE)}
        {...{
          id,
          type,
          label,
          optional,
          formatPreview,
          longDescription,
          sampleDatasetUrl,
        }}
      />

      <DatasetDrawer
        isOpen={dialog === DatasetDialog.PREVIEW}
        onClose={() => setDialog(DatasetDialog.NONE)}
        dataset={alwaysUsingLatest ? latestDataset! : dataset}
        defaultMode={DatasetDrawerMode.PREVIEW}
        inputDatasetLabel={label}
        onUpload={handleDatasetEdit}
        onRename={handleDatasetEdit}
        onDelete={handleDatasetClear}
      />

      <DatasetDrawer
        isOpen={dialog === DatasetDialog.EDIT}
        onClose={() => setDialog(DatasetDialog.NONE)}
        dataset={alwaysUsingLatest ? latestDataset! : dataset}
        defaultMode={DatasetDrawerMode.EDIT}
        inputDatasetLabel={label}
        onUpload={handleDatasetEdit}
        onRename={handleDatasetEdit}
        onDelete={handleDatasetClear}
      />

      <DatasetDrawer
        isOpen={dialog === DatasetDialog.UPLOAD}
        onClose={() => setDialog(DatasetDialog.NONE)}
        file={file}
        defaultMode={DatasetDrawerMode.UPLOAD}
        onUpload={onChange}
        newDatasetType={type}
        inputDatasetLabel={label}
        clientId={clientId}
      />

      <Dialog
        icon="folder-open"
        onClose={() => setDialog(DatasetDialog.NONE)}
        title={`Select Dataset (${label})`}
        isOpen={dialog === DatasetDialog.SELECT}
        style={{ width: "100%", maxWidth: "850px" }}
      >
        <DatasetList
          onSelect={handleDatasetSelect}
          selectedId={pendingDataset?.id}
          clientId={clientId}
          typeFilter={type}
          mode={DatasetListMode.SELECT}
        />

        <br />
        <div className={Classes.DIALOG_FOOTER + " sticky-dialog-footer"}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              text="Always use latest"
              onClick={handleAlwaysUseLatestClick}
            />
            <div style={{ flex: 1 }}></div>
            <Button
              onClick={() => {
                setDialog(DatasetDialog.NONE);
                setPendingDataset(dataset);
              }}
            >
              Cancel
            </Button>
            <Button
              intent="primary"
              disabled={!pendingDataset}
              onClick={() => {
                onChange && onChange(pendingDataset!);
                setDialog(DatasetDialog.NONE);
              }}
            >
              Select
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
