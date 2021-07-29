import React from "react";

export default (props: any) => {
  return <>{props?.value?.split("T")[0]}</>;
};
