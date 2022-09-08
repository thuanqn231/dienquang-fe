import { defaultColDef } from './defaultColDef';

export const closingStockInfoGridConfig = [
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
    field: 'materialName',
    headerName: 'Material Name',
    colId: 'materialName',
    tooltipField: 'materialName',
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
    field: 'line',
    headerName: 'Line',
    colId: 'line',
    tooltipField: 'line',
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
