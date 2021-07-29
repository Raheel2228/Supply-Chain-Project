import React, { FC, useState, useEffect, useContext, useRef } from "react";
import { Select, Modal, Form, Spin, Menu, Dropdown, Upload, message } from "antd";
import _ from "lodash";
import Page from "./../../common/layouts/Page";
import { ActionItems, FilterBar, HeaderWrapper, PageTitle, TopBar } from "./styles";
import { FinancialContext } from "../../contexts/FinancialContext";
import { PortfolioContext } from "../../contexts/PortfolioContext";
import Button from "../../components/buttons";
import Table from "./components/table";
import {
  SaveOutlined,
  VerticalAlignTopOutlined,
  DownloadOutlined,
  NumberOutlined,
  BarChartOutlined,
  UploadOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import { palette } from "../../assets/theme/palette";
import {
  getFinancials,
  postFinancials,
  postGoals,
  saveFinancialCells,
  publishFinancial,
} from "../../helpers/financial.services";

import { getClientId, searchSOP } from "../../helpers/util";
import { getDemandVersions } from "../../helpers/demand.services";
const antIcon = <LoadingOutlined style={{ fontSize: 30 }} spin />;
var months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const menu = (
  <Menu>
    <Menu.Item>
      <a
        // target="_blank"
        // rel="noopener noreferrer"
        href={`https://api-dev.capabl.co/actualsexport/cashflow/${getClientId()}`}
      >
        Cash Flow
      </a>
    </Menu.Item>
    <Menu.Item>
      <a
        // target="_blank"
        // rel="noopener noreferrer"
        href={`https://api-dev.capabl.co/actualsexport/balancesheet/${getClientId()}`}
      >
        Balance Sheet
      </a>
    </Menu.Item>
    <Menu.Item>
      <a
        // target="_blank"
        // rel="noopener noreferrer"
        href={`https://api-dev.capabl.co/actualsexport/profitloss/${getClientId()}`}
      >
        Profit & Loss
      </a>
    </Menu.Item>
  </Menu>
);
var date = new Date();
const { Option } = Select;
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};
let dataCashFlow: any;
let dataBalanceSheet: any;
let dataProfitLoss: any;
let editedCells: any = [];
const FinancialPlanning: FC = (props) => {
  const {
    financialTableData,
    setFinancialTableData,
    financialAllVersion,
    setFinancialAllVersion,
    financialCurrentVersion,
    setFinancialCurrentVersion,
  } = useContext(FinancialContext);
  const {
    setDemandSkuData,
    sopVersions,
    setSopVersions,
    currentSopVersions,
    setCurrentSopVersions,
  } = useContext(PortfolioContext);
  const [tableView, setTableView] = useState("Balance Sheet");
  const [uploadType, setUploadType] = useState("");
  const [form] = Form.useForm();
  const [currentFinancial, setCurrentFinancial] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [spinner, setSpinner] = useState(false);

  const onFinish = (values: any) => {
    setFinancialTableData(false);
    handleCancel();
    let formData = new FormData();
    formData.append("cashflow", values.cashflow.file.originFileObj);
    formData.append("balancesheet", values.balancesheet.file.originFileObj);
    formData.append("profitloss", values.profitloss.file.originFileObj);
    formData.append("clientId", "2");
    if (uploadType == "Goals") {
      postGoals(formData).then((res) => {
        let financialVersions: any = [];
        let financials = res.data.actuals.map((myData: any) => {
          dataCashFlow = [];
          dataBalanceSheet = [];
          dataProfitLoss = [];
          let profitlossCategoriesIdArray = _.keyBy(
            myData.ProfitLossCategories,
            "id"
          );

          let profitlossItemIdArray = _.keyBy(myData.ProfitLoss, "profitlossItemId");
          myData.ProfitLossCategories.forEach((category: any) => {
            let objectToPush: any = {};
            months.forEach((month) => {
              objectToPush[month + " - " + date.getFullYear()] = {
                value: "",
                id: "",
              };
            });
            category.ProfitLossItems.forEach((profitlossItem: any, index: any) => {
              objectToPush[profitlossItemIdArray[`${profitlossItem.id}`]?.value] = {
                value: profitlossItem.itemValue,
                id: profitlossItem.id,
              };
              if (category.ProfitLossItems.length - 1 == index) {
                var digits = category.categoryOrder.toString().split("");
                var categoryOrders = digits.map((number: any) => number);
                if (categoryOrders[0] === "3") {
                  dataProfitLoss.push({
                    ...{
                      categoryId: category.parentCategory,
                      categoryGroup:
                        profitlossCategoriesIdArray[
                          `${
                            category.parentCategory
                              ? category.parentCategory
                              : category.id
                          }`
                        ]?.categoryName,
                      thirdCategoryGroup:
                        categoryOrders[0] === "3" &&
                        category.categoryOrder.toString().substring(1)
                          ? profitlossCategoriesIdArray[
                              `${category.categoryOrder.toString().substring(1)}`
                            ]?.categoryName
                          : null,
                      catId: category.id,
                      itemId: profitlossItem.id,
                      entity: "ProfitLoss",
                      catName: category.categoryName,
                      cashId: profitlossItem.id,
                    },
                    ...objectToPush,
                  });
                } else if (categoryOrders[0] === "1" && categoryOrders[1] === "0") {
                  dataProfitLoss.push({
                    ...{
                      categoryId: category.id,
                      entity: "ProfitLoss",
                      // categoryGroup:
                      //   profitlossCategoriesIdArray[`${category.id}`]?.categoryName,
                      catId: category.id,
                      catName: category.categoryName,
                      cashId: profitlossItem.id,
                    },
                    ...objectToPush,
                  });
                } else if (categoryOrders[0] === "2" && categoryOrders[1] === "0") {
                  dataProfitLoss.push({
                    ...{
                      categoryId: category.id,
                      entity: "ProfitLoss",
                      thirdCategoryGroup:
                        profitlossCategoriesIdArray[
                          `${
                            category.parentCategory
                              ? category.parentCategory
                              : category.id
                          }`
                        ]?.categoryName,
                      // categoryGroup:
                      //   profitlossCategoriesIdArray[`${category.id}`]?.categoryName,
                      catId: category.id,
                      catName: category.categoryName,
                      cashId: profitlossItem.id,
                    },
                    ...objectToPush,
                  });
                }
              }
            });
          });
          let balancesheetCategoriesIdArray = _.keyBy(
            myData.BalancesheetCategories,
            "id"
          );
          let balancesheetCategoriesIdArray1 = _.groupBy(
            myData.BalancesheetCategories,
            "parentCategory"
          );
          let balancesheetCategoriesIdArray2 = _.groupBy(
            myData.BalancesheetCategories,
            "categoryOrder"
          );

          let balancesheetItemIdArray = _.keyBy(
            myData.Balancesheet,
            "balancesheetItemId"
          );
          myData.BalancesheetCategories.forEach((category: any) => {
            let objectToPush: any = {};
            months.forEach((month) => {
              objectToPush[month + " - " + date.getFullYear()] = {
                value: "",
                id: "",
              };
            });
            category.BalancesheetItems.forEach(
              (balancesheetItem: any, index: any) => {
                objectToPush[
                  balancesheetItemIdArray[`${balancesheetItem.id}`]?.value
                ] = {
                  value: balancesheetItem.itemValue,
                  id: balancesheetItem.id,
                };

                if (category.BalancesheetItems.length - 1 == index) {
                  var digits = category.categoryOrder.toString().split("");
                  var categoryOrders = digits.map((number: any) => number);

                  if (categoryOrders[0] === "3") {
                    dataBalanceSheet.push({
                      ...{
                        categoryId: category.parentCategory,
                        categoryGroup:
                          balancesheetCategoriesIdArray[
                            `${
                              category.parentCategory
                                ? category.parentCategory
                                : category.id
                            }`
                          ]?.categoryName,
                        thirdCategoryGroup:
                          categoryOrders[0] === "3" &&
                          category.categoryOrder.toString().substring(1)
                            ? balancesheetCategoriesIdArray[
                                `${category.categoryOrder.toString().substring(1)}`
                              ]?.categoryName
                            : null,
                        catId: category.id,
                        itemId: balancesheetItem.id,
                        entity: "Balancesheet",
                        catName: category.categoryName,
                        cashId: balancesheetItem.id,
                      },
                      ...objectToPush,
                    });
                  } else if (
                    categoryOrders[0] === "1" &&
                    categoryOrders[1] === "0"
                  ) {
                    dataBalanceSheet.push({
                      ...{
                        categoryId: category.id,
                        entity: "Balancesheet",
                        // categoryGroup:
                        //   balancesheetCategoriesIdArray[`${category.id}`]?.categoryName,
                        catId: category.id,
                        catName: category.categoryName,
                        cashId: balancesheetItem.id,
                      },
                      ...objectToPush,
                    });
                  } else if (
                    categoryOrders[0] === "2" &&
                    categoryOrders[1] === "0"
                  ) {
                    dataBalanceSheet.push({
                      ...{
                        categoryId: category.id,
                        entity: "Balancesheet",
                        thirdCategoryGroup:
                          balancesheetCategoriesIdArray[
                            `${
                              category.parentCategory
                                ? category.parentCategory
                                : category.id
                            }`
                          ]?.categoryName,
                        // categoryGroup:
                        //   balancesheetCategoriesIdArray[`${category.id}`]?.categoryName,
                        catId: category.id,
                        catName: category.categoryName,
                        cashId: balancesheetItem.id,
                      },
                      ...objectToPush,
                    });
                  }
                }
              }
            );
          });
          let cashflowCategoriesIdArray = _.keyBy(myData.CashflowCategories, "id");
          let cashflowItemIdArray = _.keyBy(myData.Cashflows, "cashflowItemId");
          myData.CashflowCategories.forEach((category: any) => {
            let objectToPush: any = {};
            months.forEach((month) => {
              objectToPush[month + " - " + date.getFullYear()] = {
                value: "",
                id: "",
              };
            });

            category.CashflowItems.forEach((cashFlowItem: any, index: any) => {
              objectToPush[cashflowItemIdArray[`${cashFlowItem.id}`]?.value] = {
                value: cashFlowItem.itemValue,
                id: cashFlowItem.id,
              };

              if (category.CashflowItems.length - 1 == index) {
                var digits = category.categoryOrder.toString().split("");
                var categoryOrders = digits.map((number: any) => number);
                if (categoryOrders[0] === "3") {
                  dataCashFlow.push({
                    ...{
                      categoryId: category.parentCategory,
                      categoryGroup:
                        cashflowCategoriesIdArray[
                          `${
                            category.parentCategory
                              ? category.parentCategory
                              : category.id
                          }`
                        ]?.categoryName,
                      thirdCategoryGroup:
                        categoryOrders[0] === "3" &&
                        category.categoryOrder.toString().substring(1)
                          ? cashflowCategoriesIdArray[
                              `${category.categoryOrder.toString().substring(1)}`
                            ]?.categoryName
                          : null,
                      catId: category.id,
                      entity: "Cashflow",
                      itemId: cashFlowItem.id,
                      catName: category.categoryName,
                      cashId: cashFlowItem.id,
                    },
                    ...objectToPush,
                  });
                } else if (categoryOrders[0] === "1" && categoryOrders[1] === "0") {
                  dataCashFlow.push({
                    ...{
                      categoryId: category.id,
                      entity: "Cashflow",
                      // categoryGroup:
                      //   profitlossCategoriesIdArray[`${category.id}`]?.categoryName,
                      catId: category.id,
                      catName: category.categoryName,
                      cashId: cashFlowItem.id,
                    },
                    ...objectToPush,
                  });
                } else if (categoryOrders[0] === "2" && categoryOrders[1] === "0") {
                  dataCashFlow.push({
                    ...{
                      categoryId: category.id,
                      entity: "Cashflow",
                      thirdCategoryGroup:
                        cashflowCategoriesIdArray[
                          `${
                            category.parentCategory
                              ? category.parentCategory
                              : category.id
                          }`
                        ]?.categoryName,
                      // categoryGroup:
                      //   profitlossCategoriesIdArray[`${category.id}`]?.categoryName,
                      catId: category.id,
                      catName: category.categoryName,
                      cashId: cashFlowItem.id,
                    },
                    ...objectToPush,
                  });
                }
              }
            });
          });
          if (
            !financialVersions.includes(myData.versionName.split("-")[1]?.trim()) &&
            myData.versionName !== "Actuals"
          ) {
            financialVersions.push(myData.versionName.split("-")[1]?.trim());
          }
          return {
            id: myData.id,
            clientId: myData.clientId,
            sopVersionId: myData.sopVersionId,
            versionName: myData.versionName,
            dataCashFlow,
            dataBalanceSheet,
            dataProfitLoss,
          };
        });
        getDemandVersions(getClientId()).then((res: any) => {
          let versions: any = [];

          res.data.demandVersions.forEach((demand: any) => {
            let skus = demand.skuMaster.map((demandSkuItem: any) => {
              let demandArray = _.keyBy(demandSkuItem.demandSkus, "value");
              delete demandSkuItem.sku.id;

              let skutoreturn = {
                ...demandSkuItem,
                ...demandSkuItem.sku,
                ...demandArray,
              };

              return skutoreturn;
            });
            let fullFillArray: any = [];
            demand.fulfillmentMatrix.forEach((fillItem: any) => {
              let fullfilObj: any = {};
              fullfilObj["channelName"] = fillItem.channelName;
              fillItem.centers.forEach((centerItem: any) => {
                fullfilObj[centerItem.centerName] = centerItem;
              });
              fullFillArray.push(fullfilObj);
            });
            let dtc: any = [];
            let amazon: any = [];
            let retail: any = [];
            // categoryGroup
            let dateKey;
            let abc;
            demand.financialEstimations[0].revenueForecast.forEach((item: any) => {
              abc = Object.keys(item);
              abc.forEach((keys: any) => {
                if (keys.includes("-")) {
                  dateKey = keys;
                  dtc.push({ [dateKey]: item[keys].DTC });
                  amazon.push({ [dateKey]: item[keys].Amazon });
                  retail.push({ [dateKey]: item[keys].Retail });
                }
              });
            });

            let fullFillArray1: any = [
              {
                name: "Marketing Spend Goal",
                data: demand.financialEstimations[0].marketingSpendGoal,
              },
              {
                name: "Marketing Spend Forecast",
                data: demand.financialEstimations[0].marketingSpendForecast,
              },
              {
                name: "Revenue Goal",
                data: demand.financialEstimations[0].revenueGoal,
              },
              {
                name: "Amazon",
                categoryGroup: "Revenue Forecast",
                data: amazon,
              },
              {
                name: "DTC",
                categoryGroup: "Revenue Forecast",
                data: dtc,
              },
              {
                name: "Retail",
                categoryGroup: "Revenue Forecast",
                data: retail,
              },
            ];
            versions.push({
              financialEstimation: fullFillArray1,
              fullfilmentMatrix: fullFillArray,
              demandSkuMaster: skus,
              versionName: demand.versionName,
              versionId: demand.versionId,
            });
          });
          setDemandSkuData(versions);
          editedCells = [];
          setSpinner(false);
        });
        setFinancialAllVersion(financialVersions);
        setFinancialCurrentVersion(financialVersions[financialVersions.length - 1]);
        setFinancialTableData(financials);
      });
    } else if (uploadType == "Actuals") {
      postFinancials(formData).then((res) => {
        let financialVersions: any = [];
        let financials = res.data.actuals.map((myData: any) => {
          dataCashFlow = [];
          dataBalanceSheet = [];
          dataProfitLoss = [];
          let profitlossCategoriesIdArray = _.keyBy(
            myData.ProfitLossCategories,
            "id"
          );

          let profitlossItemIdArray = _.keyBy(myData.ProfitLoss, "profitlossItemId");
          myData.ProfitLossCategories.forEach((category: any) => {
            let objectToPush: any = {};
            months.forEach((month) => {
              objectToPush[month + " - " + date.getFullYear()] = {
                value: "",
                id: "",
              };
            });
            category.ProfitLossItems.forEach((profitlossItem: any, index: any) => {
              objectToPush[profitlossItemIdArray[`${profitlossItem.id}`]?.value] = {
                value: profitlossItem.itemValue,
                id: profitlossItem.id,
              };
              if (category.ProfitLossItems.length - 1 == index) {
                var digits = category.categoryOrder.toString().split("");
                var categoryOrders = digits.map((number: any) => number);
                if (categoryOrders[0] === "3") {
                  dataProfitLoss.push({
                    ...{
                      categoryId: category.parentCategory,
                      categoryGroup:
                        profitlossCategoriesIdArray[
                          `${
                            category.parentCategory
                              ? category.parentCategory
                              : category.id
                          }`
                        ]?.categoryName,
                      thirdCategoryGroup:
                        categoryOrders[0] === "3" &&
                        category.categoryOrder.toString().substring(1)
                          ? profitlossCategoriesIdArray[
                              `${category.categoryOrder.toString().substring(1)}`
                            ]?.categoryName
                          : null,
                      catId: category.id,
                      itemId: profitlossItem.id,
                      entity: "ProfitLoss",
                      catName: category.categoryName,
                      cashId: profitlossItem.id,
                    },
                    ...objectToPush,
                  });
                } else if (categoryOrders[0] === "1" && categoryOrders[1] === "0") {
                  dataProfitLoss.push({
                    ...{
                      categoryId: category.id,
                      entity: "ProfitLoss",
                      // categoryGroup:
                      //   profitlossCategoriesIdArray[`${category.id}`]?.categoryName,
                      catId: category.id,
                      catName: category.categoryName,
                      cashId: profitlossItem.id,
                    },
                    ...objectToPush,
                  });
                } else if (categoryOrders[0] === "2" && categoryOrders[1] === "0") {
                  dataProfitLoss.push({
                    ...{
                      categoryId: category.id,
                      entity: "ProfitLoss",
                      thirdCategoryGroup:
                        profitlossCategoriesIdArray[
                          `${
                            category.parentCategory
                              ? category.parentCategory
                              : category.id
                          }`
                        ]?.categoryName,
                      // categoryGroup:
                      //   profitlossCategoriesIdArray[`${category.id}`]?.categoryName,
                      catId: category.id,
                      catName: category.categoryName,
                      cashId: profitlossItem.id,
                    },
                    ...objectToPush,
                  });
                }
              }
            });
          });
          let balancesheetCategoriesIdArray = _.keyBy(
            myData.BalancesheetCategories,
            "id"
          );
          let balancesheetCategoriesIdArray1 = _.groupBy(
            myData.BalancesheetCategories,
            "parentCategory"
          );
          let balancesheetCategoriesIdArray2 = _.groupBy(
            myData.BalancesheetCategories,
            "categoryOrder"
          );

          let balancesheetItemIdArray = _.keyBy(
            myData.Balancesheet,
            "balancesheetItemId"
          );
          myData.BalancesheetCategories.forEach((category: any) => {
            let objectToPush: any = {};
            months.forEach((month) => {
              objectToPush[month + " - " + date.getFullYear()] = {
                value: "",
                id: "",
              };
            });
            category.BalancesheetItems.forEach(
              (balancesheetItem: any, index: any) => {
                objectToPush[
                  balancesheetItemIdArray[`${balancesheetItem.id}`]?.value
                ] = {
                  value: balancesheetItem.itemValue,
                  id: balancesheetItem.id,
                };

                if (category.BalancesheetItems.length - 1 == index) {
                  var digits = category.categoryOrder.toString().split("");
                  var categoryOrders = digits.map((number: any) => number);

                  if (categoryOrders[0] === "3") {
                    dataBalanceSheet.push({
                      ...{
                        categoryId: category.parentCategory,
                        categoryGroup:
                          balancesheetCategoriesIdArray[
                            `${
                              category.parentCategory
                                ? category.parentCategory
                                : category.id
                            }`
                          ]?.categoryName,
                        thirdCategoryGroup:
                          categoryOrders[0] === "3" &&
                          category.categoryOrder.toString().substring(1)
                            ? balancesheetCategoriesIdArray[
                                `${category.categoryOrder.toString().substring(1)}`
                              ]?.categoryName
                            : null,
                        catId: category.id,
                        itemId: balancesheetItem.id,
                        entity: "Balancesheet",
                        catName: category.categoryName,
                        cashId: balancesheetItem.id,
                      },
                      ...objectToPush,
                    });
                  } else if (
                    categoryOrders[0] === "1" &&
                    categoryOrders[1] === "0"
                  ) {
                    dataBalanceSheet.push({
                      ...{
                        categoryId: category.id,
                        entity: "Balancesheet",
                        // categoryGroup:
                        //   balancesheetCategoriesIdArray[`${category.id}`]?.categoryName,
                        catId: category.id,
                        catName: category.categoryName,
                        cashId: balancesheetItem.id,
                      },
                      ...objectToPush,
                    });
                  } else if (
                    categoryOrders[0] === "2" &&
                    categoryOrders[1] === "0"
                  ) {
                    dataBalanceSheet.push({
                      ...{
                        categoryId: category.id,
                        entity: "Balancesheet",
                        thirdCategoryGroup:
                          balancesheetCategoriesIdArray[
                            `${
                              category.parentCategory
                                ? category.parentCategory
                                : category.id
                            }`
                          ]?.categoryName,
                        // categoryGroup:
                        //   balancesheetCategoriesIdArray[`${category.id}`]?.categoryName,
                        catId: category.id,
                        catName: category.categoryName,
                        cashId: balancesheetItem.id,
                      },
                      ...objectToPush,
                    });
                  }
                }
              }
            );
          });
          let cashflowCategoriesIdArray = _.keyBy(myData.CashflowCategories, "id");
          let cashflowItemIdArray = _.keyBy(myData.Cashflows, "cashflowItemId");
          myData.CashflowCategories.forEach((category: any) => {
            let objectToPush: any = {};
            months.forEach((month) => {
              objectToPush[month + " - " + date.getFullYear()] = {
                value: "",
                id: "",
              };
            });

            category.CashflowItems.forEach((cashFlowItem: any, index: any) => {
              objectToPush[cashflowItemIdArray[`${cashFlowItem.id}`]?.value] = {
                value: cashFlowItem.itemValue,
                id: cashFlowItem.id,
              };

              if (category.CashflowItems.length - 1 == index) {
                var digits = category.categoryOrder.toString().split("");
                var categoryOrders = digits.map((number: any) => number);
                if (categoryOrders[0] === "3") {
                  dataCashFlow.push({
                    ...{
                      categoryId: category.parentCategory,
                      categoryGroup:
                        cashflowCategoriesIdArray[
                          `${
                            category.parentCategory
                              ? category.parentCategory
                              : category.id
                          }`
                        ]?.categoryName,
                      thirdCategoryGroup:
                        categoryOrders[0] === "3" &&
                        category.categoryOrder.toString().substring(1)
                          ? cashflowCategoriesIdArray[
                              `${category.categoryOrder.toString().substring(1)}`
                            ]?.categoryName
                          : null,
                      catId: category.id,
                      entity: "Cashflow",
                      itemId: cashFlowItem.id,
                      catName: category.categoryName,
                      cashId: cashFlowItem.id,
                    },
                    ...objectToPush,
                  });
                } else if (categoryOrders[0] === "1" && categoryOrders[1] === "0") {
                  dataCashFlow.push({
                    ...{
                      categoryId: category.id,
                      entity: "Cashflow",
                      // categoryGroup:
                      //   profitlossCategoriesIdArray[`${category.id}`]?.categoryName,
                      catId: category.id,
                      catName: category.categoryName,
                      cashId: cashFlowItem.id,
                    },
                    ...objectToPush,
                  });
                } else if (categoryOrders[0] === "2" && categoryOrders[1] === "0") {
                  dataCashFlow.push({
                    ...{
                      categoryId: category.id,
                      entity: "Cashflow",
                      thirdCategoryGroup:
                        cashflowCategoriesIdArray[
                          `${
                            category.parentCategory
                              ? category.parentCategory
                              : category.id
                          }`
                        ]?.categoryName,
                      // categoryGroup:
                      //   profitlossCategoriesIdArray[`${category.id}`]?.categoryName,
                      catId: category.id,
                      catName: category.categoryName,
                      cashId: cashFlowItem.id,
                    },
                    ...objectToPush,
                  });
                }
              }
            });
          });
          if (
            !financialVersions.includes(myData.versionName.split("-")[1]?.trim()) &&
            myData.versionName !== "Actuals"
          ) {
            financialVersions.push(myData.versionName.split("-")[1]?.trim());
          }
          return {
            id: myData.id,
            clientId: myData.clientId,
            sopVersionId: myData.sopVersionId,
            versionName: myData.versionName,
            dataCashFlow,
            dataBalanceSheet,
            dataProfitLoss,
          };
        });
        setFinancialAllVersion(financialVersions);
        setFinancialCurrentVersion(financialVersions[financialVersions.length - 1]);
        setFinancialTableData(financials);
      });
    }
  };

  const onFinishFailed = (errorInfo: any) => {};

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };
  const handleCellEdit = (cell: any) => {
    const index = editedCells.findIndex((e: any) => e.itemId === cell.itemId);

    if (index === -1) {
      editedCells.push(cell);
    } else {
      editedCells[index] = cell;
    }
  };
  const uploadprops = {
    beforeUpload: (file: any) => {
      if (
        file.type !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        message.error(`${file.name} is not a valid file`);
      }
      return file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ? true
        : Upload.LIST_IGNORE;
    },
    onChange: (info: any) => {},
  };

  useEffect(() => {
    if (!financialTableData) {
      dataCashFlow = [];
      dataBalanceSheet = [];
      dataProfitLoss = [];
      // let myData: any;
      getFinancials(getClientId()).then((res: any) => {
        // myData = data.financialVersions[0];
        let financialVersions: any = [];
        let financials = res.data.financialVersions.map((myData: any) => {
          dataCashFlow = [];
          dataBalanceSheet = [];
          dataProfitLoss = [];
          if (myData) {
            let profitlossCategoriesIdArray = _.keyBy(
              myData.ProfitLossCategories,
              "id"
            );

            let profitlossItemIdArray = _.keyBy(
              myData.ProfitLoss,
              "profitlossItemId"
            );
            myData.ProfitLossCategories.forEach((category: any) => {
              let objectToPush: any = {};
              months.forEach((month) => {
                objectToPush[month + " - " + date.getFullYear()] = {
                  value: "",
                  id: "",
                };
              });
              category.ProfitLossItems.forEach((profitlossItem: any, index: any) => {
                objectToPush[
                  profitlossItemIdArray[`${profitlossItem.id}`]?.value
                ] = {
                  value: profitlossItem.itemValue,
                  id: profitlossItem.id,
                };
                if (category.ProfitLossItems.length - 1 == index) {
                  var digits = category.categoryOrder.toString().split("");
                  var categoryOrders = digits.map((number: any) => number);
                  if (categoryOrders[0] === "3") {
                    dataProfitLoss.push({
                      ...{
                        categoryId: category.parentCategory,
                        categoryGroup:
                          profitlossCategoriesIdArray[
                            `${
                              category.parentCategory
                                ? category.parentCategory
                                : category.id
                            }`
                          ]?.categoryName,
                        thirdCategoryGroup:
                          categoryOrders[0] === "3" &&
                          category.categoryOrder.toString().substring(1)
                            ? profitlossCategoriesIdArray[
                                `${category.categoryOrder.toString().substring(1)}`
                              ]?.categoryName
                            : null,
                        catId: category.id,
                        itemId: profitlossItem.id,
                        entity: "ProfitLoss",
                        catName: category.categoryName,
                        cashId: profitlossItem.id,
                      },
                      ...objectToPush,
                    });
                  } else if (
                    categoryOrders[0] === "1" &&
                    categoryOrders[1] === "0"
                  ) {
                    dataProfitLoss.push({
                      ...{
                        categoryId: category.id,
                        entity: "ProfitLoss",
                        // categoryGroup:
                        //   profitlossCategoriesIdArray[`${category.id}`]?.categoryName,
                        catId: category.id,
                        catName: category.categoryName,
                        cashId: profitlossItem.id,
                      },
                      ...objectToPush,
                    });
                  } else if (
                    categoryOrders[0] === "2" &&
                    categoryOrders[1] === "0"
                  ) {
                    dataProfitLoss.push({
                      ...{
                        categoryId: category.id,
                        entity: "ProfitLoss",
                        thirdCategoryGroup:
                          profitlossCategoriesIdArray[
                            `${
                              category.parentCategory
                                ? category.parentCategory
                                : category.id
                            }`
                          ]?.categoryName,
                        // categoryGroup:
                        //   profitlossCategoriesIdArray[`${category.id}`]?.categoryName,
                        catId: category.id,
                        catName: category.categoryName,
                        cashId: profitlossItem.id,
                      },
                      ...objectToPush,
                    });
                  }
                }
              });
            });
            let balancesheetCategoriesIdArray = _.keyBy(
              myData.BalancesheetCategories,
              "id"
            );
            let balancesheetCategoriesIdArray1 = _.groupBy(
              myData.BalancesheetCategories,
              "parentCategory"
            );
            let balancesheetCategoriesIdArray2 = _.groupBy(
              myData.BalancesheetCategories,
              "categoryOrder"
            );
            let balancesheetItemIdArray = _.keyBy(
              myData.Balancesheet,
              "balancesheetItemId"
            );
            myData.BalancesheetCategories.forEach((category: any) => {
              let objectToPush: any = {};
              months.forEach((month) => {
                objectToPush[month + " - " + date.getFullYear()] = {
                  value: "",
                  id: "",
                };
              });
              category.BalancesheetItems.forEach(
                (balancesheetItem: any, index: any) => {
                  objectToPush[
                    balancesheetItemIdArray[`${balancesheetItem.id}`]?.value
                  ] = {
                    value: balancesheetItem.itemValue,
                    id: balancesheetItem.id,
                  };

                  if (category.BalancesheetItems.length - 1 == index) {
                    var digits = category.categoryOrder.toString().split("");
                    var categoryOrders = digits.map((number: any) => number);

                    if (categoryOrders[0] === "3") {
                      dataBalanceSheet.push({
                        ...{
                          categoryId: category.parentCategory,
                          categoryGroup:
                            balancesheetCategoriesIdArray[
                              `${
                                category.parentCategory
                                  ? category.parentCategory
                                  : category.id
                              }`
                            ]?.categoryName,
                          thirdCategoryGroup:
                            categoryOrders[0] === "3" &&
                            category.categoryOrder.toString().substring(1)
                              ? balancesheetCategoriesIdArray[
                                  `${category.categoryOrder.toString().substring(1)}`
                                ]?.categoryName
                              : null,
                          catId: category.id,
                          itemId: balancesheetItem.id,
                          entity: "Balancesheet",
                          catName: category.categoryName,
                          cashId: balancesheetItem.id,
                        },
                        ...objectToPush,
                      });
                    } else if (
                      categoryOrders[0] === "1" &&
                      categoryOrders[1] === "0"
                    ) {
                      dataBalanceSheet.push({
                        ...{
                          categoryId: category.id,
                          entity: "Balancesheet",
                          // categoryGroup:
                          //   balancesheetCategoriesIdArray[`${category.id}`]?.categoryName,
                          catId: category.id,
                          catName: category.categoryName,
                          cashId: balancesheetItem.id,
                        },
                        ...objectToPush,
                      });
                    } else if (
                      categoryOrders[0] === "2" &&
                      categoryOrders[1] === "0"
                    ) {
                      dataBalanceSheet.push({
                        ...{
                          categoryId: category.id,
                          entity: "Balancesheet",
                          thirdCategoryGroup:
                            balancesheetCategoriesIdArray[
                              `${
                                category.parentCategory
                                  ? category.parentCategory
                                  : category.id
                              }`
                            ]?.categoryName,
                          // categoryGroup:
                          //   balancesheetCategoriesIdArray[`${category.id}`]?.categoryName,
                          catId: category.id,
                          catName: category.categoryName,
                          cashId: balancesheetItem.id,
                        },
                        ...objectToPush,
                      });
                    }
                  }
                }
              );
            });
            let cashflowCategoriesIdArray = _.keyBy(myData.CashflowCategories, "id");
            let cashflowItemIdArray = _.keyBy(myData.Cashflows, "cashflowItemId");
            myData.CashflowCategories.forEach((category: any) => {
              let objectToPush: any = {};
              months.forEach((month) => {
                objectToPush[month + " - " + date.getFullYear()] = {
                  value: "",
                  id: "",
                };
              });

              category.CashflowItems.forEach((cashFlowItem: any, index: any) => {
                objectToPush[cashflowItemIdArray[`${cashFlowItem.id}`]?.value] = {
                  value: cashFlowItem.itemValue,
                  id: cashFlowItem.id,
                };

                if (category.CashflowItems.length - 1 == index) {
                  var digits = category.categoryOrder.toString().split("");
                  var categoryOrders = digits.map((number: any) => number);
                  if (categoryOrders[0] === "3") {
                    dataCashFlow.push({
                      ...{
                        categoryId: category.parentCategory,
                        categoryGroup:
                          cashflowCategoriesIdArray[
                            `${
                              category.parentCategory
                                ? category.parentCategory
                                : category.id
                            }`
                          ]?.categoryName,
                        thirdCategoryGroup:
                          categoryOrders[0] === "3" &&
                          category.categoryOrder.toString().substring(1)
                            ? cashflowCategoriesIdArray[
                                `${category.categoryOrder.toString().substring(1)}`
                              ]?.categoryName
                            : null,
                        catId: category.id,
                        entity: "Cashflow",
                        itemId: cashFlowItem.id,
                        catName: category.categoryName,
                        cashId: cashFlowItem.id,
                      },
                      ...objectToPush,
                    });
                  } else if (
                    categoryOrders[0] === "1" &&
                    categoryOrders[1] === "0"
                  ) {
                    dataCashFlow.push({
                      ...{
                        categoryId: category.id,
                        entity: "Cashflow",
                        // categoryGroup:
                        //   profitlossCategoriesIdArray[`${category.id}`]?.categoryName,
                        catId: category.id,
                        catName: category.categoryName,
                        cashId: cashFlowItem.id,
                      },
                      ...objectToPush,
                    });
                  } else if (
                    categoryOrders[0] === "2" &&
                    categoryOrders[1] === "0"
                  ) {
                    dataCashFlow.push({
                      ...{
                        categoryId: category.id,
                        entity: "Cashflow",
                        thirdCategoryGroup:
                          cashflowCategoriesIdArray[
                            `${
                              category.parentCategory
                                ? category.parentCategory
                                : category.id
                            }`
                          ]?.categoryName,
                        // categoryGroup:
                        //   profitlossCategoriesIdArray[`${category.id}`]?.categoryName,
                        catId: category.id,
                        catName: category.categoryName,
                        cashId: cashFlowItem.id,
                      },
                      ...objectToPush,
                    });
                  }
                }
              });
            });
            if (
              !financialVersions.includes(
                myData.versionName.split("-")[1]?.trim()
              ) &&
              myData.versionName !== "Actuals"
            ) {
              financialVersions.push(myData.versionName.split("-")[1]?.trim());
            }
            return {
              id: myData.id,
              clientId: myData.clientId,
              sopVersionId: myData.sopVersionId,
              versionName: myData.versionName,
              dataCashFlow,
              dataBalanceSheet,
              dataProfitLoss,
            };
          } else {
            return {};
          }
        });
        setFinancialAllVersion(financialVersions);
        setFinancialCurrentVersion(financialVersions[financialVersions.length - 1]);

        setFinancialTableData(financials);
      });
    }
  }, []);

  const Header = (
    <HeaderWrapper>
      <TopBar>
        <PageTitle>Financial Planning</PageTitle>
        <ActionItems>
          {!searchSOP(currentSopVersions, sopVersions)?.financialVersion && (
            <>
              <Button
                onClick={() => {
                  let datatosend = {
                    financialVersion: financialTableData.filter(
                      (item: any) =>
                        item.versionName.includes(financialCurrentVersion) ||
                        (item.versionName.includes("Actuals") &&
                          !item.versionName.includes("vs"))
                    )[currentFinancial]?.versionName,
                    data: editedCells,
                  };
                  if (editedCells.length) {
                    // setFinancialTableData(false);
                    setSpinner(true);
                    saveFinancialCells(datatosend).then((res) => {
                      getDemandVersions(getClientId()).then((res: any) => {
                        let versions: any = [];

                        res.data.demandVersions.forEach((demand: any) => {
                          let skus = demand.skuMaster.map((demandSkuItem: any) => {
                            let demandArray = _.keyBy(
                              demandSkuItem.demandSkus,
                              "value"
                            );
                            delete demandSkuItem.sku.id;

                            let skutoreturn = {
                              ...demandSkuItem,
                              ...demandSkuItem.sku,
                              ...demandArray,
                            };

                            return skutoreturn;
                          });
                          let fullFillArray: any = [];
                          demand.fulfillmentMatrix.forEach((fillItem: any) => {
                            let fullfilObj: any = {};
                            fullfilObj["channelName"] = fillItem.channelName;
                            fillItem.centers.forEach((centerItem: any) => {
                              fullfilObj[centerItem.centerName] = centerItem;
                            });
                            fullFillArray.push(fullfilObj);
                          });
                          let dtc: any = [];
                          let amazon: any = [];
                          let retail: any = [];
                          // categoryGroup
                          let dateKey;
                          let abc;
                          demand.financialEstimations[0].revenueForecast.forEach(
                            (item: any) => {
                              abc = Object.keys(item);
                              abc.forEach((keys: any) => {
                                if (keys.includes("-")) {
                                  dateKey = keys;
                                  dtc.push({ [dateKey]: item[keys].DTC });
                                  amazon.push({ [dateKey]: item[keys].Amazon });
                                  retail.push({ [dateKey]: item[keys].Retail });
                                }
                              });
                            }
                          );

                          let fullFillArray1: any = [
                            {
                              name: "Marketing Spend Goal",
                              data:
                                demand.financialEstimations[0].marketingSpendGoal,
                            },
                            {
                              name: "Marketing Spend Forecast",
                              data:
                                demand.financialEstimations[0]
                                  .marketingSpendForecast,
                            },
                            {
                              name: "Revenue Goal",
                              data: demand.financialEstimations[0].revenueGoal,
                            },
                            {
                              name: "Amazon",
                              categoryGroup: "Revenue Forecast",
                              data: amazon,
                            },
                            {
                              name: "DTC",
                              categoryGroup: "Revenue Forecast",
                              data: dtc,
                            },
                            {
                              name: "Retail",
                              categoryGroup: "Revenue Forecast",
                              data: retail,
                            },
                          ];
                          versions.push({
                            financialEstimation: fullFillArray1,
                            fullfilmentMatrix: fullFillArray,
                            demandSkuMaster: skus,
                            versionName: demand.versionName,
                            versionId: demand.versionId,
                          });
                        });
                        setDemandSkuData(versions);
                        editedCells = [];
                        setSpinner(false);
                      });
                    });
                  } else {
                    message.warning("No cell was editted yet!");
                  }
                }}
                type="rounded-outline"
                icon={<SaveOutlined />}
                size="small"
                color={palette.grass}
              >
                Save
              </Button>

              <Button
                type="rounded-outline"
                icon={<VerticalAlignTopOutlined />}
                size="small"
                onClick={() => {
                  publishFinancial(
                    getClientId(),
                    currentSopVersions,
                    financialTableData.filter(
                      (item: any) =>
                        item.versionName.includes(financialCurrentVersion) ||
                        (item.versionName.includes("Actuals") &&
                          !item.versionName.includes("vs"))
                    )[currentFinancial]?.id
                  ).then((res) => {
                    setSopVersions(res.data.financialVersions);
                  });
                }}
              >
                Publish
              </Button>

              <Button
                type="rounded-outline"
                icon={<NumberOutlined />}
                size="small"
                onClick={() => {
                  setUploadType("Actuals");
                  showModal();
                }}
              >
                Add Actuals
              </Button>
              <Button
                type="rounded-outline"
                onClick={() => {
                  setUploadType("Goals");
                  showModal();
                }}
                icon={<BarChartOutlined />}
                size="small"
              >
                Add Goals
              </Button>
            </>
          )}

          <Dropdown overlay={menu} placement="bottomCenter">
            <Button type="rounded-outline" icon={<DownloadOutlined />} size="small">
              Download Actuals
            </Button>
          </Dropdown>
        </ActionItems>
      </TopBar>
      <FilterBar>
        <Select
          style={{ width: "150px" }}
          placeholder="Select Plan"
          onChange={(value) => {
            setFinancialCurrentVersion(value);
            editedCells = [];
          }}
          value={financialCurrentVersion}
        >
          {financialAllVersion &&
            financialAllVersion.map((options: any, index: number) => {
              return <Option value={options}> {options}</Option>;
            })}
        </Select>
        <Select
          style={{ width: "180px" }}
          placeholder="Select Plan"
          onChange={(value) => {
            setCurrentFinancial(value);
            editedCells = [];
          }}
          value={currentFinancial}
        >
          {financialTableData &&
            financialTableData
              .filter(
                (item: any) =>
                  item.versionName.includes(financialCurrentVersion) ||
                  (item.versionName.includes("Actuals") &&
                    !item.versionName.includes("vs"))
              )
              .map((options: any, index: number) => {
                return (
                  <Option value={index}> {options.versionName.split("-")[0]}</Option>
                );
              })}
        </Select>
        <Select
          style={{ width: "150px" }}
          defaultValue="Balance Sheet"
          placeholder="Select View"
          onChange={(value) => {
            setTableView(value);
          }}
        >
          <Option value="Profit">Profit &amp; Loss</Option>
          <Option value="Balance Sheet">Balance Sheet</Option>
          <Option value="Cash Flow">Cash Flow</Option>
        </Select>
      </FilterBar>
    </HeaderWrapper>
  );

  return (
    <Spin spinning={!financialTableData || spinner} indicator={antIcon} delay={500}>
      <Page
        logout={() => {
          //  @ts-ignore
          props.logout();
        }}
        header={Header}
      >
        {financialTableData && (
          <Table
            cellEditFunc={handleCellEdit}
            tableView={
              financialTableData &&
              financialTableData.filter(
                (item: any) =>
                  item.versionName.includes(financialCurrentVersion) ||
                  (item.versionName.includes("Actuals") &&
                    !item.versionName.includes("vs"))
              )[currentFinancial]?.versionName
            }
            data={
              tableView == "Balance Sheet"
                ? financialTableData.filter(
                    (item: any) =>
                      item.versionName.includes(financialCurrentVersion) ||
                      (item.versionName.includes("Actuals") &&
                        !item.versionName.includes("vs"))
                  )[currentFinancial]?.dataBalanceSheet
                : tableView == "Cash Flow"
                ? financialTableData.filter(
                    (item: any) =>
                      item.versionName.includes(financialCurrentVersion) ||
                      (item.versionName.includes("Actuals") &&
                        !item.versionName.includes("vs"))
                  )[currentFinancial]?.dataCashFlow
                : financialTableData.filter(
                    (item: any) =>
                      item.versionName.includes(financialCurrentVersion) ||
                      (item.versionName.includes("Actuals") &&
                        !item.versionName.includes("vs"))
                  )[currentFinancial]?.dataProfitLoss
            }
          />
        )}
        <Modal
          footer={[]}
          title={`Upload ${uploadType}`}
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Form
            form={form}
            {...layout}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              label="Cash Flow"
              name="cashflow"
              rules={[{ required: true, message: "Please upload file!" }]}
            >
              <Upload {...uploadprops}>
                <Button type="rounded-outline" icon={<UploadOutlined />}>
                  Upload
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item
              label="Balance Sheet"
              name="balancesheet"
              rules={[{ required: true, message: "Please upload file!" }]}
            >
              <Upload {...uploadprops}>
                <Button type="rounded-outline" icon={<UploadOutlined />}>
                  Upload
                </Button>
              </Upload>
            </Form.Item>
            <Form.Item
              label="Profit Loss"
              name="profitloss"
              rules={[{ required: true, message: "Please upload file!" }]}
            >
              <Upload {...uploadprops}>
                <Button type="rounded-outline" icon={<UploadOutlined />}>
                  Upload
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item {...tailLayout}>
              <Button type="rounded-outline" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Page>
    </Spin>
  );
};

export default FinancialPlanning;
