import React, { useState } from "react";
import { render } from "react-dom";
import { AgGridReact, AgGridColumn } from "ag-grid-react";
import { Input } from "antd";
import "ag-grid-enterprise";
import "./index.css";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import GroupRowInnerRenderer from "./Renderers/groupRowInnerRenderer";
import rowNameCellRenderer from "./Renderers/rowNameCellRenderer";
import dateCellRenderer from "./Renderers/dateCellRenderer";
// "supplierName": "Flex Coorp",
// "orderLeadTime": "45",
// "shippingLeadTime": "30",
// "orderFrequency": 30,
// "dueOnOrder": 45,
// "dueOnShipment": 55,
// "paymentTerms": "30",
// "startDate": "2021-06-15T14:48:05.639Z",
// "endDate": "2021-06-30T14:48:05.639Z"
// {
//   "name": "First Order",
//   "data": {
//       "id": 1,
//       "poName": "First Order",
//       "expectedDeliveryDate": "2021-06-15T14:48:05.639Z",
//       "fulfillmentCenterId": 1,
//       "orderCreateDate": "2021-06-15T14:48:05.639Z",
//       "orderShipDate": "2021-06-15T14:48:05.639Z",
//       "supplierMasterId": 1,
//       "skuId": 195,
//       "amount": 7500,
//       "cost": 2500,
//       "lineItemId": 1
//   }
// }
var fields1 = [
  {
    name: "SKU Name",
    field: "skuName",
    edit: false,
    type: "string",
  },
  {
    name: "Supplier Name",
    field: "supplierMaster",
    edit: false,
    type: "string",
  },
  { name: "Amount", field: "amount", edit: false, type: "number" },
  { name: "Cost", field: "cost", edit: false, type: "number" },
];
var fields2 = [
  {
    name: "Order Create Date",
    field: "orderCreateDate",
    edit: false,
    type: "string",
  },
  { name: "Order Ship Date", field: "orderShipDate", edit: false, type: "string" },
  {
    name: "Expected Delivery",
    field: "expectedDeliveryDate",
    edit: false,
    type: "string",
  },
];
var date = new Date();
function Table(props: any) {
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [rowData, setRowData] = useState([]);
  const onGridReady = (params: any) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);

    setRowData(props.data);
  };
  const searchDivStyle = { padding: 10 };
  const searchStyle = {
    width: "100%",
    padding: "10px 20px",
    borderRadius: 20,
    outline: 0,
    border: "2px #68bf40 solid",
    fontSize: "100%",
  };

  const onFilterTextChange = (e: any) => {
    // @ts-ignore: Object is possibly 'null'.
    gridApi.setQuickFilter(e.target.value);
  };

  return (
    <div style={{ height: "100%" }}>
      <div
        id="myGrid"
        style={{ width: "auto", height: "calc(100% - 15px)" }} //to be change to 15
        className="ag-theme-alpine"
      >
        {/* <div
         style={searchDivStyle}
         > */}
        {/* <Input
          // type="search"
          // style={searchStyle}
          style={{
            marginBottom: 10,
          }}
          onChange={onFilterTextChange}
          placeholder="search somethings..."
        /> */}
        {/* </div> */}
        <AgGridReact
          onRowClicked={(event) => {
            props.onRowClicked(event);
          }}
          onCellValueChanged={(event) => {
            props.onRowClicked(event);
          }}
          rowHeight={35}
          onCellEditingStopped={(event: any) => {
            if (event.newValue != event.oldValue) {
              // if (event.data.id) {
              let item = {
                id: event.data.id < 1 ? event.data.id : event.data.lineItemId,
                poName: event.data.poName,
                expectedDeliveryDate: event.data.expectedDeliveryDate?.includes("T")
                  ? event.data.expectedDeliveryDate
                  : event.data.expectedDeliveryDate + "T00:00:00.000Z",
                orderCreateDate: event.data.orderCreateDate?.includes("T")
                  ? event.data.orderCreateDate
                  : event.data.orderCreateDate + "T00:00:00.000Z",
                orderShipDate: event.data.orderShipDate?.includes("T")
                  ? event.data.orderShipDate
                  : event.data.orderShipDate + "T00:00:00.000Z",
                skuName: event.data.skuName,
                amount: event.data.amount,
                cost: event.data.cost,
                supplierMaster: event.data.supplierMaster,
              };
              props.cellEditFunc(item);
              // } else {
              //   let item = {
              //     id: Math.random(),
              //     poName: event.data.poName,
              //     expectedDeliveryDate: event.data.expectedDeliveryDate?.includes(
              //       "T"
              //     )
              //       ? event.data.expectedDeliveryDate
              //       : event.data.expectedDeliveryDate + "T00:00:00.000Z",
              //     orderCreateDate: event.data.orderCreateDate?.includes("T")
              //       ? event.data.orderCreateDate
              //       : event.data.orderCreateDate + "T00:00:00.000Z",
              //     orderShipDate: event.data.orderShipDate?.includes("T")
              //       ? event.data.orderShipDate
              //       : event.data.orderShipDate + "T00:00:00.000Z",
              //     skuName: event.data.skuName,
              //     amount: event.data.amount,
              //     cost: event.data.cost,
              //     supplierMaster: event.data.supplierMaster,
              //   };
              //   props.cellEditFunc(item);
              // }

              // let item = {
              //   id: event.data.id,
              //   supplierName: event.data.supplierName,
              //   orderLeadTime: event.data.orderLeadTime,
              //   shippingLeadTime: event.data.shippingLeadTime,
              //   orderFrequency: event.data.orderFrequency,
              //   dueOnOrder: event.data.dueOnOrder,
              //   dueOnShipment: event.data.dueOnShipment,
              //   paymentTerms: event.data.paymentTerms,
              // startDate: event.data.startDate?.includes("T")
              //   ? event.data.startDate
              //   : event.data.startDate + "T00:00:00.000Z",
              //   endDate: event.data.endDate?.includes("T")
              //     ? event.data.endDate
              //     : event.data.endDate + "T00:00:00.000Z",
              // };
            }
          }}
          defaultColDef={{
            flex: 1,
            minWidth: 150,
            resizable: true,
            editable: true,
          }}
          columnTypes={{
            number: {
              editable: true,
              valueParser: function (params) {
                return parseInt(params.newValue);
              },
              aggFunc: "sum",
            },
          }}
          groupUseEntireRow={true}
          frameworkComponents={{
            groupRowInnerRenderer: GroupRowInnerRenderer,
            rowNameCellRenderer: rowNameCellRenderer,
            dateCellRenderer: dateCellRenderer,
          }}
          groupRowRendererParams={{
            innerRenderer: "groupRowInnerRenderer",
            suppressCount: true,
          }}
          onGridReady={onGridReady}
          rowData={props.data}
        >
          {/* <AgGridColumn
            // lockPosition={true}
            // columnGroupShow="open"
            field="hierachyEntryName"
            rowGroup={true}
            hide={true}
          /> */}
          {/* <AgGridColumn
            menuTabs={[]}
            lockPosition={true}
            width={350}
            minWidth={350}
            maxWidth={350}
            resizable={false}
            headerName="SKU Name"
            pinned="left"
            field="skuName"
          /> */}
          {/* 
          <AgGridColumn
            field="supplierName"
            editable={true}
            // cellRenderer="genderCellRenderer"
            cellEditor="agRichSelectCellEditor"
            cellEditorParams={{
              // cellRenderer: 'genderCellRenderer',
              cellHeight: 30,
              values: props.supplierList,
            }}
          /> */}
          {fields1.map((field) => {
            return (
              <AgGridColumn
                menuTabs={[]}
                lockPosition={true}
                cellEditor={
                  field.name.includes("Name") && !field.name.includes("PO")
                    ? "agRichSelectCellEditor"
                    : ""
                }
                cellEditorParams={
                  field.name.includes("Name") &&
                  !field.name.includes("PO") && {
                    cellHeight: 30,
                    values: field.name.includes("SKU")
                      ? props.skuList
                      : props.supplierList,
                  }
                }
                width={150}
                editable={field.edit}
                field={field.field}
                headerName={field.name}
                type={field.type}
                columnGroupShow="open"
              />
            );
          })}
          {fields2.map((field) => {
            return (
              <AgGridColumn
                menuTabs={[]}
                lockPosition={true}
                // cellRenderer="rowNameCellRenderer"

                width={150}
                // minWidth={150}
                // maxWidth={150}
                // pinned="left"
                editable={field.edit}
                field={field.field}
                valueGetter={(params) => {
                  return params.data[field.field]?.split("T")[0];
                }}
                headerName={field.name}
                type={field.type}
                columnGroupShow="open"
              />
            );
          })}

          {/* <AgGridColumn
            menuTabs={[]}
            lockPosition={true}
            type="number"
            width={150}
            // minWidth={150}
            // maxWidth={150}
            pinned="left"
            cellRenderer="rowNameCellRenderer"
            field={"channelPrice"}
            // valueGetter={(params) => {
            //   return params.data[field + " - " + date.getFullYear()]?.value;
            // }}
            // valueSetter={(params) => {
            //   if (params.data[field + " - " + date.getFullYear()]) {
            //     params.data[field + " - " + date.getFullYear()].value =
            //       params.newValue;
            //   }
            //   return true;
            // }}
            headerName={"Price"}
            columnGroupShow="open"
          /> */}
        </AgGridReact>
      </div>
    </div>
  );
}

export default Table;
