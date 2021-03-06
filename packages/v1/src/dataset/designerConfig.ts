/*
This has been modified from SpreadJS Designer 14.0.3 default_config.json
Modifications:
  * Make ribbon tab names title case
  * Remove the fileMenu property, to hide the file menu button
  * Remove showHideTabStrip and showHideNewTab buttons from “Show/Hide” group on “View” tab
*/
const designerConfig = {
  ribbon: [
    {
      id: "home",
      text: "Home",
      buttonGroups: [
        {
          label: "Undo",
          thumbnailClass: "ribbon-thumbnail-undoredo",
          commandGroup: {
            children: [
              {
                direction: "vertical",
                commands: ["undo", "redo"],
              },
            ],
          },
        },
        {
          label: "Clipboard",
          thumbnailClass: "ribbon-thumbnail-clipboard",
          commandGroup: {
            children: [
              {
                commands: ["paste"],
              },
              {
                direction: "vertical",
                commands: ["cut", "copy"],
              },
            ],
          },
        },
        {
          label: "Fonts",
          indicator: "indicatorFonts",
          thumbnailClass: "ribbon-thumbnail-fonts",
          commandGroup: {
            direction: "vertical",
            children: [
              {
                commands: [
                  "fontFamily",
                  "fontSize",
                  "increaseFontsize",
                  "decreaseFontsize",
                ],
              },
              {
                commands: [
                  "fontWeight",
                  "fontItalic",
                  "fontUnderline",
                  "fontDoubleUnderline",
                  "separator",
                  "border",
                  "separator",
                  "backColor",
                  "foreColor",
                ],
              },
            ],
          },
        },
        {
          label: "Alignment",
          indicator: "indicatorAlignment",
          thumbnailClass: "ribbon-thumbnail-alignment",
          commandGroup: {
            children: [
              {
                direction: "vertical",
                children: [
                  {
                    commands: [
                      "topAlign",
                      "middleAlign",
                      "bottomAlign",
                      "separator",
                      "orientationList",
                    ],
                  },
                  {
                    commands: [
                      "leftAlign",
                      "centerAlign",
                      "rightAlign",
                      "separator",
                      "decreaseIndent",
                      "increaseIndent",
                    ],
                  },
                ],
              },
              {
                type: "separator",
              },
              {
                direction: "vertical",
                children: [
                  {
                    commands: ["wrapText"],
                  },
                  {
                    commands: ["mergeCenter", "alignmentMergeList"],
                  },
                ],
              },
            ],
          },
        },
        {
          label: "Numbers",
          indicator: "indicatorNumbers",
          thumbnailClass: "ribbon-thumbnail-numbers",
          commandGroup: {
            direction: "vertical",
            children: [
              {
                commands: ["ribbonNumberFormat"],
              },
              {
                commands: [
                  "formatPercentage",
                  "formatComma",
                  "separator",
                  "increaseDecimal",
                  "decreaseDecimal",
                ],
              },
            ],
          },
        },
        {
          label: "Cell Type",
          thumbnailClass: "ribbon-thumbnail-celltype",
          commandGroup: {
            children: [
              {
                commands: ["cellType", "cellDropdowns"],
              },
            ],
          },
        },
        {
          label: "Styles",
          thumbnailClass: "ribbon-thumbnail-styles",
          commandGroup: {
            commands: [
              "conditionFormat",
              "formatTable2",
              "cellStyles",
              "cellStates",
            ],
          },
        },
        {
          label: "Cells",
          thumbnailClass: "ribbon-thumbnail-cells",
          commandGroup: {
            commands: ["cellsInsert", "cellsDelete", "cellsFormat"],
          },
        },
        {
          label: "Editing",
          thumbnailClass: "ribbon-thumbnail-editing",
          commandGroup: {
            children: [
              {
                direction: "vertical",
                children: [
                  {
                    commands: ["editingAutoSum", "editingAutoSumList"],
                  },
                  {
                    commands: ["editingFillDown", "editingFillDownList"],
                  },
                  {
                    commands: ["clear", "editingClearAllList"],
                  },
                ],
              },
              {
                commands: ["editingSortFilter"],
              },
              {
                commands: ["editingFind"],
              },
            ],
          },
        },
      ],
    },
    {
      id: "insert",
      text: "Insert",
      buttonGroups: [
        {
          label: "Table",
          thumbnailClass: "ribbon-thumbnail-table",
          commandGroup: {
            commands: ["insertTable"],
          },
        },
        {
          label: "Chart",
          thumbnailClass: "ribbon-thumbnail-chart",
          commandGroup: {
            commands: ["insertChart"],
          },
        },
        {
          label: "Illustration",
          thumbnailClass: "ribbon-button-picture",
          commandGroup: {
            commands: ["insertPicture"],
          },
        },
        {
          label: "Shapes",
          thumbnailClass: "ribbon-thumbnail-shapes",
          commandGroup: {
            commands: ["insertShape"],
          },
        },
        {
          label: "Barcode",
          thumbnailClass: "ribbon-thumbnail-barcode",
          commandGroup: {
            commands: ["insertBarCode"],
          },
        },
        {
          label: "Hyperlink",
          thumbnailClass: "ribbon-thumbnail-barcode",
          commandGroup: {
            commands: ["insertHyperLink"],
          },
        },
        {
          label: "Sparklines",
          thumbnailClass: "ribbon-thumbnail-sparklines",
          commandGroup: {
            commands: [
              "sparklinesLineSparkline",
              "sparklinesColumnSparkline",
              "sparklinesWinLossSparkline",
              "sparklinesPieSparkline",
              "sparklinesAreaSparkline",
              "sparklinesScatterSparkline",
              "sparklinesSpreadsSparkline",
              "sparklinesStackedSparkline",
              "sparklinesBoxPlotSparkline",
              "sparklinesCascadeSparkline",
              "sparklinesParetoSparkline",
              "sparklinesBulletSparkline",
              "sparklinesHBarSparkline",
              "sparklinesVBarSparkline",
              "sparklinesVarianceSparkline",
              "sparklinesMonthSparkline",
              "sparklinesYearSparkline",
              "sparklinesRangeBlockSparkline",
            ],
          },
        },
      ],
    },
    {
      id: "formulas",
      text: "Formulas",
      buttonGroups: [
        {
          label: "Functions",
          thumbnailClass: "ribbon-button-insertfunction",
          commandGroup: {
            commands: ["insertFunction"],
          },
        },
        {
          label: "Functions Library",
          thumbnailClass: "ribbon-thumbnail-functions",
          commandGroup: {
            commands: [
              "formulaAutoSum",
              "formulaFinancial",
              "logicalFormula",
              "formulaText",
              "formulaDateTime",
              "formulaLookupReference",
              "formulaLookupReferenceAllowDynamicArray",
              "formulaMathTrig",
              "formulaMathTrigAllowDynamicArray",
              "moreFunctions",
            ],
          },
        },
        {
          label: "Names",
          thumbnailClass: "ribbon-thumbnail-names",
          commandGroup: {
            commands: ["nameManager"],
          },
        },
        {
          label: "Formula Auditing",
          thumbnailClass: "ribbon-thumbnail-functions",
          commandGroup: {
            commands: ["showFormulas"],
          },
        },
      ],
    },
    {
      id: "data",
      text: "Data",
      buttonGroups: [
        {
          label: "Sort & Filter",
          thumbnailClass: "ribbon-thumbnail-sortAndFilter",
          commandGroup: {
            children: [
              {
                direction: "vertical",
                commands: ["sortAZData", "sortZAData"],
              },
              {
                commands: ["customSortData"],
              },
              {
                type: "separator",
              },
              {
                commands: ["setFilterData"],
              },
              {
                direction: "vertical",
                commands: ["clearFilterData", "reapplyFilterData"],
              },
            ],
          },
        },
        {
          label: "Data Tools",
          thumbnailClass: "ribbon-thumbnail-datatools",
          commandGroup: {
            children: [
              {
                commands: ["dataValidation", "dataValidationList"],
              },
            ],
          },
        },
        {
          label: "Outline",
          indicator: "indicatorOutline",
          thumbnailClass: "ribbon-thumbnail-outline",
          commandGroup: {
            children: [
              {
                commands: ["group", "ungroup", "subtotal"],
              },
              {
                type: "separator",
              },
              {
                direction: "vertical",
                commands: ["showDetail", "hideDetail"],
              },
            ],
          },
        },
        {
          label: "Design Mode",
          thumbnailClass: "ribbon-thumbnail-designmode",
          commandGroup: {
            children: [
              {
                commands: ["templateDesignMode"],
              },
              {
                type: "separator",
              },
              {
                direction: "vertical",
                commands: ["loadSchema", "saveSchema", "clearBindingPath"],
              },
              {
                type: "separator",
              },
              {
                commands: ["autoGenerateLabel"],
              },
            ],
          },
        },
      ],
    },
    {
      id: "view",
      text: "View",
      buttonGroups: [
        {
          label: "Show/Hide",
          thumbnailClass: "ribbon-thumbnail-showhide",
          commandGroup: {
            children: [
              {
                direction: "vertical",
                commands: ["showHideRowHeader", "showHideColumnHeader"],
              },
              {
                type: "separator",
              },
              {
                direction: "vertical",
                commands: ["showHideVGridLine", "showHideHGridLine"],
              },
            ],
          },
        },
        {
          label: "Zoom",
          thumbnailClass: "ribbon-thumbnail-zoom",
          commandGroup: {
            commands: ["zoom", "zoomDefault", "zoomSelection"],
          },
        },
        {
          label: "Viewport",
          thumbnailClass: "ribbon-thumbnail-viewport",
          commandGroup: {
            commands: ["ViewportFreezePanes", "unfreezePanes"],
          },
        },
      ],
    },
    {
      id: "settings",
      text: "Settings",
      buttonGroups: [
        {
          label: "Spread Settings",
          thumbnailClass: "ribbon-thumbnail-spreadsettings",
          commandGroup: {
            children: [
              {
                direction: "vertical",
                commands: ["spreadSettingGeneral"],
              },
              {
                direction: "vertical",
                commands: [
                  "spreadSettingScrollBar",
                  "spreadSettingCalculation",
                  "spreadSettingTabStrip",
                ],
              },
            ],
          },
        },
        {
          label: "Sheet Settings",
          thumbnailClass: "ribbon-thumbnail-sheetsettings",
          commandGroup: {
            children: [
              {
                direction: "vertical",
                commands: ["sheetSettingGeneral"],
              },
              {
                direction: "vertical",
                commands: ["sheetSettingGridLine", "sheetSettingHeaders"],
              },
            ],
          },
        },
      ],
    },
    {
      id: "tableDesign",
      text: "DESIGN",
      buttonGroups: [
        {
          label: "Properties",
          thumbnailClass: "ribbon-thumbnail-properties",
          commandGroup: {
            children: [
              {
                direction: "vertical",
                commands: ["tableName", "resizeTable"],
              },
            ],
          },
        },
        {
          label: "Tools",
          thumbnailClass: "ribbon-thumbnail-tools",
          commandGroup: {
            children: [
              {
                direction: "vertical",
                commands: ["convertToRange", "tableAllowAutoExpand"],
              },
              {
                commands: ["insertSlicer"],
              },
            ],
          },
        },
        {
          label: "Table Style Options",
          thumbnailClass: "ribbon-thumbnail-tablestyleoptions",
          commandGroup: {
            children: [
              {
                direction: "vertical",
                commands: [
                  "tableStyleHeaderRow",
                  "tableStyleTotalRow",
                  "tableStyleBandedRows",
                ],
              },
              {
                direction: "vertical",
                commands: [
                  "tableStyleFirstColumn",
                  "tableStyleLastColumn",
                  "tableStyleBandedColumns",
                ],
              },
              {
                direction: "vertical",
                commands: [
                  "tableStyleResizeHandler",
                  "tableStyleFilterButton",
                  "tableStyleTotalRowList",
                ],
              },
            ],
          },
        },
        {
          label: "Table Styles",
          thumbnailClass: "ribbon-thumbnail-tablestyles",
          commandGroup: {
            commands: ["formatTable"],
          },
        },
      ],
      visibleWhen: "TableSelected",
    },
    {
      id: "chartDesign",
      text: "DESIGN",
      buttonGroups: [
        {
          label: "Chart Layouts",
          thumbnailClass: "ribbon-thumbnail-chartlayouts",
          commandGroup: {
            commands: ["addChartElement", "quickLayout"],
          },
        },
        {
          label: "Chart Styles",
          thumbnailClass: "ribbon-thumbnail-chartstyles",
          commandGroup: {
            commands: ["changeColors", "chartStyle"],
          },
        },
        {
          label: "Data",
          thumbnailClass: "ribbon-thumbnail-chartdata",
          commandGroup: {
            commands: ["switchRowColumn", "selectData"],
          },
        },
        {
          label: "Type",
          thumbnailClass: "ribbon-thumbnail-charttype",
          commandGroup: {
            commands: ["changeChartType"],
          },
        },
        {
          label: "Location",
          thumbnailClass: "ribbon-thumbnail-chartlocation",
          commandGroup: {
            commands: ["moveChart"],
          },
        },
        {
          label: "Accessiblity",
          thumbnailClass: "ribbon-thumbnail-chart-alt-text",
          commandGroup: {
            commands: ["chartAltText"],
          },
        },
      ],
      visibleWhen: "singleChartSelected",
    },
    {
      id: "pictureDesign",
      text: "DESIGN",
      buttonGroups: [
        {
          label: "Accessiblity",
          thumbnailClass: "ribbon-thumbnail-chart-alt-text",
          commandGroup: {
            commands: ["pictureAltText"],
          },
        },
      ],
      visibleWhen:
        "pictureSelected && !IsProtected || pictureSelected && AllowEditObject",
    },
    {
      id: "shapeDesign",
      text: "DESIGN",
      buttonGroups: [
        {
          label: "Insert Shape",
          thumbnailClass: "ribbon-thumbnail-shapeinsertshape",
          commandGroup: {
            commands: ["insertShapeList", "changeShape"],
          },
        },
        {
          label: "Shape Styles",
          thumbnailClass: "ribbon-thumbnail-shapeStyles",
          commandGroup: {
            commands: ["changeShapeStyle"],
          },
        },
        {
          label: "Accessiblity",
          thumbnailClass: "ribbon-thumbnail-chart-alt-text",
          commandGroup: {
            commands: ["shapeAltText"],
          },
        },
        {
          label: "Rotate",
          thumbnailClass: "ribbon-thumbnail-shaperotate",
          commandGroup: {
            commands: ["shapeRotate"],
          },
        },
        {
          label: "Group",
          thumbnailClass: "ribbon-thumbnail-shapegroup",
          commandGroup: {
            commands: ["shapeCommandGroup"],
          },
        },
        {
          class: "gc-ribbon-panelgroup-shapeSize",
          label: "Size",
          thumbnailClass: "ribbon-thumbnail-shapesize",
          commandGroup: {
            direction: "vertical",
            commands: ["shapeSizeHeight", "shapeSizeWidth"],
          },
        },
      ],
      visibleWhen:
        "ShapeSelected && !IsProtected || ShapeSelected && AllowEditObject",
    },
    {
      id: "slicerDesign",
      text: "OPTIONS",
      buttonGroups: [
        {
          class: "slicer_panel",
          label: "Slicer",
          thumbnailClass: "ribbon-thumbnail-properties",
          commandGroup: {
            children: [
              {
                direction: "vertical",
                type: "group",
                commands: ["captionName", "slicerSetting"],
              },
            ],
          },
        },
        {
          label: "Slicer Styles",
          thumbnailClass: "ribbon-thumbnail-tablestyles",
          commandGroup: {
            commands: ["slicerFormat"],
          },
        },
        {
          class: "slicer_buttons",
          label: "Buttons",
          thumbnailClass: "ribbon-thumbnail-properties",
          commandGroup: {
            direction: "vertical",
            commands: ["columnCount", "itemHeight", "itemWidth"],
          },
        },
        {
          class: "slicer_size",
          label: "Size",
          thumbnailClass: "ribbon-thumbnail-sliceSize",
          commandGroup: {
            direction: "vertical",
            commands: ["slicerHeight", "slicerWidth"],
          },
        },
      ],
      visibleWhen:
        "SlicerSelected && !IsProtected || SlicerSelected && AllowEditObject",
    },
    {
      id: "formulaSparkLineDesign",
      text: "DESIGN",
      buttonGroups: [
        {
          label: "Argument",
          thumbnailClass: "ribbon-thumbnail-argument",
          commandGroup: {
            commands: ["formulaSparklineSetting"],
          },
        },
      ],
      visibleWhen: "FormulaSparklineSelected",
    },
    {
      id: "sparkLineDesign",
      text: "DESIGN",
      buttonGroups: [
        {
          label: "Type",
          thumbnailClass: "ribbon-thumbnai-sparkline-type",
          commandGroup: {
            commands: ["lineSparkline", "columnSparkline", "winLossSparkline"],
          },
        },
        {
          label: "Show",
          thumbnailClass: "ribbon-thumbnail-sparkline-show",
          commandGroup: {
            children: [
              {
                direction: "vertical",
                commands: [
                  "showHighpoint",
                  "showLowPoint",
                  "showNegativePoint",
                ],
              },
              {
                direction: "vertical",
                commands: ["showFirstPoint", "showLastPoint", "showMarkers"],
              },
            ],
          },
        },
        {
          label: "Style",
          thumbnailClass: "ribbon-thumbnail-sparkline-style",
          commandGroup: {
            children: [
              {
                direction: "vertical",
                children: [
                  {
                    direction: "vertical",
                    commands: ["sparklineColor", "sparklineMarkerColor"],
                  },
                  {
                    commands: ["sparklineWeight"],
                  },
                ],
              },
            ],
          },
        },
        {
          label: "Group",
          thumbnailClass: "ribbon-thumbnail-sparkline-groups",
          commandGroup: {
            children: [
              {
                direction: "vertical",
                children: [
                  {
                    direction: "vertical",
                    commands: ["sparklineGroup", "sparklineUnGroup"],
                  },
                  {
                    commands: ["clearSparkline", "clearSparklineDropdown"],
                  },
                ],
              },
            ],
          },
        },
      ],
      visibleWhen: "SparklineSelected",
    },
    {
      id: "barcodeDesignId",
      text: "DESIGN",
      buttonGroups: [
        {
          label: "Argument",
          thumbnailClass: "ribbon-thumbnail-argument",
          commandGroup: {
            commands: ["barCodeSetting"],
          },
        },
      ],
      visibleWhen: "BarCodeSelected",
    },
  ],
  contextMenu: [
    "contextMenuCut",
    "contextMenuCopy",
    "contextMenuPaste",
    "designerPasteAll",
    "pasteFormula",
    "designerPasteValues",
    "designerPasteFormatting",
    "pasteValuesFormatting",
    "pasteFormulaFormatting",
    "floatingObjectCut",
    "floatingObjectCopy",
    "contextMenuCutShapes",
    "contextMenuCopyShapes",
    "PasteShapes",
    "separator",
    "resetChartColor",
    "changeChartTypeDialog",
    "selectChartDataDialog",
    "moveChartDialog",
    "formatChart",
    "separator",
    "insertDialog",
    "deleteDialog",
    "gc.spread.contextMenu.insertColumns",
    "gc.spread.contextMenu.deleteColumns",
    "gc.spread.contextMenu.insertRows",
    "gc.spread.contextMenu.deleteRows",
    "tableInsert",
    "tableDelete",
    "gc.spread.contextMenu.clearContents",
    "separator",
    "gc.spread.contextMenu.rowHeaderinsertCopiedCells",
    "gc.spread.contextMenu.rowHeaderinsertCutCells",
    "gc.spread.contextMenu.colHeaderinsertCopiedCells",
    "gc.spread.contextMenu.colHeaderinsertCutCells",
    "insertCopiedCells",
    "insertCutCells",
    "separator",
    "gc.spread.contextMenu.insertSheet",
    "gc.spread.contextMenu.deleteSheet",
    "unprotectSheet",
    "protectSheet",
    "separator",
    "gc.spread.contextMenu.filter",
    "sort",
    "table",
    "separator",
    "gc.spread.contextMenu.insertComment",
    "gc.spread.contextMenu.editComment",
    "gc.spread.contextMenu.deleteComment",
    "gc.spread.contextMenu.toggleComment",
    "formatComment",
    "separator",
    "formatCells",
    "editCellType",
    "editCellDropdowns",
    "link",
    "editHyperlink",
    "openHyperlink",
    "removeHyperlink",
    "removeHyperlinks",
    "separator",
    "richText",
    "defineName",
    "cellTag",
    "rowTag",
    "colTag",
    "columnWidth",
    "rowHeight",
    "gc.spread.contextMenu.hideColumns",
    "gc.spread.contextMenu.hideRows",
    "gc.spread.contextMenu.unhideColumns",
    "gc.spread.contextMenu.unhideRows",
    "columnHeaders",
    "contextMenuOutlineColumn",
    "rowHeaders",
    "separator",
    "showTabColor",
    "gc.spread.contextMenu.hideSheet",
    "gc.spread.contextMenu.unhideSheet",
    "sheetTag",
    "separator",
    "gc.spread.contextMenu.cut",
    "gc.spread.contextMenu.copy",
    "slicerPasteOptions",
    "gc.spread.contextMenu.pasteAll",
    "gc.spread.contextMenu.slicerSortAscend",
    "gc.spread.contextMenu.slicerSortDescend",
    "gc.spread.contextMenu.removeSlicer",
    "slicerProperty",
    "contextMenuSlicerSetting",
    "separator",
    "groupShape",
    "formatShapes",
    "designerMoreFunctions",
  ],
  sidePanels: [
    {
      position: "top",
      allowResize: true,
      command: "formulaBarPanel",
      uiTemplate: "formulaBarTemplate",
    },
    {
      position: "right",
      width: "315px",
      command: "fieldListTreePanel",
      uiTemplate: "filedListTemplate",
    },
    {
      position: "bottom",
      command: "statusBarPanel",
      uiTemplate: "statusBarPanelTemplate",
    },
    {
      position: "full",
      command: "fileMenuPanel",
      uiTemplate: "fileMenuPanelTemplate",
    },
    {
      position: "right",
      width: "315px",
      command: "shapePanel",
      uiTemplate: "shapeTemplate",
    },
    {
      position: "right",
      width: "315px",
      command: "columnChartPanel",
      uiTemplate: "columnChartTemplate",
    },
    {
      position: "right",
      width: "315px",
      command: "lineChartPanel",
      uiTemplate: "lineChartTemplate",
    },
    {
      position: "right",
      width: "315px",
      command: "pieChartPanel",
      uiTemplate: "pieChartTemplate",
    },
    {
      position: "right",
      width: "315px",
      command: "barChartPanel",
      uiTemplate: "barChartTemplate",
    },
    {
      position: "right",
      width: "315px",
      command: "areaChartPanel",
      uiTemplate: "areaChartTemplate",
    },
    {
      position: "right",
      width: "315px",
      command: "scatterChartPanel",
      uiTemplate: "scatterChartTemplate",
    },
    {
      position: "right",
      width: "315px",
      command: "stockChartPanel",
      uiTemplate: "stockChartTemplate",
    },
    {
      position: "right",
      width: "315px",
      command: "radarChartPanel",
      uiTemplate: "radarChartTemplate",
    },
    {
      position: "right",
      width: "315px",
      command: "sunburstChartPanel",
      uiTemplate: "sunburstChartTemplate",
    },
    {
      position: "right",
      width: "315px",
      command: "treeMapChartPanel",
      uiTemplate: "treeMapChartPanelTemplate",
    },
    {
      position: "right",
      width: "315px",
      command: "funnelChartPanel",
      uiTemplate: "funnelChartPanelTemplate",
    },
    {
      position: "right",
      width: "315px",
      command: "comboChartPanel",
      uiTemplate: "comboChartTemplate",
    },
    {
      position: "right",
      width: "315px",
      command: "chartAltTextPanel",
      uiTemplate: "altTextTemplate",
      showCloseButton: true,
    },
    {
      position: "right",
      width: "315px",
      command: "pictureAltTextPanel",
      uiTemplate: "altTextTemplate",
      showCloseButton: true,
    },
    {
      position: "right",
      width: "315px",
      command: "shapeAltTextPanel",
      uiTemplate: "altTextTemplate",
      showCloseButton: true,
    },
  ],
};

export default designerConfig;
