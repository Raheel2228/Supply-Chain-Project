import React, { FC, useState, useEffect, useContext, useRef } from "react";
import {
  Select,
  Modal,
  Form,
  Spin,
  Menu,
  Radio,
  Upload,
  message,
  Row,
  Col,
  Input,
  DatePicker,
} from "antd";
import _ from "lodash";
import Page from "./../../common/layouts/Page";
import { ActionItems, FilterBar, HeaderWrapper, PageTitle, TopBar } from "./styles";
import { PortfolioContext } from "../../contexts/PortfolioContext";
import Button from "../../components/buttons";
import SkuTable from "./components/sku table";
import MasterTable from "./components/master table";
import SkuBomTable from "./components/skubom table";
import moment from "moment";
import MasterBomTable from "./components/masterbom table";
import RoTable from "./components/forecast table";
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
  getSupplyMaster,
  getActualOh,
  getSupplyVersions,
  saveSupplyMaster,
  saveSupplyMasterSku,
  getFinancialOutlook,
  getSupplyMasterSku,
  saveActualOh,
  getPurchaseOrders,
  publishSupply,
  savePO,
  recal,
} from "../../helpers/supply.services";
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
const options = [
  { label: "Saddle Creek", value: "Saddle Creek" },
  { label: "IDS", value: "IDS" },
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
        Supplier Master
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
let POeditedCells: any = [];
let financialeditedCells: any = [];
const DemandPlanning: FC = (props) => {
  const {
    setSkuTableData,
    supplyMasterTableData,
    setSupplyMasterTableData,
    fullfilmentData,
    setFullfilmentData,
    demandFinancialData,
    setDemandFinancialData,
    kitBomName,
    setKitBomName,
    setKitAddType,
    setKitBomTableData,
    supplyMasterActualsData,
    setsupplyMasterActualsData,
    purchaseOrderData,
    setPurchaseOrderData,
    sopVersions,
    setSopVersions,
    currentSopVersions,
    setCurrentSopVersions,
  } = useContext(PortfolioContext);
  const [tableView, setTableView] = useState("Supplier Master");
  const [channelView, setChannelView] = useState("expectedOh");
  const [fulfillview, setFulfillview] = useState("Saddle Creek");
  const [supplierview, setSupplierview] = useState("");
  const [actualFulfillview, setActualFulfillview] = useState("Saddle Creek");
  const [modal, contextHolder] = Modal.useModal();
  const [form] = Form.useForm();
  const [currentFinancial, setCurrentFinancial] = useState(0);
  const [actualDate, setActualDate] = useState(moment().format("YYYY-MM-DD"));

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [skuList, setSkuList] = useState({ skuNames: false, skus: false });
  const [supplierList, setSupplierList] = useState(false);
  const [fulfillList, setFulfillList] = useState(false);

  // const [modalCheck, setModalCheck] = useState(false);
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
    setsupplyMasterActualsData(false);
    financialeditedCells = [];
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setsupplyMasterActualsData(false);
    financialeditedCells = [];
    setIsModalVisible(false);
  };

  const handleCellEditFinancial = (cell: any) => {
    const index = financialeditedCells.findIndex(
      (e: any) =>
        e.fulfillmentClientId === cell.fulfillmentClientId && e.skuId === cell.skuId
    );

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
  const handleCellEditPO = (cell: any) => {
    const index = POeditedCells.findIndex(
      (e: any) => e.id === cell.id && e.poName === cell.poName
    );

    if (index === -1) {
      POeditedCells.push(cell);
    } else {
      POeditedCells[index] = cell;
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
    if (!demandFinancialData) {
      getSupplyVersions(getClientId()).then((res) => {
        let versions: any = [];
        res.data.supplyVersions.forEach((vers: any) => {
          let fullFillArray1: any = [
            {
              name: "Finished Goods",
              categoryGroup: "Goal",
              categoryGroup1: "Inventory Assets",
              data: vers.financialOutlook.goalsOutlook.finishedGoods.map(
                (item: any) => {
                  return { [item.value]: item.itemValue };
                }
              ),
            },
            {
              name: "Non Finished Goods",
              categoryGroup: "Goal",
              categoryGroup1: "Inventory Assets",
              data: vers.financialOutlook.goalsOutlook.nonFinishedGoods.map(
                (item: any) => {
                  return { [item.value]: item.itemValue };
                }
              ),
            },
            {
              name: "In Transit Inventory",
              categoryGroup: "Goal",
              categoryGroup1: "Inventory Assets",
              data: vers.financialOutlook.goalsOutlook.inTransitInventory.map(
                (item: any) => {
                  return { [item.value]: item.itemValue };
                }
              ),
            },
            {
              name: "Prepaid Inventory",
              categoryGroup: "Goal",
              categoryGroup1: "Inventory Assets",
              data: vers.financialOutlook.goalsOutlook.prepaidInventory.map(
                (item: any) => {
                  return { [item.value]: item.itemValue };
                }
              ),
            },
            {
              name: "Accounts Payable",
              categoryGroup: "Goal",
              categoryGroup1: "Inventory Assets",
              data: vers.financialOutlook.goalsOutlook.accountsPayable.map(
                (item: any) => {
                  return { [item.value]: item.itemValue };
                }
              ),
            },
            {
              name: "Finished Goods",
              categoryGroup: "Forecast",
              categoryGroup1: "Inventory Assets",
              data: vers.financialOutlook.forecastOutlook.finishedGoods.map(
                (item: any) => {
                  return { [item.value]: item.itemValue };
                }
              ),
            },
            {
              name: "Non Finished Goods",
              categoryGroup: "Forecast",
              categoryGroup1: "Inventory Assets",
              data: vers.financialOutlook.forecastOutlook.nonFinishedGoods.map(
                (item: any) => {
                  return { [item.value]: item.itemValue };
                }
              ),
            },
            {
              name: "In Transit Inventory",
              categoryGroup: "Forecast",
              categoryGroup1: "Inventory Assets",
              data: vers.financialOutlook.forecastOutlook.inTransitInventory.map(
                (item: any) => {
                  return { [item.value]: item.itemValue };
                }
              ),
            },
            {
              name: "Prepaid Inventory",
              categoryGroup: "Forecast",
              categoryGroup1: "Inventory Assets",
              data: vers.financialOutlook.forecastOutlook.prepaidInventory.map(
                (item: any) => {
                  return { [item.value]: item.itemValue };
                }
              ),
            },
            {
              name: "Accounts Payable",
              categoryGroup: "Forecast",
              categoryGroup1: "Inventory Assets",
              data: vers.financialOutlook.forecastOutlook.accountsPayable.map(
                (item: any) => {
                  return { [item.value]: item.itemValue };
                }
              ),
            },
          ];
          let skus = vers.skuSupplyMaster.map((supplySkuItem: any) => {
            let supplyArray = _.keyBy(supplySkuItem.expectedOh, "value");
            delete supplySkuItem.sku.id;

            let skutoreturn = {
              ...supplySkuItem,
              ...supplySkuItem.sku,
              ...supplyArray,
              ...{
                supplier: supplySkuItem.supplierMaster.supplierName,
                fulfill: supplySkuItem.fulfillmentClient.fullfillmentName,
              },
            };

            return skutoreturn;
          });
          if (!supplyMasterTableData) {
            setSupplierview(vers.supplyMaster[0].supplierName);
            setSupplyMasterTableData(vers.supplyMaster);
          }
          if (!purchaseOrderData) {
            let po = vers.purchaseOrders.purchaseOrders.map((item: any) => {
              return item.data;
            });
            let fore = vers.purchaseOrders.recommendedPurchaseOrders.map(
              (item: any) => {
                return item.data;
              }
            );
            setPurchaseOrderData({ po: po, fore: fore });
          }

          versions.push({
            financialOutlock: fullFillArray1,
            skuSupplyMaster: skus,
            versionName: vers.versionName,
            versionId: vers.id,
          });
        });
        setDemandFinancialData(versions);
        setCurrentFinancial(versions.length - 1);
      });
      // getSupplyMaster(getClientId()).then((res) => {
      //   // setSupplyMasterTableData(res.data.supplyMaster);
      //   getFinancialOutlook(getClientId()).then((res: any) => {//
      //     let versions: any = [];
      //     let fullFillArray1: any = [
      //       {
      //         name: "Finished Goods",
      //         categoryGroup: "Goal",
      //         categoryGroup1: "Inventory Assets",
      //         data: res.data.financialOutlook.goalsOutlook.finishedGoods.map(
      //           (item: any) => {
      //             return { [item.value]: item.itemValue };
      //           }
      //         ),
      //       },
      //       {
      //         name: "Non Finished Goods",
      //         categoryGroup: "Goal",
      //         categoryGroup1: "Inventory Assets",
      //         data: res.data.financialOutlook.goalsOutlook.nonFinishedGoods.map(
      //           (item: any) => {
      //             return { [item.value]: item.itemValue };
      //           }
      //         ),
      //       },
      //       {
      //         name: "In Transit Inventory",
      //         categoryGroup: "Goal",
      //         categoryGroup1: "Inventory Assets",
      //         data: res.data.financialOutlook.goalsOutlook.inTransitInventory.map(
      //           (item: any) => {
      //             return { [item.value]: item.itemValue };
      //           }
      //         ),
      //       },
      //       {
      //         name: "Prepaid Inventory",
      //         categoryGroup: "Goal",
      //         categoryGroup1: "Inventory Assets",
      //         data: res.data.financialOutlook.goalsOutlook.prepaidInventory.map(
      //           (item: any) => {
      //             return { [item.value]: item.itemValue };
      //           }
      //         ),
      //       },
      //       {
      //         name: "Accounts Payable",
      //         categoryGroup: "Goal",
      //         categoryGroup1: "Inventory Assets",
      //         data: res.data.financialOutlook.goalsOutlook.accountsPayable.map(
      //           (item: any) => {
      //             return { [item.value]: item.itemValue };
      //           }
      //         ),
      //       },
      //       {
      //         name: "Finished Goods",
      //         categoryGroup: "Forecast",
      //         categoryGroup1: "Inventory Assets",
      //         data: res.data.financialOutlook.forecastOutlook.finishedGoods.map(
      //           (item: any) => {
      //             return { [item.value]: item.itemValue };
      //           }
      //         ),
      //       },
      //       {
      //         name: "Non Finished Goods",
      //         categoryGroup: "Forecast",
      //         categoryGroup1: "Inventory Assets",
      //         data: res.data.financialOutlook.forecastOutlook.nonFinishedGoods.map(
      //           (item: any) => {
      //             return { [item.value]: item.itemValue };
      //           }
      //         ),
      //       },
      //       {
      //         name: "In Transit Inventory",
      //         categoryGroup: "Forecast",
      //         categoryGroup1: "Inventory Assets",
      //         data: res.data.financialOutlook.forecastOutlook.inTransitInventory.map(
      //           (item: any) => {
      //             return { [item.value]: item.itemValue };
      //           }
      //         ),
      //       },
      //       {
      //         name: "Prepaid Inventory",
      //         categoryGroup: "Forecast",
      //         categoryGroup1: "Inventory Assets",
      //         data: res.data.financialOutlook.forecastOutlook.prepaidInventory.map(
      //           (item: any) => {
      //             return { [item.value]: item.itemValue };
      //           }
      //         ),
      //       },
      //       {
      //         name: "Accounts Payable",
      //         categoryGroup: "Forecast",
      //         categoryGroup1: "Inventory Assets",
      //         data: res.data.financialOutlook.forecastOutlook.accountsPayable.map(
      //           (item: any) => {
      //             return { [item.value]: item.itemValue };
      //           }
      //         ),
      //       },
      //     ];
      //     versions.push({
      //       financialOutlock: fullFillArray1,
      //     });
      //     // });
      //     setDemandFinancialData(versions);
      //     setCurrentFinancial(versions.length - 1);
      //   });//
      //   getSupplyMasterSku(getClientId()).then((res: any) => {
      //     let skus = res.data.skuSupplyMaster.map((supplySkuItem: any) => {
      //       let supplyArray = _.keyBy(supplySkuItem.expectedOh, "value");
      //       delete supplySkuItem.sku.id;

      //       let skutoreturn = {
      //         ...supplySkuItem,
      //         ...supplySkuItem.sku,
      //         ...supplyArray,
      //         ...{
      //           supplier: supplySkuItem.supplierMaster.supplierName,
      //           fulfill: supplySkuItem.fulfillmentClient.fullfillmentName,
      //         },
      //       };

      //       return skutoreturn;
      //     });

      //     setFullfilmentData(skus);
      //   });
      //   getPurchaseOrders(getClientId()).then((purchaseItem) => {
      //     let po = purchaseItem.data.purchaseOrderss.purchaseOrders.map(
      //       (item: any) => {
      //         return item.data;
      //       }
      //     );
      //     let fore = purchaseItem.data.purchaseOrderss.recommendedPurchaseOrders.map(
      //       (item: any) => {
      //         return item.data;
      //       }
      //     );
      //     setPurchaseOrderData({ po: po, fore: fore });
      //   });
      // });
    }
  }, []);

  const Header = (
    <HeaderWrapper>
      <TopBar>
        <PageTitle>Supply Planning</PageTitle>
        <ActionItems>
          {!searchSOP(currentSopVersions, sopVersions)?.supplyVersion && (
            <>
              <Button
                onClick={() => {
                  if (
                    editedCells.length ||
                    demandSkueditedCells.length ||
                    POeditedCells.length
                  ) {
                    if (tableView == "Supplier Master") {
                      demandSkueditedCells.map((itemSp: any) => {
                        if (itemSp.id < 1) {
                          delete itemSp.id;
                        }
                      });
                      let datatosend = {
                        data: demandSkueditedCells,
                      };
                      if (demandSkueditedCells.length) {
                        // setFinancialTableData(false);
                        setSpinner(true);
                        saveSupplyMaster(datatosend).then((res) => {
                          setSupplyMasterTableData(res.data.supplyMaster);
                          demandSkueditedCells = [];
                          setSpinner(false);
                        });
                      }
                    } else if (tableView == "PO Recommendation") {
                      let POarray = POeditedCells.map((itemPo: any) => {
                        demandFinancialData[
                          currentFinancial
                        ].skuSupplyMaster.forEach((item: any) => {
                          if (
                            itemPo.skuName &&
                            itemPo.supplierMaster &&
                            itemPo.skuName == item.skuName &&
                            itemPo.supplierMaster == item.supplier &&
                            itemPo.fulfillmentCenter == item.fulfill
                          ) {
                            itemPo["skuId"] = item.skuId;
                            itemPo["supplierMasterId"] = item.supplierMasterId;
                            itemPo["fulfillmentCenterId"] = item.fulfillmentClientId;
                            delete itemPo.skuName;
                            delete itemPo.supplierMaster;
                            delete itemPo.fulfillmentCenter;
                            if (itemPo.id < 1) {
                              delete itemPo.id;
                            }
                          }
                        });
                      });
                      let datatosend = {
                        data: POeditedCells,
                      };
                      if (POeditedCells.length) {
                        // setFinancialTableData(false);
                        setSpinner(true);
                        savePO(datatosend).then((res) => {
                          let po = res.data.purchaseOrderss.purchaseOrders.map(
                            (item: any) => {
                              return item.data;
                            }
                          );
                          let fore = res.data.purchaseOrderss.recommendedPurchaseOrders.map(
                            (item: any) => {
                              return item.data;
                            }
                          );
                          setPurchaseOrderData({ po: po, fore: fore });
                          POeditedCells = [];
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
                          if (tableView == "Expected Inventory") {
                            let datatosend = {
                              isnew: true,
                              supplyVersionId:
                                demandFinancialData[currentFinancial].versionId,
                              data: editedCells,
                            };
                            if (editedCells.length) {
                              // setFinancialTableData(false);
                              setSpinner(true);
                              saveSupplyMasterSku(datatosend).then((res) => {
                                let versions: any = [];
                                res.data.skuSupplyMaster.forEach((vers: any) => {
                                  let fullFillArray1: any = [
                                    {
                                      name: "Finished Goods",
                                      categoryGroup: "Goal",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.goalsOutlook.finishedGoods.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                    {
                                      name: "Non Finished Goods",
                                      categoryGroup: "Goal",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.goalsOutlook.nonFinishedGoods.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                    {
                                      name: "In Transit Inventory",
                                      categoryGroup: "Goal",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.goalsOutlook.inTransitInventory.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                    {
                                      name: "Prepaid Inventory",
                                      categoryGroup: "Goal",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.goalsOutlook.prepaidInventory.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                    {
                                      name: "Accounts Payable",
                                      categoryGroup: "Goal",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.goalsOutlook.accountsPayable.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                    {
                                      name: "Finished Goods",
                                      categoryGroup: "Forecast",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.forecastOutlook.finishedGoods.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                    {
                                      name: "Non Finished Goods",
                                      categoryGroup: "Forecast",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.forecastOutlook.nonFinishedGoods.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                    {
                                      name: "In Transit Inventory",
                                      categoryGroup: "Forecast",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.forecastOutlook.inTransitInventory.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                    {
                                      name: "Prepaid Inventory",
                                      categoryGroup: "Forecast",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.forecastOutlook.prepaidInventory.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                    {
                                      name: "Accounts Payable",
                                      categoryGroup: "Forecast",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.forecastOutlook.accountsPayable.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                  ];
                                  let skus = vers.skuSupplyMaster.map(
                                    (supplySkuItem: any) => {
                                      let supplyArray = _.keyBy(
                                        supplySkuItem.expectedOh,
                                        "value"
                                      );
                                      delete supplySkuItem.sku.id;

                                      let skutoreturn = {
                                        ...supplySkuItem,
                                        ...supplySkuItem.sku,
                                        ...supplyArray,
                                        ...{
                                          supplier:
                                            supplySkuItem.supplierMaster
                                              .supplierName,
                                          fulfill:
                                            supplySkuItem.fulfillmentClient
                                              .fullfillmentName,
                                        },
                                      };

                                      return skutoreturn;
                                    }
                                  );
                                  if (!supplyMasterTableData) {
                                    setSupplyMasterTableData(vers.supplyMaster);
                                  }
                                  if (!purchaseOrderData) {
                                    let po = vers.purchaseOrders.purchaseOrders.map(
                                      (item: any) => {
                                        return item.data;
                                      }
                                    );
                                    let fore = vers.purchaseOrders.recommendedPurchaseOrders.map(
                                      (item: any) => {
                                        return item.data;
                                      }
                                    );
                                    setPurchaseOrderData({ po: po, fore: fore });
                                  }

                                  versions.push({
                                    financialOutlock: fullFillArray1,
                                    skuSupplyMaster: skus,
                                    versionName: vers.versionName,
                                    versionId: vers.id,
                                  });
                                });
                                setDemandFinancialData(versions);
                                setCurrentFinancial(versions.length - 1);
                                editedCells = [];
                                setSpinner(false);
                              });
                            }
                          }
                        },
                        cancelText: "Overwrite",
                        okText: "Create",
                        onCancel: () => {
                          if (tableView == "Expected Inventory") {
                            let datatosend = {
                              isnew: false,
                              supplyVersionId:
                                demandFinancialData[currentFinancial].versionId,
                              data: editedCells,
                            };
                            if (editedCells.length) {
                              // setFinancialTableData(false);
                              setSpinner(true);
                              saveSupplyMasterSku(datatosend).then((res) => {
                                let versions: any = [];
                                res.data.skuSupplyMaster.forEach((vers: any) => {
                                  let fullFillArray1: any = [
                                    {
                                      name: "Finished Goods",
                                      categoryGroup: "Goal",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.goalsOutlook.finishedGoods.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                    {
                                      name: "Non Finished Goods",
                                      categoryGroup: "Goal",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.goalsOutlook.nonFinishedGoods.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                    {
                                      name: "In Transit Inventory",
                                      categoryGroup: "Goal",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.goalsOutlook.inTransitInventory.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                    {
                                      name: "Prepaid Inventory",
                                      categoryGroup: "Goal",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.goalsOutlook.prepaidInventory.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                    {
                                      name: "Accounts Payable",
                                      categoryGroup: "Goal",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.goalsOutlook.accountsPayable.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                    {
                                      name: "Finished Goods",
                                      categoryGroup: "Forecast",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.forecastOutlook.finishedGoods.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                    {
                                      name: "Non Finished Goods",
                                      categoryGroup: "Forecast",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.forecastOutlook.nonFinishedGoods.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                    {
                                      name: "In Transit Inventory",
                                      categoryGroup: "Forecast",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.forecastOutlook.inTransitInventory.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                    {
                                      name: "Prepaid Inventory",
                                      categoryGroup: "Forecast",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.forecastOutlook.prepaidInventory.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                    {
                                      name: "Accounts Payable",
                                      categoryGroup: "Forecast",
                                      categoryGroup1: "Inventory Assets",
                                      data: vers.financialOutlook.forecastOutlook.accountsPayable.map(
                                        (item: any) => {
                                          return { [item.value]: item.itemValue };
                                        }
                                      ),
                                    },
                                  ];
                                  let skus = vers.skuSupplyMaster.map(
                                    (supplySkuItem: any) => {
                                      let supplyArray = _.keyBy(
                                        supplySkuItem.expectedOh,
                                        "value"
                                      );
                                      delete supplySkuItem.sku.id;

                                      let skutoreturn = {
                                        ...supplySkuItem,
                                        ...supplySkuItem.sku,
                                        ...supplyArray,
                                        ...{
                                          supplier:
                                            supplySkuItem.supplierMaster
                                              .supplierName,
                                          fulfill:
                                            supplySkuItem.fulfillmentClient
                                              .fullfillmentName,
                                        },
                                      };

                                      return skutoreturn;
                                    }
                                  );
                                  if (!supplyMasterTableData) {
                                    setSupplyMasterTableData(vers.supplyMaster);
                                  }
                                  if (!purchaseOrderData) {
                                    let po = vers.purchaseOrders.purchaseOrders.map(
                                      (item: any) => {
                                        return item.data;
                                      }
                                    );
                                    let fore = vers.purchaseOrders.recommendedPurchaseOrders.map(
                                      (item: any) => {
                                        return item.data;
                                      }
                                    );
                                    setPurchaseOrderData({ po: po, fore: fore });
                                  }

                                  versions.push({
                                    financialOutlock: fullFillArray1,
                                    skuSupplyMaster: skus,
                                    versionName: vers.versionName,
                                    versionId: vers.id,
                                  });
                                });
                                setDemandFinancialData(versions);
                                editedCells = [];
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
                  publishSupply(
                    getClientId(),
                    currentSopVersions,
                    demandFinancialData[currentFinancial].versionId
                  ).then((res) => {
                    setSopVersions(res.data.supplyVersions);
                  });
                }}
              >
                Publish
              </Button>
              <Button
                type="rounded-outline"
                icon={<VerticalAlignTopOutlined />}
                size="small"
                onClick={() => {
                  setSpinner(true);
                  recal(
                    getClientId(),
                    currentSopVersions,
                    demandFinancialData[currentFinancial].versionId
                  ).then((res) => {
                    let versions: any = [];
                    res.data.recalcPoss.forEach((vers: any) => {
                      let fullFillArray1: any = [
                        {
                          name: "Finished Goods",
                          categoryGroup: "Goal",
                          categoryGroup1: "Inventory Assets",
                          data: vers.financialOutlook.goalsOutlook.finishedGoods.map(
                            (item: any) => {
                              return { [item.value]: item.itemValue };
                            }
                          ),
                        },
                        {
                          name: "Non Finished Goods",
                          categoryGroup: "Goal",
                          categoryGroup1: "Inventory Assets",
                          data: vers.financialOutlook.goalsOutlook.nonFinishedGoods.map(
                            (item: any) => {
                              return { [item.value]: item.itemValue };
                            }
                          ),
                        },
                        {
                          name: "In Transit Inventory",
                          categoryGroup: "Goal",
                          categoryGroup1: "Inventory Assets",
                          data: vers.financialOutlook.goalsOutlook.inTransitInventory.map(
                            (item: any) => {
                              return { [item.value]: item.itemValue };
                            }
                          ),
                        },
                        {
                          name: "Prepaid Inventory",
                          categoryGroup: "Goal",
                          categoryGroup1: "Inventory Assets",
                          data: vers.financialOutlook.goalsOutlook.prepaidInventory.map(
                            (item: any) => {
                              return { [item.value]: item.itemValue };
                            }
                          ),
                        },
                        {
                          name: "Accounts Payable",
                          categoryGroup: "Goal",
                          categoryGroup1: "Inventory Assets",
                          data: vers.financialOutlook.goalsOutlook.accountsPayable.map(
                            (item: any) => {
                              return { [item.value]: item.itemValue };
                            }
                          ),
                        },
                        {
                          name: "Finished Goods",
                          categoryGroup: "Forecast",
                          categoryGroup1: "Inventory Assets",
                          data: vers.financialOutlook.forecastOutlook.finishedGoods.map(
                            (item: any) => {
                              return { [item.value]: item.itemValue };
                            }
                          ),
                        },
                        {
                          name: "Non Finished Goods",
                          categoryGroup: "Forecast",
                          categoryGroup1: "Inventory Assets",
                          data: vers.financialOutlook.forecastOutlook.nonFinishedGoods.map(
                            (item: any) => {
                              return { [item.value]: item.itemValue };
                            }
                          ),
                        },
                        {
                          name: "In Transit Inventory",
                          categoryGroup: "Forecast",
                          categoryGroup1: "Inventory Assets",
                          data: vers.financialOutlook.forecastOutlook.inTransitInventory.map(
                            (item: any) => {
                              return { [item.value]: item.itemValue };
                            }
                          ),
                        },
                        {
                          name: "Prepaid Inventory",
                          categoryGroup: "Forecast",
                          categoryGroup1: "Inventory Assets",
                          data: vers.financialOutlook.forecastOutlook.prepaidInventory.map(
                            (item: any) => {
                              return { [item.value]: item.itemValue };
                            }
                          ),
                        },
                        {
                          name: "Accounts Payable",
                          categoryGroup: "Forecast",
                          categoryGroup1: "Inventory Assets",
                          data: vers.financialOutlook.forecastOutlook.accountsPayable.map(
                            (item: any) => {
                              return { [item.value]: item.itemValue };
                            }
                          ),
                        },
                      ];
                      let skus = vers.skuSupplyMaster.map((supplySkuItem: any) => {
                        let supplyArray = _.keyBy(supplySkuItem.expectedOh, "value");
                        delete supplySkuItem.sku.id;

                        let skutoreturn = {
                          ...supplySkuItem,
                          ...supplySkuItem.sku,
                          ...supplyArray,
                          ...{
                            supplier: supplySkuItem.supplierMaster.supplierName,
                            fulfill:
                              supplySkuItem.fulfillmentClient.fullfillmentName,
                          },
                        };

                        return skutoreturn;
                      });
                      if (!supplyMasterTableData) {
                        setSupplyMasterTableData(vers.supplyMaster);
                      }
                      if (!purchaseOrderData) {
                        let po = vers.purchaseOrders.purchaseOrders.map(
                          (item: any) => {
                            return item.data;
                          }
                        );
                        let fore = vers.purchaseOrders.recommendedPurchaseOrders.map(
                          (item: any) => {
                            return item.data;
                          }
                        );
                        setPurchaseOrderData({ po: po, fore: fore });
                      }

                      versions.push({
                        financialOutlock: fullFillArray1,
                        skuSupplyMaster: skus,
                        versionName: vers.versionName,
                        versionId: vers.id,
                      });
                    });
                    setDemandFinancialData(versions);
                    setCurrentFinancial(versions.length - 1);
                    editedCells = [];
                    setSpinner(false);
                  });
                }}
              >
                Recalculate
              </Button>
              {tableView == "Expected Inventory" && (
                <Button
                  type="rounded-outline"
                  icon={<NumberOutlined />}
                  size="small"
                  onClick={() => {
                    setSpinner(true);
                    getActualOh(getClientId()).then((res) => {
                      showModal();
                      setsupplyMasterActualsData(false);
                      financialeditedCells = [];
                      let actuals = demandFinancialData[
                        currentFinancial
                      ].skuSupplyMaster
                        ?.filter((sku: any) => sku.fulfill == actualFulfillview)
                        .map((item: any) => {
                          delete item.expectedOh;
                          let filtered = res.data.ohActuals.filter((item1: any) =>
                            item1.dateId.includes(actualDate)
                          );
                          let filteredFound = filtered.find(
                            (element: any) =>
                              element.fulfillmentClientId ==
                                item.fulfillmentClientId &&
                              element.skuId == item.skuId
                          );
                          if (filteredFound) {
                            item["expectedOh"] = filteredFound.expectedOh;
                            item["actualId"] = filteredFound.id;
                          } else {
                            item["expectedOh"] = null;
                            item["actualId"] = null;
                          }

                          return item;
                        });
                      setsupplyMasterActualsData(actuals);
                      setSpinner(false);
                    });
                  }}
                >
                  Add Actuals
                </Button>
              )}
            </>
          )}
          {/* <Button type="rounded-outline" icon={<BarChartOutlined />} size="small">
            Add Forecasted
          </Button> */}
          {/* <Dropdown overlay={menu} placement="bottomCenter">
            <Button type="rounded-outline" icon={<DownloadOutlined />} size="small">
              Download SKUs
            </Button>
          </Dropdown> */}
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
            POeditedCells = [];
          }}
          value={currentFinancial}
        >
          {demandFinancialData &&
            demandFinancialData.map((options: any, index: number) => {
              return <Option value={index}> {options.versionName}</Option>;
            })}
        </Select>
        <Select
          style={{ width: "190px" }}
          defaultValue="Supplier Master"
          placeholder="Select View"
          onChange={(value) => {
            // @ts-ignore
            if (value == "PO Recommendation") {
              if (!skuList.skuNames) {
                setSpinner(true);
                let skuNames: any = [];
                getSKUTable(getClientId()).then((res: any) => {
                  let skus: any = res.data.skuMaster.map((skuItem: any) => {
                    let objAttr = skuItem.attributes;

                    let skutoreturn = { ...skuItem, ...objAttr };
                    skuNames.push(skuItem.skuName);
                    return skutoreturn;
                  });
                  setSkuList({ skus: skus, skuNames: skuNames });
                  setSpinner(false);
                });
              }
            }
            let skuSuppliers: any = [];
            let skuFulfill: any = [];
            demandFinancialData[currentFinancial].skuSupplyMaster.forEach(
              (item: any) => {
                if (!skuSuppliers.includes(item.supplierMaster.supplierName)) {
                  skuSuppliers.push(item.supplierMaster.supplierName);
                }
                if (!skuFulfill.includes(item.fulfill)) {
                  skuFulfill.push(item.fulfill);
                }
              }
            );
            setFulfillList(skuFulfill);
            setSupplierList(skuSuppliers);

            // // @ts-ignore
            // if (value == "Financial Outlook" && !demandFinancialData) {
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
            POeditedCells = [];
            setKitAddType(false);
            setKitBomName(null);
            setKitBomTableData([]);
            setTableView(value);
          }}
        >
          {" "}
          <Option value="Financial Outlook">Financial Outlook</Option>
          <Option value="Supplier Master">Supplier Master</Option>
          <Option value="Expected Inventory">Expected Inventory</Option>
          <Option value="PO Recommendation">PO Recommendation</Option>
        </Select>
        {tableView == "PO Recommendation" && (
          <Button
            onClick={() => {
              let oldArray = purchaseOrderData.po;
              let oldArray1 = purchaseOrderData.fore;
              if (oldArray[0].poName) {
                setPurchaseOrderData(false);
                setTimeout(function () {
                  oldArray.unshift({
                    id: Math.random(),
                    poName: null,
                    expectedDeliveryDate: "yyyy-mm-ddT00:00:00.000Z",
                    orderCreateDate: "yyyy-mm-ddT00:00:00.000Z",
                    orderShipDate: "yyyy-mm-ddT00:00:00.000Z",
                    skuId: null,
                    amount: null,
                    cost: null,
                  });
                  setPurchaseOrderData({ po: oldArray, fore: oldArray1 });
                }, 0);
              } else {
                message.warning("Please fill the last added row!");
              }
            }}
            type="rounded-outline"
            icon={<NumberOutlined />}
            size="middle"
          >
            Add PO
          </Button>
        )}
        {tableView == "Supplier Master" && (
          <Button
            onClick={() => {
              let oldArray = supplyMasterTableData;
              if (oldArray[0].supplierName) {
                setSupplyMasterTableData(false);
                setTimeout(function () {
                  oldArray.unshift({
                    id: Math.random(),
                    supplierName: null,
                    clientId: "2",
                    orderLeadTime: null,
                    shippingLeadTime: null,
                    orderFrequency: null,
                    dueOnOrder: null,
                    dueOnShipment: null,
                    paymentTerms: null,
                    startDate: "yyyy-mm-ddT00:00:00.000Z",
                    endDate: "yyyy-mm-ddT00:00:00.000Z",
                  });
                  setSupplyMasterTableData(oldArray);
                }, 0);
              } else {
                message.warning("Please fill the last added row!");
              }
            }}
            type="rounded-outline"
            icon={<NumberOutlined />}
            size="middle"
          >
            Add Supplier
          </Button>
        )}
        {tableView == "Expected Inventory" && (
          <Select
            style={{ width: "150px" }}
            // defaultValue="Saddle Creek"
            value={fulfillview}
            placeholder="Select Channel"
            onChange={(value) => {
              setFulfillview(value);
            }}
          >
            <Option value="Saddle Creek">Saddle Creek</Option>
            <Option value="IDS">IDS</Option>
          </Select>
        )}
        {tableView == "Expected Inventory" && (
          <Select
            style={{ width: "150px" }}
            // defaultValue="Saddle Creek"
            value={supplierview}
            placeholder="Select Channel"
            onChange={(value) => {
              setSupplierview(value);
            }}
          >
            {supplyMasterTableData &&
              supplyMasterTableData.map((item: any) => (
                <Option value={item.supplierName}>{item.supplierName}</Option>
              ))}
          </Select>
        )}
        {tableView == "Expected Inventory" && (
          <Select
            style={{ width: "150px" }}
            defaultValue="expectedOh"
            placeholder="Select Channel"
            onChange={(value) => {
              setChannelView(value);
            }}
          >
            <Option value="expectedOh">Expected OH</Option>
            <Option value="palletPositions">Pallet Positions</Option>
            <Option value="daysOnHand">Days on Hand</Option>
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
  // demandFinancialData[currentFinancial].
  // financialOutlock: fullFillArray1,
  //           fullfilmentMatrix: fullFillArray,
  //           demandSkuMaster: skus,
  //           versionName: demand.versionName,
  return (
    <Spin spinning={!demandFinancialData || spinner} indicator={antIcon} delay={500}>
      <Page
        logout={() => {
          //  @ts-ignore
          props.logout();
        }}
        header={Header}
      >
        {tableView == "Supplier Master" && supplyMasterTableData && (
          <SkuTable
            cellEditFunc={handleCellEditDemandSku}
            data={supplyMasterTableData}
          />
        )}
        {tableView == "PO Recommendation" &&
          purchaseOrderData &&
          supplierList &&
          fulfillList &&
          skuList.skuNames && (
            <>
              <MasterBomTable
                className="roTable"
                onRowClicked={(obj: any) => {
                  let skuSuppliers: any = [];
                  let skuFulfill: any = [];
                  demandFinancialData[currentFinancial].skuSupplyMaster.forEach(
                    (item: any) => {
                      if (
                        !skuSuppliers.includes(item.supplierMaster.supplierName) &&
                        item.skuName == obj.data.skuName
                      ) {
                        skuSuppliers.push(item.supplierMaster.supplierName);
                      }
                      if (
                        !skuFulfill.includes(item.fulfill) &&
                        item.skuName == obj.data.skuName
                      ) {
                        skuFulfill.push(item.fulfill);
                      }
                    }
                  );
                  setFulfillList(skuFulfill);
                  setSupplierList(skuSuppliers);
                }}
                supplierList={supplierList}
                fulfillList={fulfillList}
                skuList={skuList.skuNames}
                cellEditFunc={handleCellEditPO}
                data={purchaseOrderData.po}
              />
              <RoTable
                className="roTable"
                onRowClicked={(obj: any) => {
                  let skuSuppliers: any = [];
                  let skuFulfill: any = [];
                  demandFinancialData[currentFinancial].skuSupplyMaster.forEach(
                    (item: any) => {
                      if (
                        !skuSuppliers.includes(item.supplierMaster.supplierName) &&
                        item.skuName == obj.data.skuName
                      ) {
                        skuSuppliers.push(item.supplierMaster.supplierName);
                      }
                      if (
                        !skuFulfill.includes(item.fulfill) &&
                        item.skuName == obj.data.skuName
                      ) {
                        skuFulfill.push(item.fulfill);
                      }
                    }
                  );
                  setFulfillList(skuFulfill);
                  setSupplierList(skuSuppliers);
                }}
                supplierList={supplierList}
                skuList={skuList.skuNames}
                cellEditFunc={handleCellEditPO}
                data={purchaseOrderData.fore}
              />
            </>
          )}

        {tableView == "Expected Inventory" && demandFinancialData && (
          <MasterTable
            cellEditFunc={handleCellEdit}
            filterView={channelView}
            data={demandFinancialData[currentFinancial].skuSupplyMaster
              ?.filter((sku: any) => sku.fulfill == fulfillview)
              .filter((sku: any) => sku.supplier == supplierview)
              .map((item: any) => {
                let vals = [
                  "Jun - 2021",
                  "Jul - 2021",
                  "Aug - 2021",
                  "Sep - 2021",
                  "Oct - 2021",
                  "Nov - 2021",
                  "Dec - 2021",
                  "Jan - 2022",
                  "Feb - 2022",
                  "Mar - 2022",
                  "Apr - 2022",
                  "May - 2022",
                ];
                vals.forEach((date) => [
                  (item[date].dataToShow = item[date][channelView]),
                ]);
                return item;
              })}
            // channelView == "Amazon"
            // ? demandSkuData[currentFinancial].demandSkuMaster?.filter(
            //     (sku: any) => sku.demandChannel.channelName == "Amazon"
            //   )
            // : channelView == "Retail"
            // ? demandSkuData[currentFinancial].demandSkuMaster?.filter(
            //     (sku: any) => sku.demandChannel.channelName == "Retail"
            //   )
            // : demandSkuData[currentFinancial].demandSkuMaster?.filter(
            //     (sku: any) => sku.demandChannel.channelName == "DTC"
            //   )
          />
        )}
        {tableView == "Financial Outlook" && demandFinancialData && (
          <SkuBomTable
            data={demandFinancialData[currentFinancial].financialOutlock}
          />
        )}

        <Modal
          footer={[]}
          title="Add Actuals"
          className="actualModal"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Radio.Group
            style={{ marginBottom: 10 }}
            options={options}
            onChange={(e) => {
              e.preventDefault();
              setActualFulfillview(e.target.value);
              setSpinner(true);
              getActualOh(getClientId()).then((res) => {
                setsupplyMasterActualsData(false);
                financialeditedCells = [];
                let actuals = demandFinancialData[currentFinancial].skuSupplyMaster
                  ?.filter((sku: any) => sku.fulfill == e.target.value)
                  .map((item: any) => {
                    delete item.expectedOh;
                    let filtered = res.data.ohActuals.filter((item1: any) =>
                      item1.dateId.includes(actualDate)
                    );
                    let filteredFound = filtered.find(
                      (element: any) =>
                        element.fulfillmentClientId == item.fulfillmentClientId &&
                        element.skuId == item.skuId
                    );
                    if (filteredFound) {
                      item["expectedOh"] = filteredFound.expectedOh;
                      item["actualId"] = filteredFound.id;
                    } else {
                      item["expectedOh"] = null;
                      item["actualId"] = null;
                    }

                    return item;
                  });
                setsupplyMasterActualsData(actuals);
                setSpinner(false);
              });
            }}
            value={actualFulfillview}
            optionType="button"
            buttonStyle="solid"
          />
          <DatePicker
            onChange={(value) => {
              let selectedDate = moment(value).format("YYYY-MM-DD");
              setActualDate(selectedDate);
              setSpinner(true);
              getActualOh(getClientId()).then((res) => {
                setsupplyMasterActualsData(false);
                financialeditedCells = [];
                let actuals = demandFinancialData[currentFinancial].skuSupplyMaster
                  ?.filter((sku: any) => sku.fulfill == actualFulfillview)
                  .map((item: any) => {
                    delete item.expectedOh;
                    let filtered = res.data.ohActuals.filter((item1: any) =>
                      item1.dateId.includes(selectedDate)
                    );
                    let filteredFound = filtered.find(
                      (element: any) =>
                        element.fulfillmentClientId == item.fulfillmentClientId &&
                        element.skuId == item.skuId
                    );
                    if (filteredFound) {
                      item["expectedOh"] = filteredFound.expectedOh;
                      item["actualId"] = filteredFound.id;
                    } else {
                      item["expectedOh"] = null;
                      item["actualId"] = null;
                    }

                    return item;
                  });
                setsupplyMasterActualsData(actuals);
                setSpinner(false);
              });
            }}
            defaultValue={moment(actualDate)}
            style={{ float: "right" }}
          />
          {supplyMasterActualsData && isModalVisible && (
            <KitBomTable
              dateSelected={actualDate}
              cellEditFunc={handleCellEditFinancial}
              data={supplyMasterActualsData && supplyMasterActualsData}
            />
          )}
          <Row style={{ marginTop: 10, float: "right" }}>
            <Col style={{ marginRight: 10 }}>
              <Button
                onClick={() => {
                  let datatosend = {
                    data: financialeditedCells,
                  };

                  if (financialeditedCells.length) {
                    setSpinner(true);
                    saveActualOh(datatosend).then((res) => {
                      handleCancel();
                      setSpinner(false);
                    });
                  } else {
                    message.warning("No cell was editted yet!");
                  }
                }}
                type="rounded-outline"
                icon={<NumberOutlined />}
                size="middle"
              >
                Save Actuals
              </Button>
            </Col>

            <Col>
              <Button
                onClick={() => {
                  handleCancel();
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
        </Modal>
      </Page>
      {contextHolder}
    </Spin>
  );
};

export default DemandPlanning;
