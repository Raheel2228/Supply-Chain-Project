import React from "react";
import {
  HTMLTable,
  AnchorButton,
  Drawer,
  H5,
} from "@blueprintjs/core";
import { ScriptInputDataset } from "../util/scriptSchema";
import config from "../config";

interface IScriptInputDatasetDrawerProps extends ScriptInputDataset {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScriptInputDatasetDrawer({
  isOpen,
  onClose,
  label,
  formatPreview,
  longDescription,
  sampleDatasetUrl,
}: IScriptInputDatasetDrawerProps) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="clamp(360px, 40%, 90%)"
      title={`About ${label}`}
      icon="info-sign"
    >
      <section style={{ padding: "16px 16px 0 16px" }}>
        {longDescription && <H5>Description</H5>}
        <p style={{ lineHeight: "150%", fontSize: "1.2em" }}>
          {longDescription}
        </p>
        {sampleDatasetUrl && (
          <AnchorButton
            icon="cloud-download"
            href={sampleDatasetUrl}
            target="_blank"
            style={{ marginBottom: "24px" }}
          >
            Download Sample Dataset
          </AnchorButton>
        )}
        <br />
        <H5>Format Preview</H5>
      </section>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <HTMLTable bordered striped style={{ width: "100%" }}>
          <tbody>
            {formatPreview.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </div>
      <section style={{ padding: "16px" }}>
        <H5>Additional Information</H5>
        <p style={{ lineHeight: "150%", fontSize: "1.2em" }}>
          <a href={config.contactUrl} target="_blank" rel="noopener noreferrer">
            Contact us
          </a>{" "}
          if you have questions about this dataset or need help getting your
          data in the correct format.
        </p>
      </section>
    </Drawer>
  );
}
