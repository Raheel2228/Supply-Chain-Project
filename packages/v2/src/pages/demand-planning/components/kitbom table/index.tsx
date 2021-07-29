import React, { useState, useContext } from "react";
import { render } from "react-dom";
import { AgGridReact, AgGridColumn } from "ag-grid-react";
import "ag-grid-enterprise";
import "./index.css";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import GroupRowInnerRenderer from "./Renderers/groupRowInnerRenderer";
import { PortfolioContext } from "../../../../contexts/PortfolioContext";
import rowNameCellRenderer from "./Renderers/rowNameCellRenderer";
var fields = [
  { name: "SKU Name", field: "skuName" },
  // { name: "SKU Description", field: "skuDescription" },
  // { name: "Weight (lbs)", field: "Weight (lbs)" },
  // { name: "Default Price", field: "defaultPrice" },
  // { name: "Default Cost", field: "defaultCost" },
  // { name: "Sales Start", field: "saleStart" },
  // { name: "Sales End", field: "saleEnd" },
];
var date = new Date();
function Table(props: any) {
  const { setKitBomName, kitBomTableData, setKitBomTableData } = useContext(
    PortfolioContext
  );
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
        {/* <div style={searchDivStyle}>
          <input
            type="search"
            style={searchStyle}
            onChange={onFilterTextChange}
            placeholder="search somethings..."
          />
        </div> */}
        <AgGridReact
          rowHeight={35}
          // onCellEditingStopped={(event: any) => {
          //   if (
          //     event.newValue != event.oldValue &&
          //     event.data[event.colDef.headerName] &&
          //     event.data[event.colDef.headerName].id !== ""
          //   ) {
          //     let item = {
          //       itemValue: event.newValue,
          //       itemId: event.data[event.colDef.headerName].id,
          //       entity: event.data.entity,
          //     };
          //     props.cellEditFunc(item);
          //   }
          // }}
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
            onCellClicked={(cell: any) => {
              let filteredobj = kitBomTableData.filter(
                (item: any) => cell.data.id != item.id
              );
              setKitBomTableData(filteredobj);
            }}
            lockPosition={true}
            cellRenderer="rowNameCellRenderer"
            field="id"
            width={50}
            minWidth={50}
            maxWidth={50}
            headerName={""}
            // headerName="Action"
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
            editable={true}
            type="number"
            // cellRenderer="rowNameCellRenderer"
            field="units"
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
            headerName="Units"
            columnGroupShow="open"
          />
          {/* {props.extraColumns.map((field: any) => {
            return (
              <AgGridColumn
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
          })} */}
        </AgGridReact>
      </div>
    </div>
  );
}

export default Table;
