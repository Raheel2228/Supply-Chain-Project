import React, { useState } from "react";
import { render } from "react-dom";
import { AgGridReact, AgGridColumn } from "ag-grid-react";
import "ag-grid-enterprise";
import "./index.css";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import GroupRowInnerRenderer from "./Renderers/groupRowInnerRenderer";
import rowNameCellRenderer from "./Renderers/rowNameCellRenderer";
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
  function cellStyle(params: any) {
    if (props.tableView.includes("Goals")) {
      return { color: "#146A94" };
    } else if (props.tableView.includes("Actuals")) {
      return { color: "black" };
    } else {
      let arr = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      if (arr.includes(params.colDef.headerName.split(" ")[0])) {
        return { color: "#146A94" };
      } else {
        return { color: "black" };
      }
    }
  }
  return (
    <div style={{ height: "100%" }}>
      <div
        id="myGrid"
        style={{ width: "auto", height: "calc(100% - 15px)" }}
        className="ag-theme-alpine"
      >
        <AgGridReact
          rowHeight={35}
          onCellEditingStopped={(event: any) => {
            if (
              event.newValue != event.oldValue &&
              event.data[event.colDef.headerName] &&
              event.data[event.colDef.headerName].id !== ""
            ) {
              let item = {
                itemValue: event.newValue,
                itemId: event.data[event.colDef.headerName].id,
                entity: event.data.entity,
              };
              props.cellEditFunc(item);
            }
          }}
          defaultColDef={{
            flex: 1,
            minWidth: 150,
            // resizable: true,
            editable: true,
            sortable: true,
          }}
          // columnTypes={{
          //   number: {
          //     editable: true,
          //     valueParser: function (params) {
          //       return parseInt(params.newValue);
          //     },
          //     aggFunc: "sum",
          //   },
          // }}
          // groupUseEntireRow={true}
          autoGroupColumnDef={{
            pinned: "left",
            headerName: "Categories",
            field: "catName",
            minWidth: 350,
          }}
          frameworkComponents={{
            groupRowInnerRenderer: GroupRowInnerRenderer,
            rowNameCellRenderer: rowNameCellRenderer,
          }}
          groupRowRendererParams={{
            innerRenderer: "groupRowInnerRenderer",
            suppressCount: true,
          }}
          // onGridReady={onGridReady}
          // rowData={props.data}
          // defaultColDef={{
          //   flex: 1,
          //   minWidth: 150,
          //   // filter: true,
          //   sortable: true,
          //   // resizable: true,
          // }}
          // groupUseEntireRow={false}
          enableRangeSelection={true}
          suppressAggFuncInHeader={true}
          aggFuncs={{
            sum: sumFunction,
          }}
          animateRows={true}
          onGridReady={onGridReady}
          rowData={props.data}
        >
          {/* <AgGridColumn
            lockPosition={true}
            columnGroupShow="open"
            field="categoryGroup"
            rowGroup={true}
            hide={true}
          />
          <AgGridColumn
            menuTabs={[]}
            lockPosition={true}
            width={350}
            minWidth={350}
            maxWidth={350}
            resizable={false}
            headerName="Categories"
            pinned="left"
            field="catName"
          /> */}

          {/* <AgGridColumn
            menuTabs={[]}
            lockPosition={true}
            width={350}
            minWidth={350}
            maxWidth={350}
            resizable={false}
            headerName="Categories"
            pinned="left"
            field="catName"
          /> */}
          <AgGridColumn
            // lockPosition={true}
            columnGroupShow="open"
            field="thirdCategoryGroup"
            rowGroup={true}
            hide={true}
          />
          <AgGridColumn
            // lockPosition={true}
            columnGroupShow="open"
            field="categoryGroup"
            rowGroup={true}
            hide={true}
          />

          {/* <AgGridColumn
            // lockPosition={true}
            columnGroupShow="open"
            field="cashId"
            rowGroup={true}
            hide={true}
          /> */}
          {months.map((month) => {
            return (
              <AgGridColumn
                cellStyle={cellStyle}
                menuTabs={[]}
                lockPosition={true}
                cellRenderer="rowNameCellRenderer"
                valueGetter={(params) => {
                  return params?.data
                    ? params.data[month + " - " + date.getFullYear()]?.value
                      ? params.data[month + " - " + date.getFullYear()]?.value
                      : ""
                    : "";
                }}
                valueSetter={(params) => {
                  if (params.data[month + " - " + date.getFullYear()]) {
                    params.data[month + " - " + date.getFullYear()].value =
                      params.newValue;
                  }
                  return true;
                }}
                headerName={month + " - " + date.getFullYear()}
                aggFunc="sum"
                enableValue={true}
              />
            );
          })}
        </AgGridReact>
      </div>
    </div>
  );
}

function sumFunction(params: any) {
  var result = 0;
  params.values.forEach(function (value: any) {
    result += Number(value);
  });
  return result;
}
export default Table;
