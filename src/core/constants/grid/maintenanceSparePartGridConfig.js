import { defaultColDef } from './defaultColDef';

export const maintenanceSparePartGridConfig = [
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
    field: 'materialCode',
    headerName: 'SP Code',
    colId: 'materialCode',
    width: 150
  },
  {
    ...defaultColDef,
    field: 'materialDescription',
    headerName: 'SP Name',
    colId: 'materialDescription',
    width: 200
  },
  {
    ...defaultColDef,
    field: 'materialId',
    headerName: 'SP ID',
    colId: 'materialId',
    width: 200
  },

  {
    ...defaultColDef,
    field: 'issuedQty',
    headerName: 'Issued Qty',
    colId: 'issuedQty',
    width: 200
  },
  {
    ...defaultColDef,
    field: 'usedQty',
    headerName: 'Used Qty',
    colId: 'usedQty',
    width: 200
  },

  {
    ...defaultColDef,
    field: 'scrap',
    headerName: 'Scrap/Loss Qty',
    colId: 'scrap',
    width: 200
  },

  {
    ...defaultColDef,
    field: 'returnedQty',
    headerName: 'Returned Qty',
    colId: 'returnedQty',
    width: 250
  }
];
