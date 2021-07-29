import React, { FC } from "react";
import Page from "./../../common/layouts/Page";

const ExecutiveSummary: FC = (props) => {
  return (
    <Page
      logout={() => {
        //  @ts-ignore
        props.logout();
      }}
    >
      <h1>Welcome to Capabl</h1>
    </Page>
  );
};

export default ExecutiveSummary;
