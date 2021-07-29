import React, { FC, useState } from "react";
import "antd/dist/antd.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useRouteMatch,
  Redirect,
} from "react-router-dom";
import GlobalStyles from "./styles";
import "./App.css";
import PortfolioPlanning from "./pages/portfolio-planning";
import FinancialPlanning from "./pages/financial-planning";
import ExecutiveSummary from "./pages/executive-summary";
import DemandPlanning from "./pages/demand-planning";
import SupplyPlanning from "./pages/supply-planning";
import ProductionPlanning from "./pages/supply-planning";
import AdditionalAnalysis from "./pages/additional-analysis";
import { FinancialContext } from "./contexts/FinancialContext";
import { PortfolioContext } from "./contexts/PortfolioContext";
const App: FC = (props) => {
  const { path } = useRouteMatch();
  const [financialTableData, setFinancialTableData] = useState(false);
  const [skuTableData, setSkuTableData] = useState(false);
  const [masterTableData, setMasterTableData] = useState(false);
  const [kitAddType, setKitAddType] = useState(false);

  const [kitBomName, setKitBomName] = useState(null);
  const [financialAllVersion, setFinancialAllVersion] = useState(null);
  const [kitBomTableData, setKitBomTableData] = useState([]);
  const [fullfilmentData, setFullfilmentData] = useState(false);

  const [demandSkuData, setDemandSkuData] = useState(false);
  const [demandFinancialData, setDemandFinancialData] = useState(false);
  const [supplyMasterTableData, setSupplyMasterTableData] = useState(false);
  const [financialCurrentVersion, setFinancialCurrentVersion] = useState(null);
  const [supplyMasterActualsData, setsupplyMasterActualsData] = useState(false);
  const [purchaseOrderData, setPurchaseOrderData] = useState(false);
  const [sopVersions, setSopVersions] = useState(false);
  const [currentSopVersions, setCurrentSopVersions] = useState(null);

  return (
    <GlobalStyles>
      <Router>
        <Switch>
          <PortfolioContext.Provider
            value={{
              skuTableData,
              setSkuTableData,
              masterTableData,
              setMasterTableData,
              kitBomTableData,
              setKitBomTableData,
              kitBomName,
              setKitBomName,
              kitAddType,
              setKitAddType,
              fullfilmentData,
              setFullfilmentData,
              demandSkuData,
              setDemandSkuData,
              demandFinancialData,
              setDemandFinancialData,
              supplyMasterTableData,
              setSupplyMasterTableData,
              supplyMasterActualsData,
              setsupplyMasterActualsData,
              purchaseOrderData,
              setPurchaseOrderData,
              sopVersions,
              setSopVersions,
              currentSopVersions,
              setCurrentSopVersions,
            }}
          >
            {!sopVersions && <Redirect to={`${path}/`} />}
            {sopVersions && (
              <>
                {" "}
                <Route path={`${path}/portfolio-planning`} exact={true}>
                  <PortfolioPlanning
                    //  @ts-ignore
                    logout={() => {
                      //  @ts-ignore
                      props.logout();
                    }}
                  />
                </Route>
                <FinancialContext.Provider
                  value={{
                    financialTableData,
                    setFinancialTableData,
                    financialAllVersion,
                    setFinancialAllVersion,
                    financialCurrentVersion,
                    setFinancialCurrentVersion,
                  }}
                >
                  <Route path={`${path}/financial-planning`} exact={true}>
                    <FinancialPlanning
                      //  @ts-ignore
                      logout={() => {
                        //  @ts-ignore
                        props.logout();
                      }}
                    />
                  </Route>
                </FinancialContext.Provider>
                <Route path={`${path}/demand-planning`} exact={true}>
                  <DemandPlanning
                    //  @ts-ignore
                    logout={() => {
                      //  @ts-ignore
                      props.logout();
                    }}
                  />
                </Route>
                <Route path={`${path}/supply-planning`} exact={true}>
                  <SupplyPlanning
                    //  @ts-ignore
                    logout={() => {
                      //  @ts-ignore
                      props.logout();
                    }}
                  />
                </Route>
                <Route path={`${path}/production-planning`} exact={true}>
                  <ProductionPlanning
                    //  @ts-ignore
                    logout={() => {
                      //  @ts-ignore
                      props.logout();
                    }}
                  />
                </Route>
                <Route path={`${path}/additional-analysis`} exact={true}>
                  <AdditionalAnalysis
                    //  @ts-ignore
                    logout={() => {
                      //  @ts-ignore
                      props.logout();
                    }}
                  />
                </Route>
              </>
            )}
            <Route path={`${path}/`} exact={true}>
              <ExecutiveSummary
                //  @ts-ignore
                logout={() => {
                  //  @ts-ignore
                  props.logout();
                }}
              />
            </Route>
          </PortfolioContext.Provider>
        </Switch>
      </Router>
    </GlobalStyles>
  );
};

export default App;
