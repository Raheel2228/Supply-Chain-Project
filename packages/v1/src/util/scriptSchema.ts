import { ReportState } from "../report/Reports";

export type DatasetTag = {
  datasetId: string;
  tag: string;
};

export type Dataset = {
  id: string;
  clientId: string;
  reportId: string | null;
  reportTab: string | null;
  type: string;
  state: ReportState | null;
  title: string;
  url: string;
  fileName: string;
  inputSheet: string | null;
  createdAt: string;
  // Tags are partially included, depending on query
  tags?: DatasetTag[];
};

export interface ScriptInputDataset {
  id: string;
  type: string;
  label: string;
  optional: boolean;
  // The id of an "inputGroupToggle" input; optional
  inputGroup?: string;
  formatPreview: string[][];
  longDescription?: string;
  sampleDatasetUrl?: string;
}

export interface ISelectOption {
  value: string;
  label: string;
}

export const emptyDefaultValue = (input: ScriptInput) => {
  switch (input.type) {
    case "inputGroupToggle":
    case "checkbox":
      return false;
    case "slider":
    case "number":
      return 0;
    case "date":
      return new Date().toJSON();
    case "dateRange":
      return [new Date().toJSON(), new Date().toJSON()];
    case "select":
    case "text":
    default:
      return "";
  }
};

export interface ScriptInput {
  id: string;
  label: string;
  defaultValue?: string | string[] | boolean | number;
  type:
    | "inputGroupToggle"
    | "text"
    | "number"
    | "slider"
    | "checkbox"
    | "date"
    | "dateRange"
    | "select"
    | "clientUser";
  // The id of an "inputGroupToggle" input; optional
  inputGroup?: string;
  // For number, slider, date, or dateRange
  min?: number | string;
  max?: number | string;
  // For slider
  stepSize?: number;
  labelStepSize?: number;
  // For date or dateRange
  showShortcuts?: string;
  // For select
  options?: ISelectOption[];
}

export type InputGroup = {
  inputDatasets: ScriptInputDataset[];
  inputs: ScriptInput[];
  toggle?: ScriptInput;
};
const defaultInputGroupName = "Model";

export const computeInputGroups = (
  schema: ScriptSchema
): Map<string, InputGroup> => {
  const groups = new Map<string, InputGroup>();
  // Datasets
  schema.inputDatasets.forEach((inputDataset) => {
    const groupName = inputDataset.inputGroup || defaultInputGroupName;
    if (groups.has(groupName)) {
      groups.get(groupName)?.inputDatasets.push(inputDataset);
    } else {
      groups.set(groupName, { inputDatasets: [inputDataset], inputs: [] });
    }
  });
  // Inputs
  schema.inputs.forEach((input) => {
    let groupName = input.inputGroup || defaultInputGroupName;
    // Group toggles are special, and their ID is the groupName
    if (input.type === "inputGroupToggle") {
      groupName = input.id;
      if (groups.has(groupName)) {
        groups.get(groupName)!.toggle = input;
      } else {
        groups.set(groupName, {
          inputDatasets: [],
          inputs: [],
          toggle: input,
        });
      }
      // All other inputs
    } else if (groups.has(groupName)) {
      groups.get(groupName)?.inputs.push(input);
    } else {
      groups.set(groupName, { inputDatasets: [], inputs: [input] });
    }
  });
  return groups;
};

export type ScriptSchema = {
  inputDatasets: ScriptInputDataset[];
  inputs: ScriptInput[];
};

export const exampleScriptSchema: ScriptSchema = {
  // Array of objects for inputs
  inputs: [
    {
      // ID used to access the input
      id: "demand_multiplier",
      // Label shown to the user
      label: "Demand Multiplier",
      // Type can be text, number, slider, checkbox, date, dateRange, select, or clientUser
      type: "slider",
      // Default value is string, boolean, number, or date (depending on input type)
      defaultValue: 1,
      // Text properties (none)
      // Number properties
      max: 5,
      min: -4,
      // Slider properties
      // min: 0,
      // max: 5,
      // stepSize: 0.1,
      // labelStepSize: 1,
      // Checkbox properties (none)
      // Date and DateRange properties
      // (Date-only portion of ISO 8601 format, as string)
      // min: "YYYY-MM-DD",
      // max: "YYYY-MM-DD",
      // showShortcuts: "future", // or "past" or "none"
      // Select properties
      options: [
        // The defaultValue should correspond to one of these values
        { value: "opt1", label: "Option 1" },
        { value: "opt2", label: "Option 2" },
        { value: "opt2", label: "Option 2" },
      ],
    },
    {
      id: "forecast_length",
      type: "number",
      label: "Forecast Length",
      defaultValue: 365,
    },
    {
      id: "optionalGroupB",
      type: "inputGroupToggle",
      label: "Enable Analysis B",
    },
    {
      id: "group_b_forecast_length",
      type: "number",
      label: "Group B Forecast Length",
      defaultValue: 365,
      inputGroup: "optionalGroupB",
    },
    {
      id: "some_text_input",
      type: "text",
      label: "In a group by itself",
      defaultValue: "Social distancing 👍",
      inputGroup: "alwaysOnGroup",
    },
  ],
  // Array of objects for input datasets
  inputDatasets: [
    {
      // ID used to access the input dataset. Must be unique in the script.
      id: "sop_current_on_hand",
      // Type of this dataset. One script can have multiple input datasets of the same type.
      type: "sop_current_on_hand",
      // Label shown to the user
      label: "Current On Hand",
      optional: false,
      // Will be shown in a data table preview
      formatPreview: [
        ["id", "firstName", "name", "scientificName"],
        ["1", "Kelila", "Civet, common palm", "Paradoxurus hermaphroditus"],
        ["2", "Victor", "Western spotted skunk", "Spilogale gracilis"],
        ["3", "Giacomo", "Asian water dragon", "Physignathus cocincinus"],
      ],
    },
    {
      id: "sop_exploded_demand",
      type: "sop_exploded_demand",
      label: "Exploded Demand",
      optional: false,
      formatPreview: [],
    },
    {
      id: "sop_vendor_master",
      type: "sop_vendor_master",
      label: "Vendor Master",
      optional: false,
      formatPreview: [],
    },
    {
      id: "sop_sku_master",
      type: "sop_sku_master",
      label: "SKU Master",
      optional: false,
      formatPreview: [],
    },
    {
      id: "sop_open_pos",
      type: "sop_open_pos",
      label: "Open POs",
      optional: false,
      formatPreview: [],
    },
    {
      id: "group_b_sop",
      type: "sop_open_pos",
      label: "Group B Open POs",
      optional: false,
      inputGroup: "optionalGroupB",
      formatPreview: [],
    },
  ],
};
