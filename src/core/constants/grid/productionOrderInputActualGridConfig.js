import { defaultColDef } from './defaultColDef';

export const productionOrderInputActualGridConfig = [
  {
    ...defaultColDef,
    filter: false,
    suppressColumnsToolPanel: true,
    suppressMovable: true,
    sortable: false,
    checkboxSelection: true,
    maxWidth: 21,
    colId: '0',
    pinned: 'left'
  },
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
    field: 'inputTime',
    headerName: 'Time',
    colId: 'inputTime',
    width: 200,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'workStation.name',
    headerName: 'Work Station',
    colId: 'workStation.name',
    width: 200,
    pinned: 'left'
  },

  {
    ...defaultColDef,
    field: 'prodQty',
    headerName: 'Prod. Qty',
    colId: 'prodQty',
    width: 80
  }
];
