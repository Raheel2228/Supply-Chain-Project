import { createContext } from "react";
export type Financial = {
  financialTableData: any;
  setFinancialTableData: any;
  financialAllVersion: any;
  setFinancialAllVersion: any;
  financialCurrentVersion: any;
  setFinancialCurrentVersion: any;
};
export const FinancialContext = createContext<Financial>({
  financialTableData: false,
  setFinancialTableData: () => {},
  financialAllVersion: false,
  setFinancialAllVersion: () => {},
  financialCurrentVersion: false,
  setFinancialCurrentVersion: () => {},
});
