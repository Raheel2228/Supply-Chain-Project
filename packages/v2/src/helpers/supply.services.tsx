import axios from "axios";
import { getClientId } from "./util";
let url = "https://api-dev.capabl.co/";

export const getFinancialOutlook = (userId: number) => {
  return axios.get(
    url + "financialOutlook/" + userId + "/" + localStorage.getItem("SOPID")
  );
};
export const getSupplyVersions = (userId: number) => {
  return axios.get(
    url + "supplyVersions/" + userId + "/" + localStorage.getItem("SOPID")
  );
};

export const getSupplyMasterSku = (userId: number) => {
  return axios.get(
    url + "skuSupplyMaster/" + userId + "/" + localStorage.getItem("SOPID")
  );
};
export const getPurchaseOrders = (userId: number) => {
  return axios.get(
    url + "purchaseOrders/" + userId + "/" + localStorage.getItem("SOPID")
  );
};

export const saveSupplyMaster = (data: any) => {
  return axios.post(
    url +
      "supplyMaster/bulksave/" +
      getClientId() +
      "/" +
      localStorage.getItem("SOPID"),
    data
  );
};
export const savePO = (data: any) => {
  return axios.post(
    url + "purchaseOrders/" + getClientId() + "/" + localStorage.getItem("SOPID"),
    data
  );
};
export const saveSupplyMasterSku = (data: any) => {
  return axios.post(
    url +
      "skuSupplyMaster/bulksave/" +
      getClientId() +
      "/" +
      localStorage.getItem("SOPID"),
    data
  );
};

export const getSupplyMaster = (userId: number) => {
  return axios.get(
    url + "supplyMaster/" + userId + "/" + localStorage.getItem("SOPID")
  );
};

export const getActualOh = (userId: number) => {
  return axios.get(url + "ohActuals/" + userId);
};

export const saveActualOh = (data: any) => {
  return axios.post(url + "ohActuals/" + getClientId(), data);
};

export const publishSupply = (cid: any, sid: any, vid: any) => {
  return axios.post(url + "supplyVersions/publish/" + cid + "/" + sid + "/" + vid);
};
export const recal = (cid: any, sid: any, vid: any) => {
  return axios.get(url + "recalc/" + cid + "/" + sid + "/" + vid);
};
