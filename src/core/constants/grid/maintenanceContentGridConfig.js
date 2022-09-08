import { defaultColDef } from './defaultColDef';

export const maintenanceContentGridConfig = [
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
    field: 'itemCheck',
    headerName: 'Item Check',
    colId: 'itemCheck',
    width: 150
  },
  {
    ...defaultColDef,
    field: 'pmTime',
    headerName: 'PM Time',
    colId: 'pmTime',
    width: 200
  },
  {
    ...defaultColDef,
    field: 'result',
    headerName: 'Result',
    colId: 'result',
    width: 200
  },

  {
    ...defaultColDef,
    field: 'detailContent',
    headerName: 'Detail Content',
    colId: 'detailContent',
    width: 200
  }
];
