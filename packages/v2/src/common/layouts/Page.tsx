import React, { FC } from "react";
import Dashboard from "./Dashboard";
import { PageHeader, PageWrapper } from "./styles";

interface Props {
  header?: React.ReactNode;
  children: React.ReactNode;
  logout?: any;
}

const Page: FC<Props> = ({ header, children, logout }) => {
  return (
    <Dashboard
      logout={() => {
        logout();
      }}
    >
      <PageWrapper>
        <PageHeader>{header}</PageHeader>
        {children}
      </PageWrapper>
    </Dashboard>
  );
};

export default Page;
