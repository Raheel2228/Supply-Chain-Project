import React, { useState, useEffect } from "react";
import {
  Popover,
  FormGroup,
  InputGroup,
  Classes,
  Button,
  TextArea,
} from "@blueprintjs/core";
import { useForm, Controller } from "react-hook-form";
import TagSelector from "../common/TagSelector";
import { Report } from "./Reports";

interface IReportDetailsPopoverProps {
  report: Report;
  onSave: (newData: Inputs, newTags: string[]) => void;
  target: string | JSX.Element;
}

type Inputs = {
  name: string;
  description: string;
};

export default function ReportDetailsPopover({
  report,
  onSave,
  target,
}: IReportDetailsPopoverProps) {
  // Name and description are managed by react-hook-form
  const { control, handleSubmit } = useForm<Inputs>();
  // Maybe TagSelector can be integrated with the form, but it seems icky
  // For now, have seperate state
  const [tags, setTags] = useState<string[]>(
    report.tags?.map((tag) => tag.tag) || []
  );
  const [loading, setLoading] = useState<boolean>(false);

  // Merge the react-hook-form data with the tags
  const handleSave = (data: Inputs) => {
    setLoading(true);
    onSave(data, tags);
  };

  // We don’t know when parent finishes saving, so reset loading when the report changes
  useEffect(() => {
    setLoading(false);
  }, [report]);

  return (
    <Popover
      hasBackdrop
      content={
        <form onSubmit={() => {}}>
          <div style={{ padding: "16px", width: "300px" }}>
            <FormGroup label="Report Name" labelFor="name">
              <Controller
                as={InputGroup}
                id="name"
                name="name"
                defaultValue={report.name}
                autoFocus
                autoComplete="off"
                control={control}
              />
            </FormGroup>
            <FormGroup label="Description" labelFor="description">
              <Controller
                as={TextArea}
                control={control}
                name="description"
                fill
                defaultValue={report.description}
                placeholder="Brief description or summary"
                style={{ resize: "vertical" }}
              />
            </FormGroup>
            <FormGroup>
              <TagSelector
                allowTagCreation
                clientId={report.clientId}
                tags={tags}
                onChange={(newTags) => setTags(newTags)}
                label="Add tags…"
                fill
              />
            </FormGroup>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button
                className={Classes.POPOVER_DISMISS}
                type="button"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                className={Classes.POPOVER_DISMISS}
                intent="primary"
                type="button"
                onClick={handleSubmit(handleSave)}
                loading={loading}
                disabled={loading}
              >
                Save
              </Button>
            </div>
          </div>
        </form>
      }
      target={target}
    />
  );
}
