import { defaultColDef } from './defaultColDef';

export const lineStockReportGridConfig = [
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'factoryName',
    tooltipField: 'factoryName',
    headerName: 'Factory',
    colId: 'factoryName',
    width: 100,
    headerClass: 'ag-header-cell ag-header-cell-sortable custom-header',
    pinned: 'left',
    hide: true
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'month',
    headerName: 'Month',
    colId: 'month',
    width: 60,
    tooltipField: 'month',

    headerClass: 'ag-header-cell ag-header-cell-sortable custom-header ',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'line.name',
    headerName: 'Line',
    width: 100,
    tooltipField: 'line.name',
    suppressMovable: true,

    colId: 'line.name',
    headerClass: 'ag-header-cell ag-header-cell-sortable custom-header',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,

    width: 90,
    minWidth: 90,
    field: 'material.materialId',
    headerName: 'Material ID',
    colId: 'material.materialId',
    tooltipField: 'material.materialId',

    headerClass: 'ag-header-cell ag-header-cell-sortable custom-header',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,

    minWidth: 100,
    width: 100,
    field: 'material.code',
    headerName: 'Material Code',
    colId: 'material.code',
    tooltipField: 'material.code',

    headerClass: 'ag-header-cell ag-header-cell-sortable custom-header',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    width: 150,
    minWidth: 150,
    field: 'material.description',
    headerName: 'Material Description',
    colId: 'material.description',
    tooltipField: 'material.description',

    headerClass: 'ag-header-cell ag-header-cell-sortable custom-header',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'material.mainUnit.name',
    headerName: 'Unit',
    width: 50,
    colId: 'material.mainUnit.name',
    tooltipField: 'material.mainUnit.name',

    headerClass: 'ag-header-cell ag-header-cell-sortable custom-header',
    pinned: 'left'
  },

  {
    ...defaultColDef,
    field: 'monthStartQty',
    headerName: 'Month Start Qty',
    tooltipField: 'monthStartQty',
    suppressMovable: true,
    width: 110,
    minWidth: 110,
    colId: 'monthStartQty',

    headerClass: ' ag-header-cell ag-header-cell-sortable custom-header ',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    headerName: 'Increase Stock (+)',
    field: 'increaseStock',
    resizable: true,
    suppressMovable: true,

    children: [
      {
        ...defaultColDef,
        headerName: 'G/R To Line',
        field: 'grToLine',
        cellClass: 'line_stock_custom  ',
        minWidth: 80,
        width: 80,
        suppressMovable: true,
        type: 'valueColumn'
      },
      {
        ...defaultColDef,
        headerName: 'Except GR',
        field: 'exceptGR',
        cellClass: 'line_stock_custom',
        minWidth: 80,
        width: 80,
        suppressMovable: true,
        type: 'valueColumn'
      },
      {
        ...defaultColDef,
        headerName: 'Adjust',
        field: 'adjustIncrease',
        cellClass: 'line_stock_custom',
        minWidth: 80,
        width: 80,
        resizable: true,
        suppressMovable: true,
        type: 'valueColumn'
      },
      {
        ...defaultColDef,
        headerName: 'Production',
        field: 'productionIncrease',
        minWidth: 90,
        width: 90,
        resizable: true,
        suppressMovable: true,
        type: 'valueColumn'
      }
    ]
  },
  {
    ...defaultColDef,
    headerName: 'Decrease Stock (-)',
    field: 'decreaseStock',
    suppressMovable: true,

    children: [
      {
        ...defaultColDef,
        headerName: 'G/I to WH',
        field: 'giToWH',
        minWidth: 80,
        width: 80,
        resizable: true,
        suppressMovable: true,
        type: 'valueColumn'
      },
      {
        ...defaultColDef,
        headerName: 'Except GI',
        field: 'exceptGI',
        cellClass: 'line_stock_custom',
        resizable: true,
        suppressMovable: true,
        minWidth: 80,
        width: 80,
        type: 'valueColumn'
      },
      {
        ...defaultColDef,
        headerName: 'Adjust',
        field: 'adjustDecrease',
        cellClass: 'line_stock_custom',
        resizable: true,
        minWidth: 80,
        width: 80,
        suppressMovable: true,
        type: 'valueColumn'
      },
      {
        ...defaultColDef,
        headerName: 'Backflush',
        field: 'backFlush',
        cellClass: 'line_stock_custom',
        resizable: true,
        minWidth: 80,
        width: 80,
        suppressMovable: true,
        type: 'valueColumn'
      }
    ]
  },

  {
    ...defaultColDef,
    field: 'currentQty',
    headerName: 'Current Qty',
    minWidth: 110,
    width: 110,
    tooltipField: 'currentQty',
    colId: 'currentQty',
    suppressMovable: true,
    headerClass: 'ag-header-cell ag-header-cell-sortable custom-header'
  },
  {
    ...defaultColDef,
    field: 'closingQty',
    headerName: 'Closing Qty',
    tooltipField: 'closingQty',
    width: 110,
    minWidth: 110,
    suppressMovable: true,
    colId: 'closingQty',

    headerClass: 'ag-header-cell ag-header-cell-sortable custom-header'
  },
  {
    ...defaultColDef,
    field: 'gap',
    headerName: 'Gap',
    tooltipField: 'gap',
    width: 50,
    suppressMovable: true,
    colId: 'gap',
    headerClass: 'ag-header-cell ag-header-cell-sortable custom-header'
  }
];
