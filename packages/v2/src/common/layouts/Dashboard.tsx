import React, { FC } from "react";
import Header from "../header";
import Navigation from "../Navigation";
import { ContentArea, MainWrapper } from "./styles";
interface Props {
  children: React.ReactNode;
  logout?: any;
}
const Dashboard: FC<Props> = ({ children, logout }) => {
  return (
    <MainWrapper>
      <Navigation />
      <ContentArea>
        <Header
          //  @ts-ignore
          logout={() => {
            logout();
          }}
        />
        {children}
      </ContentArea>
    </MainWrapper>
  );
};

export default Dashboard;
