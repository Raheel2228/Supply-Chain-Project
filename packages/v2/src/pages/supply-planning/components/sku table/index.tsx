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
var fields1 = [
  // { name: "Supplier Name", field: "supplierName", edit: true },
  { name: "Order Lead Time", field: "orderLeadTime", edit: true, type: "string" },
  {
    name: "Shipping Lead Time",
    field: "shippingLeadTime",
    edit: true,
    type: "string",
  },
  { name: "Order Frequency", field: "orderFrequency", edit: true, type: "number" },
  { name: "Due On Order", field: "dueOnOrder", edit: true, type: "number" },
  { name: "Due On Shipment", field: "dueOnShipment", edit: true, type: "number" },
  { name: "Payment Terms", field: "paymentTerms", edit: true, type: "string" },
];
var fields2 = [
  { name: "Supplier Start Date", field: "startDate", edit: true, type: "string" },
  { name: "Supplier End Date", field: "endDate", edit: true, type: "string" },
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
          rowHeight={35}
          onCellEditingStopped={(event: any) => {
            if (event.newValue != event.oldValue) {
              let item = {
                id: event.data.id,
                clientId: event.data.clientId,
                supplierName: event.data.supplierName,
                orderLeadTime: event.data.orderLeadTime,
                shippingLeadTime: event.data.shippingLeadTime,
                orderFrequency: event.data.orderFrequency,
                dueOnOrder: event.data.dueOnOrder,
                dueOnShipment: event.data.dueOnShipment,
                paymentTerms: event.data.paymentTerms,
                startDate: event.data.startDate?.includes("T")
                  ? event.data.startDate
                  : event.data.startDate + "T00:00:00.000Z",
                endDate: event.data.endDate?.includes("T")
                  ? event.data.endDate
                  : event.data.endDate + "T00:00:00.000Z",
              };
              props.cellEditFunc(item);
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
          <AgGridColumn
            menuTabs={[]}
            lockPosition={true}
            // cellRenderer="rowNameCellRenderer"

            width={150}
            // minWidth={150}
            // maxWidth={150}
            pinned="left"
            editable={true}
            field={"supplierName"}
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
            headerName={"Supplier Name"}
            columnGroupShow="open"
          />
          {fields1.map((field) => {
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
