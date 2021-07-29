import { Card, Spinner, Icon } from "@blueprintjs/core";
import React from "react";

export default function DatasetSpinner() {
  return (
    <Card className="floating-spinner-container" elevation={2}>
      <Spinner />
      <Icon icon="database" iconSize={20} />
    </Card>
  );
}
