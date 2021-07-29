import React, { ReactElement, ChangeEvent } from "react";
import {
  FormGroup,
  InputGroup,
  H5,
  Checkbox,
  Slider,
  NumericInput,
  Tag,
  HTMLSelect,
  Switch,
} from "@blueprintjs/core";
import { DatePicker, DateRangePicker, DateRange } from "@blueprintjs/datetime";
import { ScriptInput } from "../util/scriptSchema";
import UserSelector from "../user/UserSelector";

export type ModelInputValue = string | string[] | boolean | number;

interface ScriptInputProps extends ScriptInput {
  disabled?: boolean;
  onChange?: (newValue: ModelInputValue) => void;
  value: ModelInputValue;
  // Client ID is required for “user” input type
  clientId: string;
}

export default function ModelInput({
  id,
  label,
  type,
  min,
  max,
  stepSize,
  labelStepSize,
  showShortcuts,
  options,
  value,
  disabled = false,
  onChange,
  clientId,
}: ScriptInputProps) {
  let input: ReactElement;
  let showLabel = true;

  const handleChange = (newValue: ModelInputValue) =>
    onChange && onChange(newValue);

  switch (type) {
    case "text":
      const handleTextChange = (e: ChangeEvent<HTMLInputElement>) =>
        handleChange(e.target.value);
      input = (
        <InputGroup
          type="text"
          value={value as string}
          onChange={handleTextChange}
          disabled={disabled}
          fill
        />
      );
      break;
    case "number":
      const handleNumberChange = (valueAsNumber: number) =>
        handleChange(valueAsNumber);
      input = (
        <NumericInput
          value={value as number}
          onValueChange={handleNumberChange}
          min={min as number}
          max={max as number}
          disabled={disabled}
          fill
        />
      );
      break;
    case "slider":
      const handleSliderChange = (newValue: number) => handleChange(newValue);
      input = (
        <Slider
          value={value as number}
          onChange={handleSliderChange}
          min={min as number}
          max={max as number}
          stepSize={stepSize}
          labelStepSize={labelStepSize}
          disabled={disabled}
        />
      );
      break;
    case "inputGroupToggle":
      const handleToggleChange = (e: ChangeEvent<HTMLInputElement>) =>
        handleChange(e.target.checked);
      input = (
        <Switch
          checked={value as boolean}
          onChange={handleToggleChange}
          label={label}
          disabled={disabled}
          large
        />
      );
      showLabel = false;
      break;
    case "checkbox":
      const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) =>
        handleChange(e.target.checked);
      input = (
        <Checkbox
          checked={value as boolean}
          onChange={handleCheckboxChange}
          label={label}
          disabled={disabled}
        />
      );
      showLabel = false;
      break;
    case "date":
      const handleDateChange = (selectedDate: Date, isUserChange: boolean) => {
        if (isUserChange) {
          handleChange(selectedDate.toJSON());
        }
      };
      input = disabled ? (
        <Tag>{value}</Tag>
      ) : (
        <DatePicker
          value={new Date(value as string)}
          onChange={handleDateChange}
          minDate={new Date(min as string)}
          maxDate={new Date(max as string)}
          shortcuts={!!showShortcuts}
          canClearSelection={false}
        />
      );
      break;
    case "dateRange":
      const handleDateRangeChange = (selectedDates: DateRange) => {
        const [start, end] = selectedDates;
        if (start && end) {
          handleChange([start.toJSON(), end.toJSON()]);
        }
      };
      const [start, end] = value as string[];
      input = (
        <DateRangePicker
          value={[new Date(start), new Date(end)]}
          onChange={handleDateRangeChange}
          minDate={new Date(min as string)}
          maxDate={new Date(max as string)}
          shortcuts={!!showShortcuts}
          contiguousCalendarMonths={false}
        />
      );
      break;
    case "select":
      const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        handleChange(e.currentTarget.value);
      };
      input = (
        <HTMLSelect
          value={value as string | number}
          onChange={handleSelectChange}
          disabled={disabled}
          fill
          options={options}
        />
      );
      break;
    case "clientUser":
      input = (
        <UserSelector
          clientId={clientId}
          userId={value as string}
          onChange={handleChange}
          disabled={disabled}
        />
      );
      break;
  }
  return (
    <FormGroup className="dataset-input">
      {showLabel && <H5>{label}</H5>}
      {input}
    </FormGroup>
  );
}
