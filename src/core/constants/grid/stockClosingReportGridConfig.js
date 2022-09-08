import { defaultColDef } from './defaultColDef';

export const stockClosingReportGridConfig = [
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'pk.factoryName',
    tooltipField: 'pk.factoryName',
    headerName: 'Factory',
    colId: 'pk.factoryName',
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
    suppressMovable: true,
    field: 'bin.zone.stock.name',
    headerName: 'Warehouse',
    colId: 'bin.zone.stock.name',
    width: 100,
    tooltipField: 'bin.zone.stock.name',
    pinned: 'left',
    headerClass: 'ag-header-cell ag-header-cell-sortable custom-header'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'lotNo',
    headerName: 'Lot No',
    tooltipField: 'lotNo',
    width: 100,
    minWidth: 100,
    colId: 'lotNo',
    pinned: 'left',
    headerClass: 'ag-header-cell ag-header-cell-sortable custom-header'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'supplier.nationalName',
    headerName: 'Supplier',
    tooltipField: 'supplier.nationalName',
    colId: 'supplier.nationalName',
    width: 100,
    pinned: 'left',
    headerClass: 'ag-header-cell ag-header-cell-sortable custom-header'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'labelNo',
    headerName: 'Label',
    tooltipField: 'labelNo',
    width: 100,
    colId: 'labelNo',
    pinned: 'left',
    headerClass: 'ag-header-cell ag-header-cell-sortable custom-header'
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
        headerName: 'G/R To WH',
        field: 'grToWH',
        cellClass: 'line_stock_custom ',
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
        headerName: 'G/I to Line',
        field: 'giToLine',
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
