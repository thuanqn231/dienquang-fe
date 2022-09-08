import { defaultColDef } from './defaultColDef';
import { defaultAuditFields } from './defaultAuditFields';

export const plantGridConfig = [
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
    field: 'pk.factoryCode',
    headerName: 'Factory Code',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'pk.factoryCode',
    width: 146,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'factory.name',
    headerName: 'Factory Name',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'factory.name',
    width: 146,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'code',
    headerName: 'Plant Code',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'code',
    width: 146,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'name',
    headerName: 'Plant Name',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'name',
    width: 146,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'rank',
    headerName: 'Sort Order',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    colId: 'rank',
    width: 146
  },
  ...defaultAuditFields
];
