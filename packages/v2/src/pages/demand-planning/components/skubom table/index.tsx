import React, { useState } from "react";
import { render } from "react-dom";
import { AgGridReact, AgGridColumn } from "ag-grid-react";
import "ag-grid-enterprise";
import "./index.css";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import GroupRowInnerRenderer from "./Renderers/groupRowInnerRenderer";
import rowNameCellRenderer from "./Renderers/rowNameCellRenderer";
let extraColumns = [
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
            if (event.newValue != event.oldValue) {
              let objToPush;
              event.data.data.forEach((item: any) => {
                if (Object.keys(item).includes(event.colDef.headerName)) {
                  objToPush = {
                    id: item.id,
                    marketingSpendForecast: Number(item[event.colDef.headerName]),
                  };
                }
              });

              props.cellEditFunc(objToPush);
            }
          }}
          defaultColDef={{
            flex: 1,
            minWidth: 150,
            // resizable: true,
            editable: false,
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
            field: "name",
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
          {extraColumns.map((month) => {
            return (
              <AgGridColumn
                menuTabs={[]}
                type="number"
                lockPosition={true}
                editable={(params) => {
                  if (params?.data?.name == "Marketing Spend Forecast") {
                    return true;
                  } else {
                    return false;
                  }
                }}
                cellRenderer="rowNameCellRenderer"
                valueGetter={(params) => {
                  let value;
                  params?.data?.data?.forEach((item: any) => {
                    if (Object.keys(item).includes(month)) {
                      value = item[month];
                    }
                  });
                  return value;
                  // return params?.data
                  //   ? params.data[month + " - " + date.getFullYear()]?.value
                  //     ? params.data[month + " - " + date.getFullYear()]?.value
                  //     : ""
                  //   : "";
                }}
                valueSetter={(params) => {
                  params.data.data.forEach((item: any) => {
                    if (Object.keys(item).includes(month)) {
                      item[month] = params.newValue;
                    }
                  });
                  // if (params.data[month + " - " + date.getFullYear()]) {
                  //   params.data[month + " - " + date.getFullYear()].value =
                  //     params.newValue;
                  // }
                  return true;
                }}
                headerName={month}
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
