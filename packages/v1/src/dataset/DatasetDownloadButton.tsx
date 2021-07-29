import React, { useEffect, useState } from "react";
import { Dataset } from "../util/scriptSchema";
import { Button, ButtonGroup } from "@blueprintjs/core";
import { AppToaster } from "../common/toaster";
import DatasetDrawer from "./DatasetDrawer";
import { useDatasetDownload } from "../util/services";

interface IDatasetDownloadButtonProps {
  dataset: Dataset;
  restricted?: boolean;
}

export default function DatasetDownloadButton({
  dataset,
  restricted = false,
}: IDatasetDownloadButtonProps) {
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const { loading, error, fire } = useDatasetDownload(dataset);

  const displayName = dataset.title || dataset.fileName;

  const showPreview = () => setPreviewOpen(true);

  useEffect(() => {
    if (error) {
      AppToaster.show({
        message: `Error downloading ${displayName}`,
        intent: "danger",
      });
    }
  }, [displayName, error]);

  if (restricted) {
    return (
      <Button
        minimal
        disabled
        style={{ margin: "8px" }}
        text={displayName}
        rightIcon="shield"
        title="This dataset is restricted. You cannot view it."
      />
    );
  }

  return (
    <>
      <ButtonGroup style={{ margin: "8px" }}>
        <Button
          minimal
          intent="primary"
          rightIcon="cloud-download"
          loading={loading}
          text={displayName}
          onClick={fire}
          title="Download Dataset"
        />
        <Button
          minimal
          intent="primary"
          icon="eye-open"
          onClick={showPreview}
          title="Preview Dataset"
        />
      </ButtonGroup>
      {previewOpen && (
        <DatasetDrawer
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          dataset={dataset}
        />
      )}
    </>
  );
}
