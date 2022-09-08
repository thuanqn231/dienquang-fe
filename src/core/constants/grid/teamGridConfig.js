import { defaultColDef } from './defaultColDef';
import { defaultAuditFields } from './defaultAuditFields';

export const teamGridConfig = [
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
    width: 130,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'plant.factory.name',
    headerName: 'Factory Name',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'plant.factory.name',
    width: 130,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'plant.code',
    headerName: 'Plant Code',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'plant.code',
    width: 130,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'plant.name',
    headerName: 'Plant Name',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'plant.name',
    width: 130,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'code',
    headerName: 'Team Code',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'code',
    width: 130,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'name',
    headerName: 'Team Name',
    cellClass: 'vertical-middle ag-left-aligned-cell ',
    colId: 'name',
    width: 130,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'rank',
    headerName: 'Sort Order',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    colId: 'rank',
    width: 130
  },
  ...defaultAuditFields
];
