import { defaultColDef } from './defaultColDef';

export const closingStockClosingGridConfig = [
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'pk.factoryName',
    tooltipField: 'pk.factoryName',
    headerName: 'Factory',
    colId: 'pk.factoryName',
    width: 140,
    pinned: 'left',
    hide: true
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'month',
    headerName: 'Month',
    colId: 'month',
    tooltipField: 'month',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'materialID',
    headerName: 'Material ID',
    colId: 'materialID',
    tooltipField: 'materialID',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'materialCode',
    headerName: 'Material Code',
    colId: 'materialCode',
    tooltipField: 'materialCode',
    width: 80,
    pinned: 'left'
  },

  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'materialDesc',
    headerName: 'Material Desc.',
    colId: 'materialDesc',
    tooltipField: 'materialDesc',
    width: 120,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'unitID',
    headerName: 'Unit',
    colId: 'unitID',
    tooltipField: 'unitID',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'stock',
    headerName: 'Warehouse',
    colId: 'stock',
    tooltipField: 'stock',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'zone',
    headerName: 'Zone',
    colId: 'zone',
    tooltipField: 'zone',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'bin',
    headerName: 'Bin',
    colId: 'bin',
    tooltipField: 'bin',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'labelNo',
    headerName: 'Label',
    colId: 'labelNo',
    tooltipField: 'labelNo',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'supplier',
    headerName: 'Supplier',
    colId: 'supplier',
    tooltipField: 'supplier',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'lotNo',
    headerName: 'Lot No',
    colId: 'lotNo',
    tooltipField: 'lotNo',
    width: 80,
    pinned: 'left'
  },

  {
    ...defaultColDef,
    field: 'closingQty',
    headerName: 'Closing Qty',
    colId: 'closingQty',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    tooltipField: 'closingQty',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'dteLogI',
    headerName: 'Upload Time',
    colId: 'dteLogI',
    tooltipField: 'dteLogI',
    cellClass: 'vertical-middle',
    width: 80
  },

  {
    ...defaultColDef,
    field: 'usrLogI',
    headerName: 'Upload By',
    colId: 'usrLogI',
    tooltipField: 'usrLogI',
    cellClass: 'vertical-middle',
    width: 120
  }
];
