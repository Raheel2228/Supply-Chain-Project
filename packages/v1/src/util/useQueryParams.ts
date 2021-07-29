import { useLocation } from "react-router";

export default function useQueryParams() {
  const params = new URLSearchParams(useLocation().search);
  // TODO figure out way to return object of all params
  // const paramsObj = {};
  // for (const pair of params.entries()) {
  //   const [k, v] = pair;
  //   paramsObj[k as string] = v;
  // }
  // console.log(paramsObj);
  // return paramsObj;
  return {
    clientId: params.get("clientId"),
    userId: params.get("userId"),
    showSchedule: params.get("showSchedule"),
  };
}
