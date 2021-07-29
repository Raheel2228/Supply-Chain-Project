import { createContext } from "react";
export type Portfolio = {
  skuTableData: any;
  setSkuTableData: any;
  masterTableData: any;
  setMasterTableData: any;
  kitBomTableData: any;
  setKitBomTableData: any;
  kitBomName: any;
  setKitBomName: any;
  kitAddType: any;
  setKitAddType: any;
  fullfilmentData: any;
  setFullfilmentData: any;
  demandSkuData: any;
  setDemandSkuData: any;
  demandFinancialData: any;
  setDemandFinancialData: any;
  supplyMasterTableData: any;
  setSupplyMasterTableData: any;
  supplyMasterActualsData: any;
  setsupplyMasterActualsData: any;
  purchaseOrderData: any;
  setPurchaseOrderData: any;
  sopVersions: any;
  setSopVersions: any;
  currentSopVersions: any;
  setCurrentSopVersions: any;
};
export const PortfolioContext = createContext<Portfolio>({
  skuTableData: false,
  setSkuTableData: () => {},
  masterTableData: false,
  setMasterTableData: () => {},
  kitBomTableData: false,
  setKitBomTableData: () => {},
  kitBomName: false,
  setKitBomName: () => {},
  kitAddType: false,
  setKitAddType: () => {},
  fullfilmentData: false,
  setFullfilmentData: () => {},
  demandSkuData: false,
  setDemandSkuData: () => {},
  demandFinancialData: false,
  setDemandFinancialData: () => {},
  supplyMasterTableData: false,
  setSupplyMasterTableData: () => {},
  supplyMasterActualsData: false,
  setsupplyMasterActualsData: () => {},
  purchaseOrderData: false,
  setPurchaseOrderData: () => {},
  sopVersions: false,
  setSopVersions: () => {},
  currentSopVersions: false,
  setCurrentSopVersions: () => {},
});
