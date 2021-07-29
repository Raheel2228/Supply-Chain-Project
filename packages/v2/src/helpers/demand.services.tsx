import axios from "axios";
import { getClientId } from "./util";
let url = "https://api-dev.capabl.co/";

export const getFullfilmentMatrix = (userId: number) => {
  return axios.get(
    url + "demandFulfillmentMatrix/" + userId + "/" + localStorage.getItem("SOPID")
  );
};

export const saveFullfilmentMatrix = (data: any) => {
  return axios.post(
    url +
      "demandFulfillmentMatrix/bulksave/" +
      getClientId() +
      "/" +
      localStorage.getItem("SOPID"),
    data
  );
};
export const saveFinancialEstimation = (data: any) => {
  return axios.post(
    url +
      "demandFinancialEstimations/bulksave/" +
      getClientId() +
      "/" +
      localStorage.getItem("SOPID"),
    data
  );
};
export const saveDemandSku = (data: any) => {
  return axios.post(
    url +
      "demandSkuMaster/bulksave/" +
      getClientId() +
      "/" +
      localStorage.getItem("SOPID"),
    data
  );
};

export const getDemandSku = (userId: number) => {
  return axios.get(
    url + "demandSkuMaster/" + userId + "/" + localStorage.getItem("SOPID")
  );
};
export const getDemandVersions = (userId: number) => {
  return axios.get(
    url + "demandVersions/" + userId + "/" + localStorage.getItem("SOPID")
  );
};

export const getDemandFinancial = (userId: number) => {
  return axios.get(
    url +
      "demandFinancialEstimations/" +
      userId +
      "/" +
      localStorage.getItem("SOPID")
  );
};

export const publishDemand = (cid: any, sid: any, vid: any) => {
  return axios.post(url + "demandVersions/publish/" + cid + "/" + sid + "/" + vid);
};
