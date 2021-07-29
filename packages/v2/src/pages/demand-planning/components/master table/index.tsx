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
var fields = [
  { name: "Saddle Creek", field: "Saddle Creek" },
  { name: "IDS", field: "IDS" },
  // { name: "Total", field: "abc" },
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
        {/* </div> */}
        <AgGridReact
          rowHeight={35}
          suppressAggFuncInHeader={true}
          onCellEditingStopped={(event: any) => {
            if (event.newValue != event.oldValue) {
              let item = {
                id: event.data[event.colDef.field].id,
                percentOfOrders: event.data[event.colDef.field].percentOfOrders,
              };
              props.cellEditFunc(item);
            }
          }}
          defaultColDef={{
            flex: 1,
            minWidth: 150,
            resizable: true,
            // editable: true,
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
            field={"channelName"}
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
            headerName={"Channel Name"}
            columnGroupShow="open"
          />
          {fields.map((field) => {
            return (
              <AgGridColumn
                menuTabs={[]}
                lockPosition={true}
                cellRenderer="rowNameCellRenderer"
                field={field.field}
                valueGetter={(params) => {
                  return params.data[field.field]?.percentOfOrders;
                }}
                valueSetter={(params) => {
                  if (params.data[field.field]) {
                    params.data[field.field].percentOfOrders = params.newValue;
                  }
                  return true;
                }}
                type="number"
                headerName={field.name}
                columnGroupShow="open"
              />
            );
          })}
          <AgGridColumn
            cellRenderer="rowNameCellRenderer"
            headerName="Total"
            colId="percentTotal"
            editable={false}
            valueGetter={ratioValueGetter}
          />
          {/* <AgGridColumn
            menuTabs={[]}
            editable={false}
            lockPosition={true}
            cellRenderer="rowNameCellRenderer"
            field={"total"}
            // valueGetter={(params) => {
            //   return params.data[field.field]?.percentOfOrders;
            // }}
            // valueSetter={(params) => {
            //   if (params.data[field.field]) {
            //     params.data[field.field].percentOfOrders = params.newValue;
            //   }
            //   return true;
            // }}
            type="number"
            headerName={"Total"}
            columnGroupShow="open"
          /> */}
        </AgGridReact>
      </div>
    </div>
  );
}
function ratioValueGetter(params: any) {
  let sum = 0;
  fields.forEach((item) => {
    console.log(item.field, params.data[item.field]?.percentOfOrders);
    sum = sum + params.data[item.field]?.percentOfOrders;
  });
  return sum;
}
// function ratioAggFunc(params:any) {
//   var goldSum = 0;
//   var silverSum = 0;
//   params.values.forEach(function (value:any) {
//     if (value && value.gold) {
//       goldSum += value.gold;
//     }
//     if (value && value.silver) {
//       silverSum += value.silver;
//     }
//   });
//   return createValueObject(goldSum, silverSum);
// }

export default Table;
