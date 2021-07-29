import React, {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  Ref,
} from "react";
import { Dataset } from "../util/scriptSchema";
import papaparse, { ParseResult } from "papaparse";
import { Table, Column, Cell } from "@blueprintjs/table";
import { Card, Callout, Tag } from "@blueprintjs/core";
import { useAuth0 } from "@auth0/auth0-react";
import config from "../config";
import designerConfig from "./designerConfig";

import GC from "@grapecity/spread-sheets";
import "@grapecity/spread-sheets-designer-resources-en";
import { Designer } from "@grapecity/spread-sheets-designer-react";
import "@grapecity/spread-sheets-designer/styles/gc.spread.sheets.designer.min.css";
import "@grapecity/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css";
import * as spreadExcel from "@grapecity/spread-excelio";

import ErrorBoundary from "../ErrorBoundary";
import DatasetSpinner from "./DatasetSpinner";
import {
  DatasetPreviewHandle,
  DatasetExportFormat,
  isFileExcel,
} from "./DatasetPreview.util";
import { getTheme, Theme } from "../common/Theme";

const { enableSpread } = config;

// Localhost doesn’t need a license key
if (enableSpread && process.env.NODE_ENV !== "development") {
  // Configure SpreadJS licenses
  GC.Spread.Sheets.LicenseKey = config.spreadJSKey;
  (GC.Spread.Sheets as any).Designer.LicenseKey = config.spreadJSDesignerKey;
  (spreadExcel as any).LicenseKey = config.spreadJSKey;
}

interface IDatasetPreviewProps {
  // Either a file, dataset, or raw data rows should be provided
  file?: File;
  dataset?: Dataset;
  rows?: any[];
  editMode: boolean;
  // Will be called when the active sheet of an Excel file changes
  onSheetChange?: (newSheetName: string) => void;
}

function DatasetPreview(
  { file, dataset, rows, editMode, onSheetChange }: IDatasetPreviewProps,
  ref: Ref<DatasetPreviewHandle>
) {
  const { getAccessTokenSilently } = useAuth0();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [unsupported, setUnsupported] = useState<boolean>(false);

  const [data, setData] = useState<any[]>([]);
  const [workbook, setWorkbook] = useState<GC.Spread.Sheets.Workbook>();
  const [sheet, setSheet] = useState<string>("");

  /**
   * This imperative handle is accessed via ref in parent component
   * to export dataset after it has been edited.
   */
  useImperativeHandle(
    ref,
    () => ({
      exportDataset: (format = DatasetExportFormat.EXCEL) => {
        return new Promise((resolve, reject) => {
          // If there’s no workbook (or SpreadJS is disabled), return undefined so that DatasetSelector will upload the unedited file
          if (!workbook) {
            resolve(undefined);
          }
          switch (format) {
            case DatasetExportFormat.EXCEL:
              new spreadExcel.IO().save(
                JSON.stringify(
                  workbook!.toJSON({ includeBindingSource: true })
                ),
                resolve,
                reject
              );
              break;
            case DatasetExportFormat.CSV:
              const sheet = workbook?.getActiveSheet();
              if (sheet) {
                // Export entirety of current sheet with standard delimiters
                const csvString = sheet.getCsv(
                  0,
                  0,
                  sheet.getRowCount(),
                  sheet.getColumnCount(),
                  "\r\n",
                  ","
                );
                const csvBlob = new Blob([csvString], { type: "text/csv" });
                resolve(csvBlob);
              }
              break;
            default:
              reject("Invalid dataset export format");
          }
        });
      },
    }),
    [workbook]
  );

  const setWorkbookOptions = useCallback(() => {
    if (!workbook) return;
    workbook.options.newTabVisible = editMode;
    workbook.options.allowSheetReorder = editMode;
    workbook.options.tabEditable = editMode;
    workbook.options.enableFormulaTextbox = true;
    workbook.options.allowExtendPasteRange = true;
    workbook.options.grayAreaBackColor =
      getTheme() === Theme.DARK ? "#30404d" : "#f5f8fa";

    try {
      if (editMode) {
        // Activate Home tab in edit mode
        const homeTab = document.querySelector(
          ".ribbon-navigation-item[data-id='home']"
        ) as HTMLElement;
        homeTab.click();
        // Trigger resize to force ribbon to repaint with correct layout
        window.dispatchEvent(new Event("resize"));
      } else {
        // Hide ribbon by default in read-only mode
        const collapseButton = document.getElementsByClassName(
          "collapsedRibbon"
        )[0] as HTMLElement;
        collapseButton.click();
      }
    } catch (error) {}

    // When sheet changes, send new name to parent and update protected status
    const handleSheetChange = () => {
      const sheet = workbook.getActiveSheet();
      setSheet(sheet.name());
      onSheetChange && onSheetChange(sheet.name());
      sheet.options.isProtected = !editMode;
      // Allow resizing in read-only mode
      sheet.options.protectionOptions.allowResizeRows = true;
      sheet.options.protectionOptions.allowResizeColumns = true;
      // Make the default column width more reasonable
      sheet.defaults.colWidth = 128;
    };

    // If the last row(s) or column(s) got deleted, then move selection to cell A1 to prevent
    // SpreadJS from re-adding the just-deleted cells upon saving.
    const handleRowChange = (
      event: any,
      args: GC.Spread.Sheets.IRowChangedEventArgs
    ) => {
      const sheet = workbook.getActiveSheet();
      const rowCount = sheet.getRowCount();
      if (args.row >= rowCount) {
        sheet.setSelection(0, 0, 1, 1);
      }
    };

    const handleColumnChange = (
      event: any,
      args: GC.Spread.Sheets.IColumnChangedEventArgs
    ) => {
      const sheet = workbook.getActiveSheet();
      const columnCount = sheet.getColumnCount();
      if (args.col >= columnCount) {
        sheet.setSelection(0, 0, 1, 1);
      }
    };

    const dateFormat = "mm/dd/yyyy";
    const cellDateFormatter = new GC.Spread.Formatter.GeneralFormatter(
      dateFormat,
      ""
    );

    // When dates are typed or pasted into cells, change the formatting of those cells to Date
    // (Otherwise they might revert to the numeric value when SpreadJS saves)
    const handleCellUpdate = (cell: GC.Spread.Sheets.CellRange) => {
      const cellValue = cell.value();
      if (cellValue instanceof Date) {
        cell.formatter(cellDateFormatter);
      }
    };

    const handleValueChange = (
      event: any,
      args: GC.Spread.Sheets.IValueChangedEventArgs
    ) => {
      handleCellUpdate(args.sheet.getCell(args.row, args.col));
    };

    const handleClipboardPaste = (
      event: any,
      args: GC.Spread.Sheets.IClipboardPastedEventArgs
    ) => {
      args.sheet.suspendPaint();
      // Update each cell in pasted range
      const { col, colCount, row, rowCount } = args.cellRange;
      for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
          handleCellUpdate(args.sheet.getCell(row + i, col + j));
        }
      }
      args.sheet.resumePaint();
    };

    const {
      ActiveSheetChanged,
      SheetChanged,
      SheetNameChanged,
      RowChanged,
      ColumnChanged,
      ValueChanged,
      ClipboardPasted,
    } = GC.Spread.Sheets.Events;

    workbook.unbind(ActiveSheetChanged);
    workbook.unbind(SheetChanged);
    workbook.unbind(SheetNameChanged);
    workbook.unbind(RowChanged);
    workbook.unbind(ColumnChanged);
    workbook.unbind(ValueChanged);
    workbook.unbind(ClipboardPasted);

    workbook.bind(ActiveSheetChanged, handleSheetChange);
    workbook.bind(SheetChanged, handleSheetChange);
    workbook.bind(SheetNameChanged, handleSheetChange);
    workbook.bind(RowChanged, handleRowChange);
    workbook.bind(ColumnChanged, handleColumnChange);
    workbook.bind(ValueChanged, handleValueChange);
    workbook.bind(ClipboardPasted, handleClipboardPaste);

    // Capture the starting sheet name
    setSheet(workbook.getActiveSheet().name());

    handleSheetChange();
  }, [editMode, onSheetChange, workbook]);

  // Options should be set automatically when workbook is initialized
  // (But also need to be manually callable when new workbook is loaded in)
  useEffect(() => {
    setWorkbookOptions();
  }, [setWorkbookOptions, workbook, loading]);

  // When the Designer has loaded, get its workbook
  // All further manipulation happens directly with the workbook,
  // the same as if the Designer wrapper were not being used
  const handleDesignerInitialized = (designer: any) => {
    if (designer) {
      setWorkbook(designer.getWorkbook());
    }
  };

  useEffect(() => {
    onSheetChange && onSheetChange(sheet);
  }, [onSheetChange, sheet]);

  useEffect(() => {
    // Simplest case: from raw data rows, with Blueprint table
    if (rows) {
      setData(rows);
      setLoading(false);
      return;
    }
    // Otherwise, wait for Spread to initialize
    if (enableSpread && !workbook) return;

    const handleExcelParse = (excelJson: any) => {
      workbook!.fromJSON(excelJson);

      // Default to the dataset’s inputSheet
      if (dataset?.inputSheet) {
        workbook!.setActiveSheet(dataset.inputSheet);
      }

      setLoading(false);
      setError("");
    };

    const handleExcelError = (error: any) => {
      console.log(error);
      setError(error);
    };

    const parseExcel = (blob: Blob) => {
      new spreadExcel.IO().open(blob, handleExcelParse, handleExcelError);
    };

    const handleCsvParse = (result: ParseResult<any>) => {
      // PapaParse seems to add empty row [""] at end.
      const lastRow = result.data.pop();
      // But if the last row wasn’t empty, keep it
      if (lastRow.length > 1 || lastRow[0] !== "") {
        result.data.push(lastRow);
      }
      if (enableSpread && workbook) {
        const csvSheet = workbook.getActiveSheet();
        // If preview was closed while dataset was downloading, this might fail
        if (!csvSheet) return;
        csvSheet.name("CSV Import");
        csvSheet.autoGenerateColumns = true;
        csvSheet.setDataSource(result.data, true);
      } else {
        setData(result.data);
      }
      setLoading(false);
      setError("");
    };

    const isExcel = isFileExcel(file?.name || dataset?.fileName || "");

    setLoading(true);
    // Preview from file, if provided
    if (file) {
      if (isExcel) {
        if (enableSpread) {
          parseExcel(file);
        } else {
          setUnsupported(true);
        }
      } else {
        papaparse.parse(file, { complete: handleCsvParse });
      }
    } else if (dataset) {
      // Otherwise download from API
      getAccessTokenSilently().then(async (token: string) => {
        const url = `${config.apiBase}/datasets/${dataset.id}/download`;
        const headers = { Authorization: `Bearer ${token}` };

        if (isExcel) {
          if (enableSpread) {
            const response = await fetch(url, { headers });
            const blob = await response.blob();
            parseExcel(blob);
          } else {
            setUnsupported(true);
          }
        } else {
          // Parse non-excel files with papaparse (CSV, TSV, TXT, etc.)
          papaparse.parse(url, {
            download: true,
            downloadRequestHeaders: headers,
            complete: handleCsvParse,
            error: (e) => setError(e.toString()),
          });
        }
      });
    }
  }, [file, dataset, getAccessTokenSilently, rows, workbook]);

  /* Use BlueprintJS Table if raw rows provided, or SpreadJS is disabled */
  if (rows || (data.length > 0 && !enableSpread)) {
    const cellRenderer = (row: number, column: number) => (
      <Cell>{data[row][column]}</Cell>
    );

    const columns = Array(data[0].length);
    for (let i = 0; i < data[0].length; i++) {
      columns[i] = <Column key={i} cellRenderer={cellRenderer} />;
    }

    return <Table numRows={data.length}>{columns}</Table>;
  }

  if (error) {
    return (
      <Card style={{ maxWidth: "400px", margin: "48px auto", padding: 0 }}>
        <Callout intent="danger">
          There was an error previewing this dataset.
        </Callout>
      </Card>
    );
  }

  if (unsupported) {
    return (
      <Card style={{ maxWidth: "400px", margin: "48px auto", padding: 0 }}>
        <Callout icon="info-sign">
          Excel files cannot be previewed in the browser.
        </Callout>
      </Card>
    );
  }

  return (
    <>
      {loading && <DatasetSpinner />}
      {enableSpread && (
        <ErrorBoundary>
          <div
            className={`spread-container ${
              editMode ? "edit-mode" : "read-only"
            }`}
          >
            <Designer
              styleInfo={{ width: "100%", height: "100%" }}
              config={designerConfig}
              designerInitialized={handleDesignerInitialized}
            />
          </div>
          <Tag
            intent={editMode ? "success" : "primary"}
            className="spreadjs-edit-indicator"
            title={
              editMode
                ? "Click “Save as Copy” on the right to finish editing"
                : "Click “Edit Data” on the right to switch to edit mode"
            }
          >
            {editMode ? "Edit Mode" : "Read-only"}
          </Tag>
        </ErrorBoundary>
      )}
    </>
  );
}

export default forwardRef(DatasetPreview);
