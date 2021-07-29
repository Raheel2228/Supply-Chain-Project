import axios from "axios";
import { getClientId } from "./util";
let url = "https://api-dev.capabl.co/";

export const getSKUTable = (userId: number) => {
  return axios.get(url + "skuMaster/" + userId);
};
export const getMasterTable = (userId: number) => {
  return axios.get(url + "skuMaster/getkits/" + userId);
};
export const postSku = (formData: any) => {
  return axios.post(url + "skuUpload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const addKit = (data: any) => {
  return axios.post(url + "kitBom", data);
};
export const updateKit = (data: any) => {
  return axios.post(url + "kitBom/" + data.kitId, data.data);
};

export const saveSkuMaster = (data: any) => {
  return axios.post(url + "skuMaster/bulkSave/" + getClientId(), data);
};
