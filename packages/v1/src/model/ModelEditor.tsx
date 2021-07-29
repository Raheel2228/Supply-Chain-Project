import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
  lazy,
  useMemo,
  MouseEvent,
} from "react";
import {
  Breadcrumbs,
  IBreadcrumbProps,
  Button,
  Tooltip,
  Callout,
  Card,
  ProgressBar,
  Popover,
  MenuItem,
  Menu,
  Collapse,
  H6,
  Classes,
  Spinner,
} from "@blueprintjs/core";
import debounce from "lodash.debounce";
import cronstrue from "cronstrue";
import DatasetSelector from "../dataset/DatasetSelector";
import ModelInput, { ModelInputValue } from "./ModelInput";
import { useHistory, useParams, Redirect } from "react-router";
import {
  emptyDefaultValue,
  ScriptSchema,
  Dataset,
  ScriptInputDataset,
  ScriptInput,
  InputGroup,
  computeInputGroups,
} from "../util/scriptSchema";
import DelayedSpinner from "../common/DelayedSpinner";
import { useAuthFetch, useApi } from "../util/api";
import {
  Model,
  ModelSchedule,
  ModelInputValues,
  ModelInputDatasets,
} from "./Models";
import RenamePopover from "../common/RenamePopover";
import { AppToaster } from "../common/toaster";
import { formatTimestamp } from "../util/date";
import useQueryParams from "../util/useQueryParams";
import DatasetLabel from "../dataset/DatasetLabel";
import ModelPrivilegesDialog from "./ModelPrivilegesDialog";
import { Helmet } from "react-helmet-async";
import RouterBreadcrumb, {
  routerBreadcrumbRenderer,
} from "../nav/RouterBreadcrumb";
import { showPrompt } from "../common/ImperativeDialog";
import RecentReportsList from "../report/RecentReportsList";
import { clientPath } from "../util/route";
import { ScriptProvision } from "../admin/AdminClientScripts";

const ModelScheduleDialog = lazy(() => import("./ModelScheduleDialog"));

export type ModelUpdateInput = {
  name?: string;
  inputs?: ModelInputValues;
  inputDatasets?: ModelInputDatasets;
  schedule?: ModelSchedule | null;
};

interface ModelParams {
  modelId: string;
}

export default function ModelEditor() {
  const { modelId } = useParams<ModelParams>();
  const { clientId, showSchedule } = useQueryParams();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState<boolean>(
    showSchedule === "true"
  );
  const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false);
  const history = useHistory();

  const [updating, setUpdating] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);

  const [inputGroups, setInputGroups] = useState<Map<string, InputGroup>>(
    () => new Map()
  );
  // Keep a local copy of these so we don’t have to re-fetch model on every change
  const [inputValues, setInputValues] = useState<ModelInputValues>({});
  const [inputDatasets, setInputDatasets] = useState<ModelInputDatasets>({});

  const authFetch = useAuthFetch();
  const { error, data, fire } = useApi(`/models/${modelId}`);
  const datasetTypeRestrictionsQuery = useApi(
    `/datasetTypeRestrictions/client/${clientId}/currentUser`
  );
  const scriptProvisionsQuery = useApi(`/scriptProvisions/client/${clientId}`);

  const scriptProvisions: ScriptProvision[] =
    scriptProvisionsQuery.data?.scriptProvisions;

  useEffect(() => {
    const newInputValues: ModelInputValues = {};
    // Get all inputs from script schema
    if (data?.model?.script?.schema) {
      const model: Model = data.model!;
      const scriptSchema: ScriptSchema = model.script!.schema;
      const modelInputs = model.inputs || {};

      scriptSchema.inputs.forEach((input) => {
        // Important to use null coalescing operator ?? instead of || to allow 0 and false as input values
        const currentValue = modelInputs[input.id] ?? input.defaultValue;
        newInputValues[input.id] = currentValue || emptyDefaultValue(input);
      });
      setInputValues(newInputValues);
      console.log(newInputValues);

      // Set input datasets
      setInputDatasets(model.inputDatasets || {});

      // Set input groups
      const newGroups = computeInputGroups(scriptSchema);
      setInputGroups(newGroups);
    }
  }, [data]);

  const handleUpdate = async (
    modelData: ModelUpdateInput,
    fireWhenComplete = true
  ) => {
    setUpdating(true);
    try {
      await authFetch(`/models/${modelId}`, {
        method: "PATCH",
        body: JSON.stringify(modelData),
      });
      if (fireWhenComplete) fire();
    } catch (error) {
      AppToaster.show({
        message: "Error updating model",
        intent: "danger",
      });
    } finally {
      setUpdating(false);
    }
  };

  const debouncedSaveInputValues = useCallback(
    debounce(
      (newInputValues: ModelInputValues) =>
        handleUpdate({ inputs: newInputValues }, false),
      500
    ),
    []
  );

  const scheduleDescription = useMemo(() => {
    // Prevent cronstrue from crashing anything if cronString is invalid
    try {
      const cron = cronstrue.toString(data.model.schedule!.cronString);
      // Adjust wording
      return cron.replace("At", "at").replace(", only", "");
    } catch (error) {
      return "automatically";
    }
  }, [data]);

  if (
    error ||
    scriptProvisionsQuery.error ||
    datasetTypeRestrictionsQuery.error
  ) {
    return (
      <Callout intent="danger">Error loading model: {String(error)}</Callout>
    );
  } else if (
    !data ||
    !scriptProvisionsQuery.data ||
    !datasetTypeRestrictionsQuery.data
  ) {
    return <DelayedSpinner />;
  }

  // Update model input value when value changes
  const handleInputChange = (inputId: string, newValue: ModelInputValue) => {
    console.log(inputId, newValue);
    const newInputValues = {
      ...inputValues,
      [inputId]: newValue,
    };
    setInputValues(newInputValues);
    debouncedSaveInputValues(newInputValues);
  };

  const handleDatasetChange = (
    inputDatasetId: string,
    newDataset: Dataset | null
  ) => {
    console.log(inputDatasetId, newDataset);
    const newInputDatasets = {
      ...inputDatasets,
      [inputDatasetId]: newDataset as Dataset,
    };
    // DatasetSelector will pass null if selection was cleared (for optional datasets)
    // But the id should not exist on the inputDatasets object if there is no dataset
    // Delete after spreading previous datasets to ensure previous value is removed
    if (!newDataset) delete newInputDatasets[inputDatasetId];

    setInputDatasets(newInputDatasets);
    handleUpdate({ inputDatasets: newInputDatasets }, false);
  };

  const handleDuplicateClick = async () => {
    const duplicateName = (
      await showPrompt(
        "New model’s name:",
        model.name + " (Copy)",
        "Copy Model"
      )
    )?.trim();
    if (duplicateName) {
      setUpdating(true);
      AppToaster.show({
        message: "Copying model...",
        icon: "duplicate",
      });
      try {
        // Create new model from same script
        const result = await authFetch(`/models`, {
          method: "POST",
          body: JSON.stringify({
            clientId,
            scriptId: model.scriptId,
            name: duplicateName,
          }),
        });
        // Copy inputs and datasets to new model
        const newModelId = result.model.id;
        await authFetch(`/models/${newModelId}`, {
          method: "PATCH",
          body: JSON.stringify({
            schedule: model.schedule,
            inputs: inputValues,
            inputDatasets: inputDatasets,
          }),
        });
        AppToaster.clear();
        AppToaster.show({
          message: "Model copied",
          intent: "success",
        });
        history.push(`/modelSetup/${newModelId}?clientId=${clientId}`);
      } catch (error) {
        AppToaster.clear();
        AppToaster.show({
          message: "Error copying model",
          intent: "danger",
        });
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleDeleteClick = async () => {
    const confirmation = await showPrompt(
      "This will permanently delete all reports associated with this model. This action cannot be undone. Type “delete” to continue.",
      "",
      "Delete",
      "Cancel",
      true
    );
    if (confirmation?.trim().toLowerCase() === "delete") {
      setUpdating(true);
      try {
        await authFetch(`/models/${modelId}`, {
          method: "DELETE",
        });
        AppToaster.show({
          message: "Model deleted",
          intent: "primary",
          icon: "trash",
        });
        history.replace(clientPath(clientId!, "models"));
      } catch (error) {
        AppToaster.show({
          message: "Error deleting model",
          intent: "danger",
        });
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleRunClick = async (e: MouseEvent<HTMLElement>) => {
    if (running) return;
    // If control or command + clicked, then open in new tab
    const openInNewTab = e.ctrlKey || e.metaKey;
    // Ensure all non-optional datasets in enabled input groups have a value
    let valid = true;
    model.script?.schema.inputDatasets.forEach((inputDataset) => {
      if (
        // Not optional, not present,
        inputDataset.optional !== true &&
        !inputDatasets[inputDataset.id] &&
        // and if in a group, group is not toggled off
        (!inputDataset.inputGroup ||
          inputValues[inputDataset.inputGroup] !== false)
      ) {
        AppToaster.show({
          message: `Please provide a dataset for “${inputDataset.label}”`,
          intent: "danger",
        });
        valid = false;
      }
    });
    if (!valid) return;

    setRunning(true);
    const name = formatTimestamp(new Date());
    try {
      // Save inputs (in case Run was clicked without touching any, and defaults were displayed client-side without saving)
      await handleUpdate({ inputs: inputValues }, false);
      const result = await authFetch(`/reports`, {
        method: "POST",
        body: JSON.stringify({ modelId, name }),
      });
      AppToaster.show({
        message: "Report started",
        intent: "success",
      });
      const reportId = result.report.id;
      if (openInNewTab) {
        window.open(`/reports/${reportId}?clientId=${clientId}`, "_blank");
        setRunning(false);
      } else {
        history.push(`/reports/${reportId}?clientId=${clientId}`);
      }
    } catch (error) {
      AppToaster.show({
        message: `Error running model: ${error.toString()}`,
        intent: "danger",
      });
      setRunning(false);
    }
  };

  const showShareDialog = () => setShareDialogOpen(true);
  const hideShareDialog = () => setShareDialogOpen(false);

  const showScheduleDialog = () => setScheduleDialogOpen(true);
  const hideScheduleDialog = () => setScheduleDialogOpen(false);

  const model: Model = data.model;
  const datasetTypeRestrictions: string[] =
    datasetTypeRestrictionsQuery.data.datasetTypeRestrictions;

  const scriptProvision = scriptProvisions?.find(
    ({ scriptId }) => model && scriptId === model.scriptId
  );
  if (scriptProvision?.state !== "COMPLETE") {
    return (
      <Redirect
        push={false}
        to={`/modelSetup/${modelId}?clientId=${clientId}`}
      />
    );
  }

  const BREADCRUMBS: IBreadcrumbProps[] = [
    { href: clientPath(clientId!, "models"), text: "Models" },
    {
      href: `/models/${modelId}?clientId=${clientId}`,
      text: model.name,
      current: true,
    },
  ];

  const currentBreadcrumbRenderer = (props: IBreadcrumbProps) => (
    <>
      <RouterBreadcrumb current {...props} />
      <RenamePopover
        currentName={model.name}
        onSave={(newName) => handleUpdate({ name: newName })}
        target={
          <Tooltip content="Rename Model">
            <Button icon="edit" />
          </Tooltip>
        }
        label="Model Name"
      />
    </>
  );

  const datasetRenderer = (dataset: ScriptInputDataset) =>
    datasetTypeRestrictions.includes(dataset.type) ? (
      <DatasetLabel
        key={dataset.id}
        {...dataset}
        dataset={inputDatasets?.[dataset.id]}
        restricted
      />
    ) : (
      <DatasetSelector
        key={dataset.id}
        {...dataset}
        clientId={model.clientId}
        // Use local copy of inputDatasets
        dataset={inputDatasets?.[dataset.id]}
        onChange={(newDataset) => handleDatasetChange(dataset.id, newDataset)}
      />
    );

  const inputRenderer = (input: ScriptInput) => (
    <ModelInput
      key={input.id}
      // Use local copy of inputValues
      value={inputValues[input.id]}
      onChange={(newValue) => handleInputChange(input.id, newValue)}
      {...input}
      disabled={running}
      clientId={clientId!}
    />
  );

  return (
    <>
      <Helmet>
        <title>{model.name}</title>
      </Helmet>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={BREADCRUMBS}
          breadcrumbRenderer={routerBreadcrumbRenderer}
          currentBreadcrumbRenderer={currentBreadcrumbRenderer}
        />
        <Button
          minimal
          disabled
          icon={updating ? "refresh" : undefined}
          text={updating ? "Saving" : "Saved"}
        />
        <Popover
          position="bottom"
          content={<RecentReportsList clientId={clientId!} modelId={modelId} />}
          lazy
        >
          <Button text="Recent Reports" rightIcon="caret-down" />
        </Popover>
        <Button text="Share" icon="new-person" onClick={showShareDialog} />
        <Popover
          position="bottom"
          content={
            <Menu>
              <MenuItem
                text="Make a Copy"
                icon="duplicate"
                onClick={handleDuplicateClick}
              />
              <MenuItem
                intent="danger"
                text="Delete Model"
                icon="trash"
                onClick={handleDeleteClick}
              />
            </Menu>
          }
        >
          <Button icon="more" title="More model options" />
        </Popover>
      </div>

      <br />

      <div style={{ margin: "0 auto", maxWidth: "500px" }}>
        <H6
          as="h1"
          className={Classes.TEXT_MUTED}
          style={{ paddingLeft: "20px" }}
        >
          {model.script?.name}
        </H6>
        {Array.from(inputGroups).map(([groupName, group]) => (
          <Card key={groupName} className="input-group-card">
            {group.toggle && inputRenderer(group.toggle)}
            {/* Only show these if there is no toggle, or toggle is on */}
            <Collapse
              isOpen={!group.toggle || inputValues[groupName] === true}
              keepChildrenMounted={false}
              component="section"
            >
              {group.toggle && <br />}
              {group.inputDatasets.map(datasetRenderer)}
              {group.inputs.map(inputRenderer)}
            </Collapse>
          </Card>
        ))}

        {running && (
          <div style={{ margin: "16px auto", maxWidth: "200px" }}>
            <ProgressBar animate intent="primary" stripes />
          </div>
        )}
        {!running && (
          <Button
            large
            intent="primary"
            text="Run"
            rightIcon="chevron-right"
            loading={running}
            className="run-model-button"
            onClick={handleRunClick}
            title="Run Model (Control or Command + click to open report in new tab)"
          />
        )}

        <br />

        {!model.schedule && (
          <Button
            icon="time"
            minimal
            text="Add Schedule"
            style={{ margin: "0 auto", display: "block" }}
            onClick={showScheduleDialog}
          />
        )}

        {model.schedule && (
          <Callout icon="time">
            <p>Scheduled to run {scheduleDescription}.</p>
            <Button text="Edit Schedule" onClick={showScheduleDialog} />
          </Callout>
        )}
      </div>

      <Suspense fallback={<Spinner size={Spinner.SIZE_SMALL} />}>
        {scheduleDialogOpen && (
          <ModelScheduleDialog
            isOpen
            onClose={hideScheduleDialog}
            onUpdate={handleUpdate}
            model={model}
          />
        )}
      </Suspense>

      {shareDialogOpen && clientId && (
        <ModelPrivilegesDialog
          isOpen
          onClose={hideShareDialog}
          clientId={clientId}
          model={model}
        />
      )}
    </>
  );
}
