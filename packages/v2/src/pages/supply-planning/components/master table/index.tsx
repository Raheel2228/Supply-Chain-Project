import React, { useState, useEffect } from "react";
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
const getRowNodeId = (data: any) => data.id;
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
  { name: "Supplier", field: "supplier", edit: false },
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
  useEffect(() => {
    setRowData(props.data);
  }, [props.filterView]);
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
          deltaRowDataMode={true}
          rowHeight={35}
          getRowNodeId={getRowNodeId}
          onCellEditingStopped={(event: any) => {
            if (event.newValue != event.oldValue) {
              let item = {
                id: event.data.id,
                clientId: event.data.clientId,
                skuId: event.data.skuId,
                fulfillmentClientId: event.data.fulfillmentClientId,
                supplyVersionId: event.data.supplyVersionId,
                supplierMasterId: event.data.supplierMasterId,
                caseSize: event.data.caseSize,
                palletSize: event.data.palletSize,
                cost: event.data.cost,
                targetDoh: event.data.targetDoh,
                expectedOh: [],
              };
              props.cellEditFunc(item);
            }
          }}
          defaultColDef={{
            flex: 1,
            minWidth: 120,
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

                width={120}
                // minWidth={120}
                // maxWidth={120}
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
            width={120}
            // minWidth={120}
            // maxWidth={120}
            pinned="left"
            // cellRenderer="rowNameCellRenderer"
            field={"caseSize"}
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
            headerName={"Case Size"}
            columnGroupShow="open"
          />
          <AgGridColumn
            menuTabs={[]}
            lockPosition={true}
            type="number"
            width={120}
            // minWidth={120}
            // maxWidth={120}
            pinned="left"
            // cellRenderer="rowNameCellRenderer"
            field={"palletSize"}
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
            headerName={"Pallet Size"}
            columnGroupShow="open"
          />
          <AgGridColumn
            menuTabs={[]}
            lockPosition={true}
            type="number"
            width={120}
            // minWidth={120}
            // maxWidth={120}
            pinned="left"
            // cellRenderer="rowNameCellRenderer"
            field={"targetDoh"}
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
            headerName={"Target DOH"}
            columnGroupShow="open"
          />
          <AgGridColumn
            menuTabs={[]}
            lockPosition={true}
            type="number"
            width={120}
            editable={true}
            // minWidth={120}
            // maxWidth={120}
            pinned="left"
            cellRenderer="rowNameCellRenderer"
            field={"cost"}
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
            headerName={"Cost"}
            columnGroupShow="open"
          />
          {extraColumns.map((field: any) => {
            return (
              <AgGridColumn
                editable={false}
                menuTabs={[]}
                lockPosition={true}
                // cellRenderer="rowNameCellRenderer"
                field={field}
                type="number"
                valueGetter={(params) => {
                  return params.data[field]
                    ? params.data[field]["dataToShow"]
                    : null;
                }}
                // valueSetter={(params) => {
                //   if (params.data[field]) {
                //     params.data[field].skuTotalDemand = params.newValue;
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
