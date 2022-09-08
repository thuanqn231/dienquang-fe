import { defaultColDef } from './defaultColDef';

export const sparePartListConfig = [
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
    field: 'sparePartUses.code',
    headerName: 'SP Code',
    colId: 'sparePartUses.code',
    width: 150
  },
  {
    ...defaultColDef,
    field: 'sparePartUses.name',
    headerName: 'SP Name',
    colId: 'sparePartUses.name',
    width: 200
  },
  {
    ...defaultColDef,
    field: 'sparePartUses.id',
    headerName: 'SP ID',
    colId: 'sparePartUses.id',
    width: 200
  },

  {
    ...defaultColDef,
    field: 'sparePartUses.issuedQty',
    headerName: 'Issued Qty',
    colId: 'sparePartUses.issuedQty',
    width: 200
  },
  {
    ...defaultColDef,
    field: 'sparePartUses.usedQty',
    headerName: 'Used Qty',
    colId: 'sparePartUses.usedQty',
    width: 200
  },
  {
    ...defaultColDef,
    field: 'sparePartUses.scrap',
    headerName: 'Scrap/Loss Qty',
    colId: 'sparePartUses.scrap',
    width: 200
  },
  {
    ...defaultColDef,
    field: 'sparePartUses.returnedQty',
    headerName: 'Returned Qty',
    colId: 'sparePartUses.returnedQty',
    width: 200
  }
];
