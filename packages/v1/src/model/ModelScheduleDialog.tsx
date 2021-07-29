import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Icon,
  Button,
  Dialog,
  Classes,
  Tooltip,
  FormGroup,
  Callout,
  Checkbox,
  Colors,
} from "@blueprintjs/core";
import { TimePicker, TimePrecision } from "@blueprintjs/datetime";
import { Model } from "./Models";
import { AppToaster } from "../common/toaster";
import { ModelUpdateInput } from "./ModelEditor";
import TagSelector from "../common/TagSelector";
import UserMultiSelector from "../user/UserMultiSelector";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface IModelScheduleDialogProps {
  isOpen: boolean;
  // Parent component needs to save the schedule to the model
  onUpdate: (updatedModel: ModelUpdateInput) => void;
  onClose?: (event?: React.SyntheticEvent<HTMLElement>) => void;
  model: Model;
}

export default function ModelScheduleDialog({
  isOpen,
  onUpdate,
  onClose,
  model,
}: IModelScheduleDialogProps) {
  const [minute, setMinute] = useState<number>(0);
  const [hour, setHour] = useState<number>(9);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [tags, setTags] = useState<string[]>(model.schedule?.tags || []);
  const [recipients, setRecipients] = useState<string[]>(
    model.schedule?.recipients || []
  );
  const [markSaved, setMarkSaved] = useState<boolean>(
    model.schedule?.markSaved ?? false
  );
  const [onlyKeepLatest, setOnlyKeepLatest] = useState<boolean>(
    model.schedule?.onlyKeepLatest ?? false
  );

  useEffect(() => {
    if (!model.schedule?.cronString) return;
    // This should probably be replaced with more robust cron parsing and creation
    // Only a very small subset is supported. Notably, the day must be a list (1,2,3) and not a range (1-3)
    const cronStringTokens = model.schedule.cronString.split(" ");
    setMinute(Number(cronStringTokens[0]));
    setHour(Number(cronStringTokens[1]));
    setDaysOfWeek(
      cronStringTokens[4]
        .split(",")
        .map((day) => Number(day))
        .filter((day) => day >= 0 && day < 7)
    );
  }, [model.schedule]);

  const newCronString = `${minute} ${hour} * * ${[...daysOfWeek]
    .sort()
    .join(",")}`;
  console.log(model.schedule?.cronString, "new", newCronString);

  // This is the difference between UTC and current timezone, in minutes. (E.g., GMT-6 is 360)
  const timezoneOffset = new Date().getTimezoneOffset();

  // Create date object for selected hour and minute
  const date = new Date(0, 0, 0, hour, minute);

  const handleDateChange = (newDate: Date) => {
    setHour(newDate.getHours());
    setMinute(newDate.getMinutes());
  };

  const handleDeleteClick = () => {
    onUpdate({ schedule: null });
    onClose && onClose();
  };

  const handleSaveClick = () => {
    if (daysOfWeek.length === 0) {
      AppToaster.show({
        message: "Select at least one day of the week for this model to run.",
        icon: "calendar",
        intent: "danger",
      });
      return;
    }
    onUpdate({
      schedule: {
        cronString: newCronString,
        timezoneOffset,
        tags,
        recipients,
        markSaved,
        onlyKeepLatest,
        updatedAt: new Date().toUTCString(),
      },
    });
    onClose && onClose();
  };

  return (
    <Dialog
      icon="time"
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Automatic Reports"
    >
      <Callout icon="cube" style={{ borderRadius: "0" }}>
        Model: {model.name}
      </Callout>
      <Callout icon="info-sign" style={{ borderRadius: "0" }}>
        This schedule will run in GMT{timezoneOffset < 0 ? "+" : ""}
        {timezoneOffset / -60},{" "}
        {Intl.DateTimeFormat().resolvedOptions().timeZone}
      </Callout>
      <div className={Classes.DIALOG_BODY}>
        <FormGroup
          label="Time"
          className="time-form-group"
          labelInfo="(Actual delivery time may vary)"
          style={{ marginTop: "-24px" }}
        >
          <TimePicker
            precision={TimePrecision.MINUTE}
            selectAllOnFocus
            useAmPm
            showArrowButtons
            value={date}
            onChange={handleDateChange}
          />
        </FormGroup>
        <FormGroup label="Days to run" className="days-form-group">
          {DAYS.map((day, dayIndex) => (
            <Checkbox
              key={day}
              checked={daysOfWeek.includes(dayIndex)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.currentTarget.checked) {
                  setDaysOfWeek([...daysOfWeek, dayIndex]);
                } else {
                  setDaysOfWeek(daysOfWeek.filter((day) => day !== dayIndex));
                }
              }}
            >
              {day}
            </Checkbox>
          ))}
        </FormGroup>
        <FormGroup label="Tag reports with">
          <TagSelector
            clientId={model.clientId}
            tags={tags}
            onChange={(values) => setTags(values)}
            allowTagCreation
            fill
          />
        </FormGroup>
        <FormGroup
          label={
            <Tooltip content="Users will be notified at their preferred email address when each report is available">
              <span>
                Notify and share reports with &nbsp;
                <Icon icon="info-sign" color={Colors.GRAY1} />
              </span>
            </Tooltip>
          }
        >
          <UserMultiSelector
            clientId={model.clientId}
            defaultValue={recipients}
            onChange={(values) => setRecipients(values as string[])}
          />
        </FormGroup>
        <Checkbox
          checked={markSaved}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setMarkSaved(e.currentTarget.checked)
          }
        >
          Mark reports as saved
        </Checkbox>
        <Checkbox
          checked={onlyKeepLatest}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setOnlyKeepLatest(e.currentTarget.checked)
          }
        >
          Only keep latest report &nbsp;
          <Tooltip content="After running, auto-archive other reports from this model and their associated datasets">
            <Icon icon="info-sign" color={Colors.GRAY1} />
          </Tooltip>
        </Checkbox>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          {model.schedule && (
            <Button onClick={handleDeleteClick}>Delete Schedule</Button>
          )}
          <div style={{ flex: 1 }} />
          <Button onClick={onClose}>Cancel</Button>
          <Button intent="primary" onClick={handleSaveClick}>
            Save
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
