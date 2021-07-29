import React, { useState, useContext, useEffect } from "react";
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
  { name: "SKU Name", field: "skuName", edit: false, type: "string" },
  { name: "SKU Description", field: "skuDescription", edit: false, type: "string" },
  { name: "Unit OH", field: "expectedOh", edit: true, type: "number" },
];
var date = new Date();
function Table(props: any) {
  // const { supplyMasterActualsData } = useContext(PortfolioContext);

  // useEffect(() => {
  //   setRowData(supplyMasterActualsData);
  // }, [props.data]);
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
        style={{ width: "auto", height: 300 }} //to be change to 15
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
          deltaRowDataMode={true}
          deltaColumnMode={true}
          rowHeight={35}
          onCellEditingStopped={(event: any) => {
            if (event.newValue != event.oldValue) {
              if (event.data.actualId) {
                let item = {
                  id: event.data.actualId,
                  expectedOh: event.data.expectedOh,
                  skuId: event.data.skuId,
                  dateId: props.dateSelected + "T19:00:00.000Z",
                  fulfillmentClientId: event.data.fulfillmentClientId,
                  clientId: event.data.clientId,
                };
                props.cellEditFunc(item);
              } else {
                let item = {
                  expectedOh: event.data.expectedOh,
                  skuId: event.data.skuId,
                  dateId: props.dateSelected + "T19:00:00.000Z",
                  fulfillmentClientId: event.data.fulfillmentClientId,
                  clientId: event.data.clientId,
                };
                props.cellEditFunc(item);
              }
            }
          }}
          defaultColDef={{
            flex: 1,
            minWidth: 100,
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

          {fields.map((field) => {
            return (
              <AgGridColumn
                menuTabs={[]}
                editable={field.edit}
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
                type={field.type}
                headerName={field.name}
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
