/** These are in a separate file so that the massive DatasetPreview with SpreadJS can be lazy-loaded */

export const isFileExcel = (fileName: string) =>
  /^.*\.(xls|xlsx)$/i.test(fileName);

export enum DatasetExportFormat {
  CSV,
  EXCEL,
}

export type DatasetPreviewHandle = {
  exportDataset: (format?: DatasetExportFormat) => Promise<Blob> | void;
};
