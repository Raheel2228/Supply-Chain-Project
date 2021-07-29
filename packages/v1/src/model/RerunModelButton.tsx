import React, { useState } from "react";
import { Button } from "@blueprintjs/core";
import { Report } from "../report/Reports";
import { useAuthFetch } from "../util/api";
import { AppToaster } from "../common/toaster";
import { Model } from "./Models";
import { useHistory } from "react-router";
import { showConfirm } from "../common/ImperativeDialog";

interface IRerunModelButtonProps {
  report: Report;
}

export default function RerunModelButton({ report }: IRerunModelButtonProps) {
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(false);
  const authFetch = useAuthFetch();

  const handleClick = async () => {
    // Simple option: use imperative confirm
    // TODO Nicer option: display a popover that is closely and easier to discern
    try {
      setLoading(true);
      // Fetch model
      const modelQuery = await authFetch(`/models/${report.modelId}`, {});
      const model = modelQuery.model as Model;
      let inputsEqual = true;

      // Compare input datasets (compare from report to model, to allow optional datasets to be added to model)
      for (const inputDatasetName in report.inputDatasets) {
        // If model is always using latest, treat that as unchanged
        if (
          report.inputDatasets[inputDatasetName].id !==
            model.inputDatasets![inputDatasetName].id &&
          model.inputDatasets![inputDatasetName].id !== "LATEST"
        ) {
          inputsEqual = false;
          break;
        }
      }

      // Compare other inputs
      for (const inputName in report.inputs) {
        // Since input value could be a string array, stringify for easy comparison of all types without additional checking
        if (
          JSON.stringify(report.inputs[inputName]) !==
          JSON.stringify(model.inputs![inputName])
        ) {
          inputsEqual = false;
          break;
        }
      }

      // If they’re different, ask what the user wants to do
      if (!inputsEqual) {
        const confirmKeep = await showConfirm(
          "The model’s inputs have changed since this report ran. What would you like to do?",
          "Keep Current Model Inputs",
          "Overwrite with Report Inputs"
        );
        // If they want to overwrite, then patch the model
        if (!confirmKeep) {
          await authFetch(`/models/${report.modelId}`, {
            method: "PATCH",
            body: JSON.stringify({
              inputDatasets: report.inputDatasets,
              inputs: report.inputs,
            }),
          });
        }
      }
    } catch (error) {
      AppToaster.show({
        message: "Error loading model",
        intent: "danger",
      });
    } finally {
      history.push(`/models/${report.modelId}?clientId=${report.clientId}`);
      setLoading(false);
    }
  };

  return (
    <Button
      text="Re-run Model"
      icon="edit"
      intent="primary"
      onClick={handleClick}
      loading={loading}
      disabled={loading}
    />
  );
}
