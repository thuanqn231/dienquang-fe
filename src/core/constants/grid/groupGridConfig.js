import { defaultColDef } from './defaultColDef';
import { defaultAuditFields } from './defaultAuditFields';

export const groupGridConfig = [
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
    width: 100,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'team.plant.factory.name',
    headerName: 'Factory Name',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'team.plant.factory.name',
    width: 130,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'team.plant.code',
    headerName: 'Plant Code',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'team.plant.code',
    width: 90,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'team.plant.name',
    headerName: 'Plant Name',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'team.plant.name',
    width: 130,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'team.code',
    headerName: 'Team Code',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'team.code',
    width: 90,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'team.name',
    headerName: 'Team Name',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'team.name',
    width: 130,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'code',
    headerName: 'Group Code',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'code',
    width: 90,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'name',
    headerName: 'Group Name',
    cellClass: 'vertical-middle ag-left-aligned-cell',
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
    width: 90
  },
  ...defaultAuditFields
];
