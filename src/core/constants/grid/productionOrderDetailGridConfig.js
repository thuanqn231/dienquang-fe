import { defaultColDef } from './defaultColDef';

export const productionOrderDetailGridConfig = [
  {
    ...defaultColDef,
    filter: false,
    suppressMovable: true,
    sortable: false,
    field: 'row_index',
    headerName: 'No.',
    valueGetter: 'node.rowIndex + 1',
    minWidth: 45,
    colId: 'row_index',
    width: 45,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'lineCode',
    headerName: 'Line Code',
    colId: 'lineCode',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'lineName',
    headerName: 'Line Name',
    colId: 'lineName',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'process',
    headerName: 'Process',
    colId: 'process',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'finalYN',
    headerName: 'Final (Y/N)',
    colId: 'finalYN',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'workStation',
    headerName: 'Work Station',
    colId: 'workStation',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'reflect',
    headerName: 'Reflect(Y/N)',
    colId: 'reflect',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'targetQty',
    headerName: 'Target Qty',
    colId: 'targetQty',
    width: 120
  },

  {
    ...defaultColDef,
    field: 'actualQty',
    headerName: 'Actual Qty',
    colId: 'actualQty',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'balQty',
    headerName: 'Bal Qty',
    colId: 'balQty',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'detectQty',
    headerName: 'Detect Qty',
    colId: 'detectQty',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'productionTime',
    headerName: 'Production Time',
    colId: 'productionTime',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'tactTime',
    headerName: 'Tact Time',
    colId: 'tactTime',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'actualTactTime',
    headerName: 'Actual Tact Time',
    colId: 'actualTactTime',
    width: 80
  }
];
