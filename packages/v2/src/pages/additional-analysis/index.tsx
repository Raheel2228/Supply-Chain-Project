import React, { FC } from "react";
import Page from "./../../common/layouts/Page";

const AdditionalAnalysis: FC = (props) => {
  return (
    <Page
      logout={() => {
        //  @ts-ignore
        props.logout();
      }}
    >
      Not Available Yet
    </Page>
  );
};

export default AdditionalAnalysis;
