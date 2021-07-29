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
var fields = [
  // { name: "Weight (lbs)", field: "Weight (lbs)" },
  // { name: "Sales Start", field: "saleStart" },
  { name: "Suppliers", field: "suppliers" },
  { name: "Channel", field: "channelName" },
  { name: "Fulfillment Center", field: "fulfillmentCenter" },
];
var fields1 = [
  { name: "SKU Name", field: "skuName", edit: true },
  { name: "SKU Description", field: "skuDescription", edit: true },
  { name: "Type", field: "skuType", edit: false },
  // { name: "Stock", field: "inStock" },
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
        style={{ width: "auto", height: "calc(100% - 70px)" }} //to be change to 15
        className="ag-theme-alpine"
      >
        {/* <div
         style={searchDivStyle}
         > */}
        <Input
          // type="search"
          // style={searchStyle}
          style={{
            marginBottom: 10,
          }}
          onChange={onFilterTextChange}
          placeholder="search somethings..."
        />
        {/* </div> */}
        <AgGridReact
          rowHeight={35}
          onCellEditingStopped={(event: any) => {
            if (event.newValue != event.oldValue) {
              let item = {
                id: event.data.id,
                values: {
                  skuName: event.data.skuName ? event.data.skuName : "",
                  skuDescription: event.data.skuDescription
                    ? event.data.skuDescription
                    : "",
                  skuType: event.data.skuType ? event.data.skuType : "",
                  defaultPrice: event.data.defaultPrice
                    ? event.data.defaultPrice
                    : 0,
                  defaultCost: event.data.defaultCost ? event.data.defaultCost : 0,
                  inStock: event.data.inStock ? event.data.inStock : 0,
                  weight: event.data.weight ? event.data.weight : 0,
                  defaultUnitsPerCase: event.data.defaultUnitsPerCase
                    ? event.data.defaultUnitsPerCase
                    : 0,
                  defaultUnitsPerPallet: event.data.defaultUnitsPerPallet
                    ? event.data.defaultUnitsPerPallet
                    : 0,
                  saleStart: event.data.saleStart?.includes("T")
                    ? event.data.saleStart
                    : event.data.saleStart + "T00:00:00.000Z",
                  saleEnd: event.data.saleEnd?.includes("T")
                    ? event.data.saleEnd
                    : event.data.saleEnd + "T00:00:00.000Z",
                  channelName: event.data.channelName ? event.data.channelName : "",
                  suppliers: event.data.suppliers ? event.data.suppliers : "",
                  fulfillmentCenter: event.data.fulfillmentCenter
                    ? event.data.fulfillmentCenter
                    : "",
                },
              };
              if (!event.data.saleStart) {
                delete item.values.saleStart;
              }
              if (!event.data.saleEnd) {
                delete item.values.saleEnd;
              }
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
          {fields1.map((field) => {
            return (
              <AgGridColumn
                menuTabs={[]}
                lockPosition={true}
                // cellRenderer="rowNameCellRenderer"

                width={150}
                // minWidth={150}
                // maxWidth={150}
                pinned="left"
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
                columnGroupShow="open"
              />
            );
          })}
          <AgGridColumn
            menuTabs={[]}
            lockPosition={true}
            type="number"
            // cellRenderer="rowNameCellRenderer"
            field={"inStock"}
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
            headerName={"Stock"}
            columnGroupShow="open"
          />
          <AgGridColumn
            menuTabs={[]}
            lockPosition={true}
            type="number"
            cellRenderer="rowNameCellRenderer"
            field={"defaultPrice"}
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
            headerName={"Default Price"}
            columnGroupShow="open"
          />
          <AgGridColumn
            menuTabs={[]}
            lockPosition={true}
            cellRenderer="rowNameCellRenderer"
            field={"defaultCost"}
            type="number"
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
            headerName={"Default Cost"}
            columnGroupShow="open"
          />
          <AgGridColumn
            menuTabs={[]}
            lockPosition={true}
            field={"weight"}
            type="number"
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
            headerName={"Weight (lbs)"}
            columnGroupShow="open"
          />
          <AgGridColumn
            menuTabs={[]}
            lockPosition={true}
            field={"defaultUnitsPerCase"}
            type="number"
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
            headerName={"Case size"}
            columnGroupShow="open"
          />
          <AgGridColumn
            menuTabs={[]}
            lockPosition={true}
            field={"defaultUnitsPerPallet"}
            type="number"
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
            headerName={"Pallet size"}
            columnGroupShow="open"
          />
          {fields.map((field) => {
            return (
              <AgGridColumn
                menuTabs={[]}
                lockPosition={true}
                // cellRenderer="rowNameCellRenderer"
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
                columnGroupShow="open"
              />
            );
          })}

          <AgGridColumn
            menuTabs={[]}
            lockPosition={true}
            // cellRenderer="dateCellRenderer"
            field={"saleStart"}
            valueGetter={(params) => {
              return params.data.saleStart?.split("T")[0];
            }}
            // valueSetter={(params) => {
            //   if (params.data[field + " - " + date.getFullYear()]) {
            //     params.data[field + " - " + date.getFullYear()].value =
            //       params.newValue;
            //   }
            //   return true;
            // }}
            headerName={"Sales Start"}
            columnGroupShow="open"
          />
          <AgGridColumn
            menuTabs={[]}
            lockPosition={true}
            // cellRenderer="dateCellRenderer"
            field={"saleEnd"}
            valueGetter={(params) => {
              return params.data.saleEnd?.split("T")[0];
            }}
            // valueSetter={(params) => {
            //   if (params.data[field + " - " + date.getFullYear()]) {
            //     params.data[field + " - " + date.getFullYear()].value =
            //       params.newValue;
            //   }
            //   return true;
            // }}
            headerName={"Sales End"}
            columnGroupShow="open"
          />
          {props.extraColumns.map((field: any) => {
            return (
              <AgGridColumn
                editable={false}
                menuTabs={[]}
                lockPosition={true}
                // cellRenderer="rowNameCellRenderer"
                field={field}
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
                headerName={field}
                columnGroupShow="open"
              />
            );
          })}
        </AgGridReact>
      </div>
    </div>
  );
}

export default Table;
