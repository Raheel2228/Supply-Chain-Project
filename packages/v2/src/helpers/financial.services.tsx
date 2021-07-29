import axios from "axios";
import { getClientId } from "./util";
let url = "https://api-dev.capabl.co/";

export const getFinancials = (userId: number) => {
  return axios.get(
    url + "financialVersions/" + userId + "/" + localStorage.getItem("SOPID")
  );
};
export const postFinancials = (formData: any) => {
  return axios.post(url + "actualsupload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const postGoals = (formData: any) => {
  return axios.post(url + "goalsupload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const saveFinancialCells = (data: any) => {
  return axios.post(url + "bulksave", data);
};
export const publishFinancial = (cid: any, sid: any, vid: any) => {
  return axios.post(
    url + "financialVersions/publish/" + cid + "/" + sid + "/" + vid
  );
};
