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
  addKit,
  updateKit,
  saveSkuMaster,
} from "../../helpers/portfolio.services";
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
        SKU Master
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
let dataCashFlow: any;
let dataBalanceSheet: any;
let dataProfitLoss: any;
let editedCells: any = [];
const PortfolioPlanning: FC = (props) => {
  const {
    skuTableData,
    setSkuTableData,
    masterTableData,
    setMasterTableData,
    kitBomName,
    setKitBomName,
    kitAddType,
    setKitAddType,
    kitBomTableData,
    setKitBomTableData,
    setDemandSkuData,
  } = useContext(PortfolioContext);
  const [tableView, setTableView] = useState("SKU Master");
  const [form] = Form.useForm();
  const [currentFinancial, setCurrentFinancial] = useState(0);

  const [extraColumnsSku, setExtraColumnsSku] = useState([]);
  const [extraColumnsMaster, setExtraColumnsMaster] = useState([]);

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
          });
        });
        setDemandSkuData(versions);
        editedCells = [];
        setSpinner(false);
      });
      setExtraColumnsSku(res.data.attributes);
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
  const handleCellEdit = (cell: any) => {
    const index = editedCells.findIndex((e: any) => e.id === cell.id);

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
    if (!skuTableData) {
      // dataCashFlow = [];
      // dataBalanceSheet = [];
      // dataProfitLoss = [];
      // let myData: any;
      getSKUTable(getClientId()).then((res: any) => {
        let skus = res.data.skuMaster.map((skuItem: any) => {
          let objAttr = skuItem.attributes;

          let skutoreturn = { ...skuItem, ...objAttr };

          return skutoreturn;
        });
        setExtraColumnsSku(res.data.attributes);
        setSkuTableData({ skus: skus, attr: res.data.attributes });
      });
    }
    if (skuTableData) {
      setExtraColumnsSku(skuTableData.attr);
    }
    if (masterTableData) {
      setExtraColumnsMaster(masterTableData.attr);
    }
  }, []);

  const Header = (
    <HeaderWrapper>
      <TopBar>
        <PageTitle>Portfolio Planning</PageTitle>
        <ActionItems>
          <Button
            onClick={() => {
              let datatosend = {
                data: editedCells,
              };
              if (editedCells.length) {
                // setFinancialTableData(false);
                setSpinner(true);
                saveSkuMaster(datatosend).then((res) => {
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
                          data: demand.financialEstimations[0].marketingSpendGoal,
                        },
                        {
                          name: "Marketing Spend Forecast",
                          data:
                            demand.financialEstimations[0].marketingSpendForecast,
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
            icon={<NumberOutlined />}
            size="small"
            onClick={() => {
              showModal();
            }}
          >
            Add SKUs
          </Button>
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
          defaultValue="SKU Master"
          placeholder="Select View"
          onChange={(value) => {
            if (value !== "SKU Master" && !masterTableData) {
              setSpinner(true);
              let skuKitsObj: any = [];
              let skuKitsObj2: any = [];
              getMasterTable(getClientId()).then((res: any) => {
                res.data.skuKits.forEach((skuKitItem: any) => {
                  skuKitItem.skus.forEach((skuItem: any) => {
                    let objAttr = skuItem.attributes;
                    skuItem["Kitname"] = skuKitItem.skuName;
                    let skutoreturn = { ...skuItem, ...objAttr };

                    skuKitsObj.push(skutoreturn);
                  });
                  skuKitsObj2.push(skuKitItem);
                });

                setExtraColumnsMaster(res.data.attributes);
                setMasterTableData({
                  skukits: skuKitsObj,
                  skubomkits: skuKitsObj2,
                  attr: res.data.attributes,
                });
                setSpinner(false);
              });
            }
            setKitAddType(false);
            setKitBomName(null);
            setKitBomTableData([]);
            setTableView(value);
          }}
        >
          <Option value="SKU Master">SKU/Kit Master</Option>
          {/* <Option value="Kit Master">Kit Master</Option> */}
          <Option value="SKU KIT Conversion">SKU KIT Conversion</Option>
        </Select>
        {tableView == "SKU KIT Conversion" && (
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

            <Row>
              <Col>
                <Button
                  hidden={kitBomName == null}
                  onClick={() => {
                    if (kitBomName == "") {
                      message.error(`Please add a name for sku kit`);
                    } else {
                      setSpinner(true);
                      if (kitAddType == false) {
                        addKit({
                          name: kitBomName,
                          description: "kit description",
                          clientId: "2",
                          skus: kitBomTableData,
                        })
                          .then((res) => {
                            let skuKitsObj: any = [];
                            let skuKitsObj2: any = [];
                            res.data.skuKits.forEach((skuKitItem: any) => {
                              skuKitItem.skus.forEach((skuItem: any) => {
                                let objAttr = skuItem.attributes;
                                skuItem["Kitname"] = skuKitItem.skuName;
                                let skutoreturn = { ...skuItem, ...objAttr };

                                skuKitsObj.push(skutoreturn);
                              });
                              skuKitsObj2.push(skuKitItem);
                            });

                            setExtraColumnsMaster(res.data.attributes);
                            setMasterTableData({
                              skukits: skuKitsObj,
                              skubomkits: skuKitsObj2,
                              attr: res.data.attributes,
                            });
                            setKitAddType(false);
                            setKitBomName(null);
                            setKitBomTableData([]);
                            message.success("Kit added successfully");
                            getSKUTable(getClientId()).then((res: any) => {
                              let skus = res.data.skuMaster.map((skuItem: any) => {
                                let objAttr = skuItem.attributes;

                                let skutoreturn = { ...skuItem, ...objAttr };

                                return skutoreturn;
                              });
                              setExtraColumnsSku(res.data.attributes);
                              setSkuTableData({
                                skus: skus,
                                attr: res.data.attributes,
                              });
                              setSpinner(false);
                            });
                          })
                          .catch((error) => {
                            message.error(`Please use a unique name for sku kit`);
                            setSpinner(false);
                          });
                      } else {
                        updateKit({
                          kitId: kitAddType,
                          data: {
                            data: {
                              name: kitBomName,
                              skus: kitBomTableData,
                            },
                          },
                        })
                          .then((res) => {
                            let skuKitsObj: any = [];
                            let skuKitsObj2: any = [];
                            res.data.skuKits.forEach((skuKitItem: any) => {
                              skuKitItem.skus.forEach((skuItem: any) => {
                                let objAttr = skuItem.attributes;
                                skuItem["Kitname"] = skuKitItem.skuName;
                                let skutoreturn = { ...skuItem, ...objAttr };

                                skuKitsObj.push(skutoreturn);
                              });
                              skuKitsObj2.push(skuKitItem);
                            });

                            setExtraColumnsMaster(res.data.attributes);
                            setMasterTableData({
                              skukits: skuKitsObj,
                              skubomkits: skuKitsObj2,
                              attr: res.data.attributes,
                            });
                            setKitAddType(false);
                            setKitBomName(null);
                            setKitBomTableData([]);
                            message.success("Kit updated successfully");
                            setSpinner(false);
                          })
                          .catch((error) => {
                            message.error(`Please use a unique name for sku kit`);
                            setSpinner(false);
                          });
                      }
                    }
                  }}
                  type="rounded-outline"
                  icon={<SaveOutlined />}
                  size="middle"
                  color={palette.grass}
                >
                  Save
                </Button>
              </Col>
            </Row>
          </>
        )}
      </FilterBar>
    </HeaderWrapper>
  );

  return (
    <Spin spinning={!skuTableData || spinner} indicator={antIcon} delay={500}>
      <Page
        logout={() => {
          //  @ts-ignore
          props.logout();
        }}
        header={Header}
      >
        {tableView == "SKU Master" && skuTableData && (
          <SkuTable
            cellEditFunc={handleCellEdit}
            data={
              skuTableData.skus
              // tableView == "SKU Master"
              //   ? financialTableData[currentFinancial].dataBalanceSheet
              //   : tableView == "Cash Flow"
              //   ? financialTableData[currentFinancial].dataCashFlow
              //   : financialTableData[currentFinancial].dataProfitLoss
            }
            extraColumns={extraColumnsSku}
          />
        )}
        {/* {tableView == "Kit Master" && masterTableData && (
          <MasterTable
            cellEditFunc={handleCellEdit}
            data={
              masterTableData.skubomkits
              // tableView == "SKU Master"
              //   ? financialTableData[currentFinancial].dataBalanceSheet
              //   : tableView == "Cash Flow"
              //   ? financialTableData[currentFinancial].dataCashFlow
              //   : financialTableData[currentFinancial].dataProfitLoss
            }
            extraColumns={extraColumnsMaster}
          />
        )} */}
        {tableView == "SKU KIT Conversion" && skuTableData && masterTableData && (
          <Row
            gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
            style={{ height: "calc(100% - 15px)" }}
          >
            <Col className="gutter-row" span={5}>
              <MasterBomTable
                cellEditFunc={handleCellEdit}
                data={
                  masterTableData.skubomkits
                  // tableView == "SKU Master"
                  //   ? financialTableData[currentFinancial].dataBalanceSheet
                  //   : tableView == "Cash Flow"
                  //   ? financialTableData[currentFinancial].dataCashFlow
                  //   : financialTableData[currentFinancial].dataProfitLoss
                }
                extraColumns={extraColumnsMaster}
              />
            </Col>
            <Col className="gutter-row" span={7}>
              <KitBomTable
                cellEditFunc={handleCellEdit}
                data={
                  kitBomTableData
                  // tableView == "SKU Master"
                  //   ? financialTableData[currentFinancial].dataBalanceSheet
                  //   : tableView == "Cash Flow"
                  //   ? financialTableData[currentFinancial].dataCashFlow
                  //   : financialTableData[currentFinancial].dataProfitLoss
                }
                extraColumns={extraColumnsSku}
              />
            </Col>
            <Col className="gutter-row" span={12}>
              <SkuBomTable
                cellEditFunc={handleCellEdit}
                data={
                  skuTableData.skus.filter((sku: any) => sku.skuType == "SKU")
                  // tableView == "SKU Master"
                  //   ? financialTableData[currentFinancial].dataBalanceSheet
                  //   : tableView == "Cash Flow"
                  //   ? financialTableData[currentFinancial].dataCashFlow
                  //   : financialTableData[currentFinancial].dataProfitLoss
                }
                extraColumns={extraColumnsSku}
              />
            </Col>
          </Row>
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
    </Spin>
  );
};

export default PortfolioPlanning;
