import React, { useState, useEffect, useCallback } from "react";
import {
  Breadcrumbs,
  IBreadcrumbProps,
  Button,
  Callout,
  Card,
  Popover,
  Menu,
  MenuItem,
  Collapse,
} from "@blueprintjs/core";
import { useHistory, useParams } from "react-router";
import DatasetSelector from "../dataset/DatasetSelector";
import {
  ScriptSchema,
  Dataset,
  InputGroup,
  computeInputGroups,
  ScriptInputDataset,
  emptyDefaultValue,
  ScriptInput,
} from "../util/scriptSchema";
import { ModelInputDatasets, Model, ModelInputValues } from "./Models";
import { Redirect } from "react-router";
import useQueryParams from "../util/useQueryParams";
import { useAuthFetch, useApi } from "../util/api";
import { AppToaster } from "../common/toaster";
import DelayedSpinner from "../common/DelayedSpinner";
import { ModelUpdateInput } from "./ModelEditor";
import { ScriptProvision } from "../admin/AdminClientScripts";
import DatasetLabel from "../dataset/DatasetLabel";
import { Helmet } from "react-helmet-async";
import { routerBreadcrumbRenderer } from "../nav/RouterBreadcrumb";
import { showConfirm } from "../common/ImperativeDialog";
import ModelInput, { ModelInputValue } from "./ModelInput";
import { clientPath } from "../util/route";

interface ModelParams {
  modelId: string;
}

export default function ModelSetup() {
  const { modelId } = useParams<ModelParams>();
  const { clientId } = useQueryParams();
  const history = useHistory();

  const [submitting, setSubmitting] = useState<boolean>(false);

  // TODO make this code reusable across this and ModelEditor
  const [inputGroups, setInputGroups] = useState<Map<string, InputGroup>>(
    () => new Map()
  );
  // Keep a local copy of these so we don’t have to re-fetch model on every change
  const [inputValues, setInputValues] = useState<ModelInputValues>({});
  const [inputDatasets, setInputDatasets] = useState<ModelInputDatasets>({});

  const authFetch = useAuthFetch();

  const modelQuery = useApi(`/models/${modelId}`);
  const scriptProvisionsQuery = useApi(`/scriptProvisions/client/${clientId}`);
  const datasetTypeRestrictionsQuery = useApi(
    `/datasetTypeRestrictions/client/${clientId}/currentUser`
  );

  const model: Model = modelQuery.data?.model;
  const scriptProvisions: ScriptProvision[] =
    scriptProvisionsQuery.data?.scriptProvisions;

  useEffect(() => {
    if (model) {
      const scriptSchema: ScriptSchema = model.script!.schema;

      // Set inputs
      const modelInputs = model.inputs || {};
      const newInputValues: ModelInputValues = {};
      scriptSchema.inputs.forEach((input) => {
        // Important to use null coalescing operator ?? instead of || to allow 0 and false as input values
        const currentValue = modelInputs[input.id] ?? input.defaultValue;
        newInputValues[input.id] = currentValue || emptyDefaultValue(input);
      });
      setInputValues(newInputValues);
      // Set input datasets
      setInputDatasets(model.inputDatasets || {});

      // Set input groups
      const newGroups = computeInputGroups(scriptSchema);
      setInputGroups(newGroups);
    }
  }, [model]);

  if (modelQuery.error || scriptProvisionsQuery.error) {
    return (
      <Callout intent="danger">
        Error loading model:{" "}
        {String(modelQuery.error || scriptProvisionsQuery.error)}
      </Callout>
    );
  } else if (
    !modelQuery.data ||
    !scriptProvisionsQuery.data ||
    !datasetTypeRestrictionsQuery.data
  ) {
    return <DelayedSpinner />;
  }

  const datasetTypeRestrictions: string[] =
    datasetTypeRestrictionsQuery.data.datasetTypeRestrictions;

  const scriptProvision = scriptProvisions?.find(
    ({ scriptId }) => model && scriptId === model.scriptId
  );
  if (scriptProvision?.state === "COMPLETE") {
    return (
      <Redirect push={false} to={`/models/${model.id}?clientId=${clientId}`} />
    );
  }

  const handleSubmitClick = async () => {
    if (submitting) return;
    // Ensure all non-optional datasets in enabled input groups have a value
    let valid = true;
    model.script?.schema.inputDatasets.forEach((inputDataset) => {
      if (
        inputDataset.optional !== true &&
        // Prevent from using “Always use latest” as workaround from uploading dataset for initial setup
        (!inputDatasets[inputDataset.id] ||
          inputDatasets[inputDataset.id].id === "LATEST") &&
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

    setSubmitting(true);
    try {
      await authFetch(
        `/scriptProvisions/${model.scriptId}/${clientId}/markPending`,
        {
          method: "POST",
        }
      );
      scriptProvisionsQuery.fire();
      AppToaster.show({
        message: "Model Submitted",
        intent: "success",
        icon: "saved",
      });
    } catch (error) {
      AppToaster.show({
        message: "Error submitting model",
        intent: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (
    modelData: ModelUpdateInput,
    fireWhenComplete = true
  ) => {
    try {
      await authFetch(`/models/${modelId}`, {
        method: "PATCH",
        body: JSON.stringify(modelData),
      });
      if (fireWhenComplete) modelQuery.fire();
    } catch (error) {
      AppToaster.show({
        message: "Error updating model",
        intent: "danger",
      });
    }
  };

  // Update model input value when value changes
  const handleInputChange = (inputId: string, newValue: ModelInputValue) => {
    console.log(inputId, newValue);
    const newInputValues = {
      ...inputValues,
      [inputId]: newValue,
    };
    setInputValues(newInputValues);
    // Not using debounce here, since we only have inputGroupToggles.
    handleUpdate({ inputs: newInputValues }, false);
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

  const handleDeleteClick = async () => {
    const confirmation = await showConfirm(
      "Permanently delete this model?",
      "Delete",
      "Cancel",
      true
    );
    if (confirmation) {
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
      }
    }
  };

  const BREADCRUMBS: IBreadcrumbProps[] = [
    { href: clientPath(clientId!, "models"), text: "Models" },
    {
      href: `/modelSetup/${modelId}?clientId=${clientId}`,
      text: model.name,
      current: true,
    },
  ];

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
      disabled={submitting}
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
        />
        <Popover
          position="bottom"
          content={
            <Menu>
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
        {scriptProvision?.state === "NEEDED" && (
          <Callout icon="cube-add" title="Model Setup">
            <p>
              This model uses new dataset types. Upload your data for each, and
              we will configure this model to work seamlessly and accurately for
              you.
            </p>
            <p>
              <i>This only needs to be done once for each model template.</i>
            </p>
          </Callout>
        )}

        {scriptProvision?.state === "PENDING" && (
          <Callout icon="saved" title="Model Setup" intent="success">
            <p>
              Your data has been uploaded. You will receive an email when this
              model is ready for you to use.
            </p>
            <p>
              <i>You can upload new data below, if needed.</i>
            </p>
          </Callout>
        )}

        <br />

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
            </Collapse>
          </Card>
        ))}

        <Button
          large
          intent="primary"
          text={scriptProvision?.state === "PENDING" ? "Resubmit" : "Submit"}
          rightIcon="chevron-right"
          style={{ margin: "24px auto", display: "block" }}
          onClick={handleSubmitClick}
          loading={submitting}
        />
      </div>
    </>
  );
}
