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
var fields1 = [
  { name: "SKU Name", field: "skuName", edit: false },
  { name: "SKU Description", field: "skuDescription", edit: false },
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
                channelPrice: event.data.channelPrice,
                demandSkus: event.data.demandSkus.map((demandSkuItem: any) => {
                  return {
                    id: demandSkuItem.id,
                    skuTotalDemand: demandSkuItem.skuTotalDemand,
                  };
                }),
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
          />

          {extraColumns.map((field: any) => {
            return (
              <AgGridColumn
                editable={true}
                menuTabs={[]}
                lockPosition={true}
                // cellRenderer="rowNameCellRenderer"
                field={field}
                type="number"
                valueGetter={(params) => {
                  return params.data[field]?.skuTotalDemand;
                }}
                valueSetter={(params) => {
                  if (params.data[field]) {
                    params.data[field].skuTotalDemand = params.newValue;
                  }
                  return true;
                }}
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
