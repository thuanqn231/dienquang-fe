import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const productionOrderRegistrationGridConfig = [
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
    field: 'planDate',
    headerName: 'Plan Date',
    colId: 'planDate',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'prodOrderNo',
    headerName: 'PO No.',
    colId: 'prodOrderNo',
    width: 120,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'modelCode',
    headerName: 'Model Code',
    colId: 'modelCode',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'modelId',
    headerName: 'Model ID',
    colId: 'modelId',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'modelVersion',
    headerName: 'Model Version',
    colId: 'modelVersion',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'modelDescription',
    headerName: 'Model Desc.',
    colId: 'modelDescription',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'topModel',
    headerName: 'Top Model Code',
    colId: 'topModel',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'startTime',
    headerName: 'Plan Start Time',
    colId: 'startTime',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'endTime',
    headerName: 'Plan End Time',
    colId: 'endTime',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'line.name',
    headerName: 'Line Name',
    colId: 'line.name',
    width: 120
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
    field: 'poType.name',
    headerName: 'PO Type',
    colId: 'poType.name',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'planQty',
    headerName: 'Plan Qty',
    colId: 'planQty',
    width: 80
  }
];
