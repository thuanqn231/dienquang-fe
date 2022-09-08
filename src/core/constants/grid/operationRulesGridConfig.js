
import { defaultColDef } from './defaultColDef';
import { defaultAuditFields } from './defaultAuditFields';

export const operationRulesGridConfig = [
  {
    ...defaultColDef,
    filter: false,
    suppressColumnsToolPanel: true,
    suppressMovable: true,
    sortable: false,
    checkboxSelection: true,
    maxWidth: 21,
    colId: "0",
    pinned: "left",
  },
  {
    ...defaultColDef,
    filter: false,
    suppressMovable: true,
    sortable: false,
    field: "row_index",
    headerName: "No.",
    valueGetter: "node.rowIndex + 1",
    minWidth: 45,
    colId: "row_index",
    width: 45,
    pinned: "left"
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "pk.factoryName",
    tooltipField: "pk.factoryName",
    headerName: "Factory",
    colId: "pk.factoryName",
    width: 140,
    pinned: "left",
    hide: true
  },

  {
    ...defaultColDef,
    field: 'operationType.name',
    headerName: 'Operation Type',
    colId: 'operationType',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'detailOperationType.name',
    headerName: 'Detail Operation Type',
    colId: 'detailOperationType',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'materialType.name',
    headerName: 'Material Type',
    colId: 'materialType',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'labelType.name',
    headerName: 'Label Type',
    colId: 'labelType',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'rules.name',
    headerName: 'Rules',
    colId: 'Rules',
    width: 230
  },
  ...defaultAuditFields
];