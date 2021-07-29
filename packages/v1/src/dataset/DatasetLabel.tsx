import React, { useState } from "react";
import {
  H5,
  InputGroup,
  Button,
  ControlGroup,
  Tooltip,
  Icon,
  Classes,
} from "@blueprintjs/core";
import { Dataset, ScriptInputDataset } from "../util/scriptSchema";
import DatasetDrawer from "./DatasetDrawer";

export const getDisplayTitle = (dataset?: Dataset): string => {
  if (!dataset) return "No dataset selected";
  const { id, title, inputSheet } = dataset;
  if (id === "LATEST") return "Always use latest";
  if (inputSheet) return `${title} (${inputSheet})`;
  return title;
};

interface DatasetLabelProps extends ScriptInputDataset {
  dataset?: Dataset;
  restricted?: boolean;
  enablePreview?: boolean;
}

export default function DatasetLabel({
  dataset,
  label,
  restricted = false,
  enablePreview = true,
}: DatasetLabelProps) {
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const showDataset = () => setDrawerVisible(true);
  const hideDataset = () => setDrawerVisible(false);

  return (
    <div className="dataset-selector">
      <H5>{label}</H5>
      <ControlGroup fill>
        <InputGroup
          type="text"
          value={getDisplayTitle(dataset)}
          title={getDisplayTitle(dataset)}
          disabled
          fill
        />
        {enablePreview && dataset && !restricted && (
          <Button
            className="dataset-preview-button"
            icon="eye-open"
            title="View Dataset"
            onClick={showDataset}
          />
        )}
        {enablePreview && restricted && (
          <Tooltip content="This dataset is restricted. You cannot view or change it.">
            <span className={Classes.BUTTON + " " + Classes.DISABLED}>
              <Icon icon="shield" />
            </span>
          </Tooltip>
        )}
      </ControlGroup>
      {dataset && drawerVisible && (
        <DatasetDrawer dataset={dataset} isOpen onClose={hideDataset} />
      )}
    </div>
  );
}
