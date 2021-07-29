import React, { FC, useState, useEffect, useContext, useRef } from "react";
import {
  Select,
  Modal,
  Form,
  Spin,
  Menu,
  Dropdown,
  Upload,
  message,
  Row,
  Col,
  Input,
} from "antd";
import _ from "lodash";
import Page from "./../../common/layouts/Page";
import { ActionItems, FilterBar, HeaderWrapper, PageTitle, TopBar } from "./styles";
import { PortfolioContext } from "../../contexts/PortfolioContext";
import Button from "../../components/buttons";
import SkuTable from "./components/sku table";
import MasterTable from "./components/master table";
import SkuBomTable from "./components/skubom table";
import MasterBomTable from "./components/masterbom table";
import KitBomTable from "./components/kitbom table";
import {
  SaveOutlined,
  StopOutlined,
  VerticalAlignTopOutlined,
  DownloadOutlined,
  NumberOutlined,
  BarChartOutlined,
  UploadOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import { palette } from "../../assets/theme/palette";
import {
  getSKUTable,
  postSku,
  getMasterTable,
} from "../../helpers/portfolio.services";
import { getClientId, searchSOP } from "../../helpers/util";
import {
  getFullfilmentMatrix,
  getDemandFinancial,
  saveFullfilmentMatrix,
  saveFinancialEstimation,
  saveDemandSku,
  getDemandSku,
  getDemandVersions,
  publishDemand,
} from "../../helpers/demand.services";
import { versions } from "process";
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
        href={`https://api-dev.capabl.co/portfolioExport/skus/${getClientId()}`}
      >
        SKUs
      </a>
    </Menu.Item>
    {/* <Menu.Item>
      <a
        // target="_blank"
        // rel="noopener noreferrer"
        href="https://api-dev.capabl.co/actualsexport/balancesheet/2"
      >
        Sales Channels
      </a>
    </Menu.Item>
    <Menu.Item>
      <a
        // target="_blank"
        // rel="noopener noreferrer"
        href="https://api-dev.capabl.co/actualsexport/profitloss/2"
      >
        Profit & Loss
      </a>
    </Menu.Item> */}
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
let editedCells: any = [];
let demandSkueditedCells: any = [];
let financialeditedCells: any = [];
const DemandPlanning: FC = (props) => {
  const {
    demandSkuData,
    setDemandSkuData,
    setSkuTableData,
    masterTableData,
    sopVersions,
    setSopVersions,
    currentSopVersions,
    setCurrentSopVersions,
    setMasterTableData,
    fullfilmentData,
    setFullfilmentData,
    demandFinancialData,
    setDemandFinancialData,
    kitBomName,
    setKitBomName,
    kitAddType,
    setKitAddType,
    kitBomTableData,
    setKitBomTableData,
  } = useContext(PortfolioContext);
  const [tableView, setTableView] = useState("Financial Estimations");
  const [channelView, setChannelView] = useState("Amazon");
  const [modal, contextHolder] = Modal.useModal();
  const [form] = Form.useForm();
  const [currentFinancial, setCurrentFinancial] = useState(0);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [spinner, setSpinner] = useState(false);

  const onFinish = (values: any) => {
    setSkuTableData(false);
    handleCancel();
    let formData = new FormData();
    formData.append("SKU", values.SKU.file.originFileObj);

    formData.append("clientId", "2");

    postSku(formData).then((res) => {
      let skus = res.data.skuMaster.map((skuItem: any) => {
        let objAttr = skuItem.attributes;

        let skutoreturn = { ...skuItem, ...objAttr };

        return skutoreturn;
      });

      setSkuTableData({ skus: skus, attr: res.data.attributes });
    });
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

  const handleCellEditFinancial = (cell: any) => {
    const index = financialeditedCells.findIndex((e: any) => e.id === cell.id);

    if (index === -1) {
      financialeditedCells.push(cell);
    } else {
      financialeditedCells[index] = cell;
    }
  };
  const handleCellEdit = (cell: any) => {
    const index = editedCells.findIndex((e: any) => e.id === cell.id);

    if (index === -1) {
      editedCells.push(cell);
    } else {
      editedCells[index] = cell;
    }
  };
  const handleCellEditDemandSku = (cell: any) => {
    const index = demandSkueditedCells.findIndex((e: any) => e.id === cell.id);

    if (index === -1) {
      demandSkueditedCells.push(cell);
    } else {
      demandSkueditedCells[index] = cell;
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
    if (!demandSkuData) {
      // dataCashFlow = [];
      // dataBalanceSheet = [];
      // dataProfitLoss = [];
      // let myData: any;
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
        setCurrentFinancial(versions.length - 1);
      });

      // getDemandSku(getClientId()).then((res: any) => {
      //   let skus = res.data.demandSkuMasters.map((demandSkuItem: any) => {
      //     let demandArray = _.keyBy(demandSkuItem.demandSkus, "value");
      //     delete demandSkuItem.sku.id;

      //     let skutoreturn = {
      //       ...demandSkuItem,
      //       ...demandSkuItem.sku,
      //       ...demandArray,
      //     };

      //     return skutoreturn;
      //   });

      //   setDemandSkuData({ skus: skus, attr: [] });
      // });
    }
  }, []);

  const Header = (
    <HeaderWrapper>
      <TopBar>
        <PageTitle>Demand Planning</PageTitle>
        <ActionItems>
          {!searchSOP(currentSopVersions, sopVersions)?.demandVersion && (
            <>
              <Button
                onClick={() => {
                  if (
                    editedCells.length ||
                    demandSkueditedCells.length ||
                    financialeditedCells.length
                  ) {
                    if (tableView == "Fulfillment Matrix") {
                      let datatosend = {
                        demandVersionId: demandSkuData[0].versionId,
                        isnew: false,
                        data: editedCells,
                      };
                      if (editedCells.length) {
                        // setFinancialTableData(false);
                        setSpinner(true);
                        saveFullfilmentMatrix(datatosend).then((res) => {
                          editedCells = [];
                          setSpinner(false);
                        });
                      }
                    } else {
                      modal.confirm({
                        // closable: true,
                        content:
                          "Do you want to create a new version or overwrite an existing one?",
                        title: "Save alert!",
                        onOk: () => {
                          if (tableView == "Sales Channels") {
                            let datatosend = {
                              demandVersionId:
                                demandSkuData[currentFinancial].versionId,
                              isnew: true,
                              data: demandSkueditedCells,
                            };
                            if (demandSkueditedCells.length) {
                              // setFinancialTableData(false);
                              setSpinner(true);
                              saveDemandSku(datatosend).then((res) => {
                                let versions: any = [];

                                res.data.demandSkuMasters.forEach((demand: any) => {
                                  let skus = demand.skuMaster.map(
                                    (demandSkuItem: any) => {
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
                                    }
                                  );
                                  let fullFillArray: any = [];
                                  demand.fulfillmentMatrix.forEach(
                                    (fillItem: any) => {
                                      let fullfilObj: any = {};
                                      fullfilObj["channelName"] =
                                        fillItem.channelName;
                                      fillItem.centers.forEach((centerItem: any) => {
                                        fullfilObj[
                                          centerItem.centerName
                                        ] = centerItem;
                                      });
                                      fullFillArray.push(fullfilObj);
                                    }
                                  );
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
                                          amazon.push({
                                            [dateKey]: item[keys].Amazon,
                                          });
                                          retail.push({
                                            [dateKey]: item[keys].Retail,
                                          });
                                        }
                                      });
                                    }
                                  );

                                  let fullFillArray1: any = [
                                    {
                                      name: "Marketing Spend Goal",
                                      data:
                                        demand.financialEstimations[0]
                                          .marketingSpendGoal,
                                    },
                                    {
                                      name: "Marketing Spend Forecast",
                                      data:
                                        demand.financialEstimations[0]
                                          .marketingSpendForecast,
                                    },
                                    {
                                      name: "Revenue Goal",
                                      data:
                                        demand.financialEstimations[0].revenueGoal,
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
                                setCurrentFinancial(versions.length - 1);
                                demandSkueditedCells = [];
                                setSpinner(false);
                              });
                            }
                          } else if (tableView == "Financial Estimations") {
                            let datatosend = {
                              demandVersionId:
                                demandSkuData[currentFinancial].versionId,
                              isnew: true,
                              data: financialeditedCells,
                            };
                            if (financialeditedCells.length) {
                              // setFinancialTableData(false);
                              setSpinner(true);
                              saveFinancialEstimation(datatosend).then((res) => {
                                let versions: any = [];

                                res.data.demandFinancialEstimations.forEach(
                                  (demand: any) => {
                                    let skus = demand.skuMaster.map(
                                      (demandSkuItem: any) => {
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
                                      }
                                    );
                                    let fullFillArray: any = [];
                                    demand.fulfillmentMatrix.forEach(
                                      (fillItem: any) => {
                                        let fullfilObj: any = {};
                                        fullfilObj["channelName"] =
                                          fillItem.channelName;
                                        fillItem.centers.forEach(
                                          (centerItem: any) => {
                                            fullfilObj[
                                              centerItem.centerName
                                            ] = centerItem;
                                          }
                                        );
                                        fullFillArray.push(fullfilObj);
                                      }
                                    );
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
                                            amazon.push({
                                              [dateKey]: item[keys].Amazon,
                                            });
                                            retail.push({
                                              [dateKey]: item[keys].Retail,
                                            });
                                          }
                                        });
                                      }
                                    );

                                    let fullFillArray1: any = [
                                      {
                                        name: "Marketing Spend Goal",
                                        data:
                                          demand.financialEstimations[0]
                                            .marketingSpendGoal,
                                      },
                                      {
                                        name: "Marketing Spend Forecast",
                                        data:
                                          demand.financialEstimations[0]
                                            .marketingSpendForecast,
                                      },
                                      {
                                        name: "Revenue Goal",
                                        data:
                                          demand.financialEstimations[0].revenueGoal,
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
                                  }
                                );
                                setDemandSkuData(versions);
                                setCurrentFinancial(versions.length - 1);
                                financialeditedCells = [];
                                setSpinner(false);
                              });
                            }
                          }
                        },
                        cancelText: "Overwrite",
                        okText: "Create",
                        onCancel: () => {
                          if (tableView == "Sales Channels") {
                            let datatosend = {
                              demandVersionId:
                                demandSkuData[currentFinancial].versionId,
                              isnew: false,
                              data: demandSkueditedCells,
                            };
                            if (demandSkueditedCells.length) {
                              // setFinancialTableData(false);
                              setSpinner(true);
                              saveDemandSku(datatosend).then((res) => {
                                let versions: any = [];

                                res.data.demandSkuMasters.forEach((demand: any) => {
                                  let skus = demand.skuMaster.map(
                                    (demandSkuItem: any) => {
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
                                    }
                                  );
                                  let fullFillArray: any = [];
                                  demand.fulfillmentMatrix.forEach(
                                    (fillItem: any) => {
                                      let fullfilObj: any = {};
                                      fullfilObj["channelName"] =
                                        fillItem.channelName;
                                      fillItem.centers.forEach((centerItem: any) => {
                                        fullfilObj[
                                          centerItem.centerName
                                        ] = centerItem;
                                      });
                                      fullFillArray.push(fullfilObj);
                                    }
                                  );
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
                                          amazon.push({
                                            [dateKey]: item[keys].Amazon,
                                          });
                                          retail.push({
                                            [dateKey]: item[keys].Retail,
                                          });
                                        }
                                      });
                                    }
                                  );

                                  let fullFillArray1: any = [
                                    {
                                      name: "Marketing Spend Goal",
                                      data:
                                        demand.financialEstimations[0]
                                          .marketingSpendGoal,
                                    },
                                    {
                                      name: "Marketing Spend Forecast",
                                      data:
                                        demand.financialEstimations[0]
                                          .marketingSpendForecast,
                                    },
                                    {
                                      name: "Revenue Goal",
                                      data:
                                        demand.financialEstimations[0].revenueGoal,
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

                                demandSkueditedCells = [];
                                setSpinner(false);
                              });
                            }
                          } else if (tableView == "Financial Estimations") {
                            let datatosend = {
                              demandVersionId:
                                demandSkuData[currentFinancial].versionId,
                              isnew: false,
                              data: financialeditedCells,
                            };
                            if (financialeditedCells.length) {
                              // setFinancialTableData(false);
                              setSpinner(true);
                              saveFinancialEstimation(datatosend).then((res) => {
                                let versions: any = [];

                                res.data.demandFinancialEstimations.forEach(
                                  (demand: any) => {
                                    let skus = demand.skuMaster.map(
                                      (demandSkuItem: any) => {
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
                                      }
                                    );
                                    let fullFillArray: any = [];
                                    demand.fulfillmentMatrix.forEach(
                                      (fillItem: any) => {
                                        let fullfilObj: any = {};
                                        fullfilObj["channelName"] =
                                          fillItem.channelName;
                                        fillItem.centers.forEach(
                                          (centerItem: any) => {
                                            fullfilObj[
                                              centerItem.centerName
                                            ] = centerItem;
                                          }
                                        );
                                        fullFillArray.push(fullfilObj);
                                      }
                                    );
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
                                            amazon.push({
                                              [dateKey]: item[keys].Amazon,
                                            });
                                            retail.push({
                                              [dateKey]: item[keys].Retail,
                                            });
                                          }
                                        });
                                      }
                                    );

                                    let fullFillArray1: any = [
                                      {
                                        name: "Marketing Spend Goal",
                                        data:
                                          demand.financialEstimations[0]
                                            .marketingSpendGoal,
                                      },
                                      {
                                        name: "Marketing Spend Forecast",
                                        data:
                                          demand.financialEstimations[0]
                                            .marketingSpendForecast,
                                      },
                                      {
                                        name: "Revenue Goal",
                                        data:
                                          demand.financialEstimations[0].revenueGoal,
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
                                  }
                                );
                                setDemandSkuData(versions);
                                financialeditedCells = [];
                                setSpinner(false);
                              });
                            }
                          }
                        },
                      });
                    }
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
                  publishDemand(
                    getClientId(),
                    currentSopVersions,
                    demandSkuData[currentFinancial].versionId
                  ).then((res) => {
                    setSopVersions(res.data.demandVersions);
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
                  showModal();
                }}
              >
                Add SKUs
              </Button>
            </>
          )}
          {/* <Button type="rounded-outline" icon={<BarChartOutlined />} size="small">
            Add Forecasted
          </Button> */}
          <Dropdown overlay={menu} placement="bottomCenter">
            <Button type="rounded-outline" icon={<DownloadOutlined />} size="small">
              Download SKUs
            </Button>
          </Dropdown>
        </ActionItems>
      </TopBar>
      <FilterBar>
        <Select
          style={{ width: "150px" }}
          placeholder="Select Plan"
          onChange={(value) => {
            setCurrentFinancial(value);
            editedCells = [];
            demandSkueditedCells = [];
            financialeditedCells = [];
          }}
          value={currentFinancial}
        >
          {demandSkuData &&
            demandSkuData.map((options: any, index: number) => {
              return <Option value={index}> {options.versionName}</Option>;
            })}
        </Select>
        <Select
          style={{ width: "190px" }}
          defaultValue="Financial Estimations"
          placeholder="Select View"
          onChange={(value) => {
            // @ts-ignore
            // if (value == "Fulfillment Matrix" && !fullfilmentData) {
            //   setSpinner(true);

            //   getFullfilmentMatrix(getClientId()).then((res: any) => {
            //     let fullFillArray: any = [];
            //     res.data.demandFulfillmentMatrix.forEach((fillItem: any) => {
            //       let fullfilObj: any = {};
            //       fullfilObj["channelName"] = fillItem.channelName;
            //       fillItem.centers.forEach((centerItem: any) => {
            //         fullfilObj[centerItem.centerName] = centerItem;
            //       });
            //       fullFillArray.push(fullfilObj);
            //     });
            //     setFullfilmentData(fullFillArray);
            //     setSpinner(false);
            //   });
            // }
            // // @ts-ignore
            // if (value == "Financial Estimations" && !demandFinancialData) {
            //   setSpinner(true);

            //   getDemandFinancial(getClientId()).then((res: any) => {
            //     let dtc: any = [];
            //     let amazon: any = [];
            //     let retail: any = [];
            //     // categoryGroup
            //     let dateKey;
            //     let abc;
            //     res.data.demandFinancialEstimations.revenueForecast.forEach(
            //       (item: any) => {
            //         abc = Object.keys(item);
            //         abc.forEach((keys: any) => {
            //           if (keys.includes("-")) {
            //             dateKey = keys;
            //             dtc.push({ [dateKey]: item[keys].DTC });
            //             amazon.push({ [dateKey]: item[keys].Amazon });
            //             retail.push({ [dateKey]: item[keys].Retail });
            //           }
            //         });
            //       }
            //     );

            //     let fullFillArray: any = [
            //       {
            //         name: "Marketing Spend Goal",
            //         data: res.data.demandFinancialEstimations.marketingSpendGoal,
            //       },
            //       {
            //         name: "Marketing Spend Forecast",
            //         data: res.data.demandFinancialEstimations.marketingSpendForecast,
            //       },
            //       {
            //         name: "Revenue Goal",
            //         data: res.data.demandFinancialEstimations.revenueGoal,
            //       },
            //       {
            //         name: "Amazon",
            //         categoryGroup: "Revenue Forecast",
            //         data: amazon,
            //       },
            //       {
            //         name: "DTC",
            //         categoryGroup: "Revenue Forecast",
            //         data: dtc,
            //       },
            //       {
            //         name: "Retail",
            //         categoryGroup: "Revenue Forecast",
            //         data: retail,
            //       },
            //     ];
            //     // {name:,data:                res.data.demandFinancialEstimations.revenueForecast},
            //     setDemandFinancialData(fullFillArray);
            //     setSpinner(false);
            //   });
            // }
            editedCells = [];
            demandSkueditedCells = [];
            financialeditedCells = [];
            setKitAddType(false);
            setKitBomName(null);
            setKitBomTableData([]);
            setTableView(value);
          }}
        >
          {" "}
          <Option value="Financial Estimations">Financial Estimations</Option>
          <Option value="Sales Channels">Sales Channels</Option>
          <Option value="Fulfillment Matrix">Fulfillment Matrix</Option>
        </Select>
        {tableView == "Sales Channels" && (
          <Select
            style={{ width: "150px" }}
            defaultValue="Amazon"
            placeholder="Select Channel"
            onChange={(value) => {
              setChannelView(value);
            }}
          >
            <Option value="Amazon">Amazon</Option>
            <Option value="Retail">Retail</Option>
            <Option value="DTC">DTC</Option>
          </Select>
        )}
        {tableView == "Kit BOM" && (
          <>
            <Row>
              <Col>
                <Button
                  hidden={kitBomName != null}
                  onClick={() => {
                    setKitAddType(false);
                    setKitBomName("");
                    setKitBomTableData([]);
                  }}
                  type="rounded-outline"
                  icon={<NumberOutlined />}
                  size="middle"
                >
                  Add Kit
                </Button>
              </Col>
            </Row>
            <Row>
              <Col>
                {" "}
                <Input
                  hidden={kitBomName == null}
                  value={kitBomName}
                  onChange={(event: any) => {
                    setKitBomName(event.target.value);
                  }}
                  placeholder="Kit name"
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <Button
                  hidden={kitBomName == null}
                  onClick={() => {
                    setKitAddType(false);
                    setKitBomName(null);
                    setKitBomTableData([]);
                  }}
                  type="rounded-outline"
                  icon={<StopOutlined />}
                  size="middle"
                  color={palette.black}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </>
        )}
      </FilterBar>
    </HeaderWrapper>
  );
  // demandSkuData[currentFinancial].
  // financialEstimation: fullFillArray1,
  //           fullfilmentMatrix: fullFillArray,
  //           demandSkuMaster: skus,
  //           versionName: demand.versionName,
  return (
    <Spin spinning={!demandSkuData || spinner} indicator={antIcon} delay={500}>
      <Page
        logout={() => {
          //  @ts-ignore
          props.logout();
        }}
        header={Header}
      >
        {tableView == "Sales Channels" && demandSkuData && (
          <SkuTable
            cellEditFunc={handleCellEditDemandSku}
            data={
              channelView == "Amazon"
                ? demandSkuData[currentFinancial].demandSkuMaster?.filter(
                    (sku: any) => sku.demandChannel.channelName == "Amazon"
                  )
                : channelView == "Retail"
                ? demandSkuData[currentFinancial].demandSkuMaster?.filter(
                    (sku: any) => sku.demandChannel.channelName == "Retail"
                  )
                : demandSkuData[currentFinancial].demandSkuMaster?.filter(
                    (sku: any) => sku.demandChannel.channelName == "DTC"
                  )
              // tableView == "Sales Channels"
              //   ? financialTableData[currentFinancial].dataBalanceSheet
              //   : tableView == "Cash Flow"
              //   ? financialTableData[currentFinancial].dataCashFlow
              //   : financialTableData[currentFinancial].dataProfitLoss
            }
          />
        )}
        {tableView == "Fulfillment Matrix" && demandSkuData && (
          <MasterTable
            cellEditFunc={handleCellEdit}
            data={demandSkuData[0].fullfilmentMatrix}
          />
        )}
        {tableView == "Financial Estimations" && demandSkuData && (
          <SkuBomTable
            cellEditFunc={handleCellEditFinancial}
            data={demandSkuData[currentFinancial]?.financialEstimation}
          />
        )}

        <Modal
          footer={[]}
          title="Upload SKU"
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
              label="SKU file"
              name="SKU"
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
      {contextHolder}
    </Spin>
  );
};

export default DemandPlanning;
