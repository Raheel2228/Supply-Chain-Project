import axios from "axios";
import { getClientId } from "./util";
let url = "https://api-dev.capabl.co/";

export const getSOPVersions = (userId: number) => {
  return axios.get(url + "sopVersions/" + userId);
};

export const createVersion = (data: any) => {
  return axios.post(url + "sopVersions/" + getClientId(), data);
};
