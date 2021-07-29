import React, {
  useState,
  useEffect,
  useRef,
  lazy,
  Suspense,
  ReactNode,
} from "react";
import {
  FormGroup,
  InputGroup,
  Button,
  Tooltip,
  Tag,
  HTMLTable,
  Classes,
  Menu,
  MenuItem,
  Drawer,
  H4,
  Portal,
} from "@blueprintjs/core";
import { isFileExcel, DatasetPreviewHandle } from "./DatasetPreview.util";
import { Dataset } from "../util/scriptSchema";
import { formatTimestamp } from "../util/date";
import { useDatasetDownload } from "../util/services";
import RenamePopover from "../common/RenamePopover";
import { useAuthFetch } from "../util/api";
import { AppToaster } from "../common/toaster";
import { Helmet } from "react-helmet-async";
import config from "../config";
import DatasetSpinner from "./DatasetSpinner";
import { showConfirm } from "../common/ImperativeDialog";
import { Prompt } from "react-router";
import TagList from "../common/TagList";
import { useUserState } from "../common/UserDataLoader";
import { PrivilegeLevel } from "../admin/ClientPrivilegeLevelSelector";

const DatasetPreview = lazy(() => import("./DatasetPreview"));

/**
 * DatasetDrawer handles uploading, previewing, and editing datasets.
 * These 3 modes share a lot of UI/logic but also have distinct parts,
 * so if this component grows more it should probably be split up.
 * The “Drawer” is the part on the right side of the screen. The actual
 * dataset preview is handled by the tightly-coupled DatasetPreview.
 */

const detailRow = (label: string, detail: string | ReactNode) => (
  <tr>
    <td>
      <span className={Classes.TEXT_MUTED + " no-wrap"}>{label}</span>
    </td>
    <td>{detail}</td>
  </tr>
);

export enum DatasetDrawerMode {
  PREVIEW,
  EDIT,
  UPLOAD,
}

interface IDatasetDrawerProps {
  isOpen: boolean;
  defaultMode?: DatasetDrawerMode;

  /** Needed for preview and edit modes */
  dataset?: Dataset;

  /** If used in the context of a DatasetSelector */
  inputDatasetLabel?: string;

  /** Needed for upload mode */
  file?: File;
  newDatasetType?: string;
  clientId?: string;

  /** Event callbacks */
  onUpload?: (newDataset: Dataset) => void;
  onRename?: (newDataset: Dataset) => void;
  onDelete?: (deletedDataset: Dataset) => void;
  onClose: () => void;
}

export default function DatasetDrawer({
  isOpen,
  defaultMode = DatasetDrawerMode.PREVIEW,
  file,
  newDatasetType,
  inputDatasetLabel,
  clientId,
  onUpload,
  onRename,
  onDelete,
  onClose,
  dataset: defaultDataset,
}: IDatasetDrawerProps) {
  const [mode, setMode] = useState<DatasetDrawerMode>(defaultMode);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const datasetPreviewRef = useRef<DatasetPreviewHandle | null>(null);

  // Keep a copy to modify when renamed, new dataset created, etc.
  const [dataset, setDataset] = useState<Dataset | undefined>(defaultDataset);
  useEffect(() => setDataset(defaultDataset), [defaultDataset]);

  const previewPortal = isOpen && (
    <Portal className="dataset-drawer-preview-portal">
      <Suspense fallback={<DatasetSpinner />}>
        <DatasetPreview
          dataset={dataset}
          file={file}
          editMode={mode !== DatasetDrawerMode.PREVIEW}
          onSheetChange={setActiveSheet}
          ref={datasetPreviewRef}
        />
      </Suspense>
    </Portal>
  );

  const goBack = () => {
    if (defaultMode !== DatasetDrawerMode.PREVIEW) {
      // If started in edit/upload, then close the drawer on cancel or upload
      onClose();
    } else {
      // Go back to preview mode if that’s where it started
      setMode(defaultMode);
    }
  };

  const handleUpload = (newDataset: Dataset) => {
    onUpload && onUpload(newDataset);
    goBack();
  };

  const handleCancel = () => goBack();

  let title;
  let titleSuffix = inputDatasetLabel ? ` (${inputDatasetLabel})` : "";
  let icon: "info-sign" | "edit" | "cloud-upload";
  let drawerContent;
  switch (mode) {
    case DatasetDrawerMode.PREVIEW:
      title = dataset?.title + titleSuffix;
      icon = "info-sign";
      drawerContent = (
        <PreviewDrawerContent
          dataset={dataset!}
          onDelete={onDelete}
          onEditClick={() => setMode(DatasetDrawerMode.EDIT)}
          onRename={onRename}
          onClose={onClose}
        />
      );
      break;
    case DatasetDrawerMode.EDIT:
      title = "Edit" + titleSuffix;
      icon = "edit";
      drawerContent = (
        <EditDrawerContent
          uploadMode={false}
          datasetPreviewHandle={datasetPreviewRef.current}
          onUpload={handleUpload}
          onCancel={handleCancel}
          onSheetChange={setActiveSheet}
          {...{ dataset, file, activeSheet, clientId, newDatasetType }}
        />
      );
      break;
    case DatasetDrawerMode.UPLOAD:
      title = "Upload" + titleSuffix;
      icon = "cloud-upload";
      drawerContent = (
        <EditDrawerContent
          uploadMode={true}
          datasetPreviewHandle={datasetPreviewRef.current}
          onUpload={handleUpload}
          onCancel={handleCancel}
          onSheetChange={setActiveSheet}
          {...{ dataset, file, activeSheet, clientId, newDatasetType }}
        />
      );
      break;
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={<span title={title}>{title}</span>}
      icon={icon}
      size={Drawer.SIZE_SMALL}
      enforceFocus={false}
      canEscapeKeyClose={mode === DatasetDrawerMode.PREVIEW}
      isCloseButtonShown={mode === DatasetDrawerMode.PREVIEW}
    >
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Prompt
        when={mode !== DatasetDrawerMode.PREVIEW}
        message="Are you sure you want to discard changes to this dataset?"
      />
      <div className={Classes.DRAWER_BODY}>{drawerContent}</div>
      {previewPortal}
    </Drawer>
  );
}

interface IPreviewDrawerContentProps {
  dataset: Dataset;
  onEditClick: () => void;
  onRename?: (newDataset: Dataset) => void;
  onDelete?: (deletedDataset: Dataset) => void;
  onClose: () => void;
}

function PreviewDrawerContent({
  dataset,
  onEditClick,
  onRename,
  onDelete,
  onClose,
}: IPreviewDrawerContentProps) {
  const download = useDatasetDownload(dataset);
  const authFetch = useAuthFetch();

  const { loading, clientPrivilegeLevel } = useUserState();
  if (loading) return null;

  // Prevent observers from editing, renaming, or deleting
  const allowChangeActions =
    clientPrivilegeLevel !== PrivilegeLevel.CLIENT_OBSERVER;

  const handleRename = async (title: string) => {
    try {
      await authFetch(`/datasets/${dataset.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      });
      AppToaster.show({
        message: "Dataset updated",
        intent: "success",
      });
      onRename && onRename({ ...dataset, title });
    } catch (error) {
      AppToaster.show({
        message: `Error updating dataset: ${error.toString()}`,
        intent: "danger",
      });
    }
  };

  const handleDelete = async () => {
    const confirmation = await showConfirm(
      "Permanently delete this dataset? This action cannot be undone.",
      "Delete",
      "Cancel",
      true
    );
    if (confirmation) {
      try {
        await authFetch(`/datasets/${dataset.id}`, {
          method: "DELETE",
        });
        AppToaster.show({
          message: "Dataset deleted",
          intent: "primary",
          icon: "trash",
        });
        onDelete && onDelete(dataset);
        onClose();
      } catch (error) {
        AppToaster.show({
          message: `Error deleting dataset: ${error.toString()}`,
          intent: "danger",
        });
      }
    }
  };

  const table = (
    <HTMLTable>
      <tbody>
        {detailRow("Name", dataset.title)}
        {detailRow(
          "Tags",
          dataset.tags?.length ? (
            <TagList tags={dataset.tags.map(({ tag }) => tag)} />
          ) : (
            <em>(none)</em>
          )
        )}
        {detailRow("Report State", dataset.state?.toLowerCase())}
        {detailRow("File Name", dataset.fileName)}
        {isFileExcel(dataset.fileName) &&
          detailRow("Selected Sheet", dataset.inputSheet || "")}
        {detailRow("Type", dataset.type)}
        {detailRow("Created At", formatTimestamp(dataset.createdAt))}
        {/* TODO {detailRow("Created By", "")} */}
        {/* TODO list models {detailRow("Used In", "" )} */}
      </tbody>
    </HTMLTable>
  );

  const menu = (
    <Menu>
      <MenuItem
        icon="cloud-download"
        text="Download"
        onClick={download.fire}
        disabled={download.loading}
      />
      {allowChangeActions && (
        <RenamePopover
          currentName={dataset.title}
          label="Dataset Name"
          wrapperTagName="li"
          targetClassName={Classes.FILL}
          onSave={handleRename}
          target={<MenuItem icon="edit" text="Rename" onClick={() => {}} />}
        />
      )}
      {config.enableSpread && allowChangeActions && (
        <MenuItem
          icon="manually-entered-data"
          text="Edit Data"
          onClick={onEditClick}
        />
      )}
      <Menu.Divider />
      {allowChangeActions && (
        <MenuItem
          icon="trash"
          text="Delete"
          intent="danger"
          onClick={handleDelete}
        />
      )}
    </Menu>
  );

  return (
    <>
      {table}
      <H4 style={{ margin: "10px" }}>Actions</H4>
      {menu}
    </>
  );
}

interface IEditDrawerContentProps {
  uploadMode: boolean;
  activeSheet: string;
  // When SpreadJS is not enabled but an Excel file is uploaded, sheet name can be manually entered
  onSheetChange: (newSheetName: string) => void;
  datasetPreviewHandle: DatasetPreviewHandle | null;
  dataset?: Dataset;

  /** Needed for upload mode */
  file?: File;
  newDatasetType?: string;
  clientId?: string;

  onUpload?: (newDataset: Dataset) => void;
  onCancel: () => void;
}

function EditDrawerContent({
  uploadMode,
  activeSheet,
  onSheetChange,
  datasetPreviewHandle,
  dataset,
  file,
  newDatasetType,
  clientId,
  onUpload,
  onCancel,
}: IEditDrawerContentProps) {
  const [newDatasetTitle, setNewDatasetTitle] = useState<string>(() => {
    if (dataset) return dataset.title;
    if (file) return file.name;
    return "";
  });
  const [uploading, setUploading] = useState<boolean>(false);

  const authFetch = useAuthFetch();

  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (uploading) return;
    setUploading(true);

    try {
      // If using SpreadJS, get edited version (will be undefined if uploading without SpreadJS)
      const editedBlob = await datasetPreviewHandle?.exportDataset();
      const datasetBlob = editedBlob ? editedBlob : (file as Blob);

      // Edited datasets are always exported as excel, so update the file extension (if edited)
      const oldFileName = uploadMode ? file!.name : dataset!.fileName;
      const fileName = editedBlob
        ? oldFileName.replace(/csv$/, "xlsx")
        : oldFileName;

      const formData = new FormData();
      formData.append("datasetBlob", datasetBlob);
      formData.append(
        "datasetInput",
        JSON.stringify({
          type: uploadMode ? newDatasetType : dataset?.type,
          title: newDatasetTitle,
          inputSheet: activeSheet,
          fileName,
          client: {
            connect: { id: uploadMode ? clientId : dataset?.clientId },
          },
        })
      );

      const uploadResult = await authFetch(
        "/datasets/upload",
        {
          method: "POST",
          body: formData,
        },
        false
      );
      // Since we specified not JSON, we have to manually handle response
      const json = await uploadResult.json();
      if (!json.success) throw json.message;

      setUploading(false);
      AppToaster.show({
        message: "Dataset uploaded",
        intent: "success",
      });
      onUpload && onUpload(json.dataset);
    } catch (error) {
      console.log(error);
      setUploading(false);
      AppToaster.show({
        message: `Error uploading dataset: ${error.toString()}`,
        intent: "danger",
      });
    }
  };

  const isExcel = isFileExcel(file?.name || dataset?.fileName || "");

  return (
    <form onSubmit={handleUploadSubmit} style={{ padding: "16px" }}>
      <FormGroup label="Dataset Name">
        <InputGroup
          fill
          autoFocus
          type="text"
          value={newDatasetTitle}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewDatasetTitle(e.target.value)
          }
        />
      </FormGroup>
      <FormGroup label="Dataset Type">
        <Tag style={{ marginTop: "6px" }}>
          {newDatasetType || dataset?.type}
        </Tag>
      </FormGroup>
      {config.enableSpread && (
        <FormGroup label="Sheet to Use">
          <Tooltip content="Select a sheet in the editor to change">
            <Tag style={{ marginTop: "6px", minWidth: "40px" }}>
              {activeSheet}
            </Tag>
          </Tooltip>
        </FormGroup>
      )}
      {/* When SpreadJS is not enabled but an Excel file is uploaded, sheet name can be manually entered */}
      {!config.enableSpread && isExcel && (
        <FormGroup label="Sheet to Use">
          <InputGroup
            fill
            type="text"
            value={activeSheet}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onSheetChange(e.target.value)
            }
          />
        </FormGroup>
      )}
      <div style={{ textAlign: "right" }}>
        <Button type="button" onClick={onCancel} style={{ marginRight: "8px" }}>
          Cancel
        </Button>
        <Button intent="primary" type="submit" loading={uploading}>
          {uploadMode ? "Upload" : "Save as Copy"}
        </Button>
      </div>
    </form>
  );
}
