import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const productionOrderGridConfig = [
  {
    ...defaultColDef,
    filter: false,
    suppressColumnsToolPanel: true,
    suppressMovable: true,
    sortable: false,
    checkboxSelection: true,
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
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
    field: 'pk.factoryName',
    tooltipField: 'pk.factoryName',
    headerName: 'Factory',
    colId: 'pk.factoryName',
    width: 140,
    pinned: 'left',
    hide: true
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'planDate',
    headerName: 'Plan Date',
    colId: 'planDate',
    tooltipField: 'planDate',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'line.code',
    headerName: 'Line Code',
    colId: 'line.code',
    tooltipField: 'line.code',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'line.name',
    headerName: 'Line Name',
    colId: 'line.name',
    tooltipField: 'line.name',
    width: 120,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'planId',
    headerName: 'Plan ID',
    colId: 'planId',
    tooltipField: 'planId',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'prodOrderNo',
    headerName: 'PO No.',
    colId: 'prodOrderNo',
    tooltipField: 'prodOrderNo',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'modelId',
    headerName: 'Model ID',
    colId: 'modelId',
    tooltipField: 'modelId',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'modelCode',
    headerName: 'Model Code',
    colId: 'modelCode',
    tooltipField: 'modelCode',
    width: 80,
    pinned: 'left'
  },
  //   {
  //     ...defaultColDef,
  //     suppressMovable: true,
  //     field: 'modelName',
  //     headerName: 'Model Name',
  //     colId: 'modelName',
  //     tooltipField: 'modelName',
  //     width: 80
  //   },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'modelDescription',
    headerName: 'Model Desc.',
    colId: 'modelDescription',
    tooltipField: 'modelDescription',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'modelVersion',
    headerName: 'Model Version',
    colId: 'modelVersion',
    tooltipField: 'modelVersion',
    width: 70
  },

  {
    ...defaultColDef,
    field: 'prodStatus.name',
    headerName: 'Production Status',
    colId: 'prodStatus.name',
    tooltipField: 'prodStatus.name',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'poType.name',
    headerName: 'PO Type',
    colId: 'poType.name',
    tooltipField: 'poType.name',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'startTime',
    headerName: 'Plan Start Time',
    colId: 'startTime',
    tooltipField: 'startTime',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'endTime',
    headerName: 'Plan End Time',
    colId: 'endTime',
    tooltipField: 'endTime',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'actualStartTime',
    headerName: 'Actual Start Time',
    colId: 'actualStartTime',
    tooltipField: 'actualStartTime',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'actualEndTime',
    headerName: 'Actual End Time',
    colId: 'actualEndTime',
    tooltipField: 'actualEndTime',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'planQty',
    headerName: 'Plan Qty',
    colId: 'planQty',
    tooltipField: 'planQty',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 60
  },
  {
    ...defaultColDef,
    field: 'actualQty',
    headerName: 'Actual Qty',
    colId: 'actualQty',
    tooltipField: 'actualQty',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 60
  },
  {
    ...defaultColDef,
    field: 'balQty',
    headerName: 'Bal Qty',
    colId: 'balQty',
    tooltipField: 'balQty',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 60
  },
  {
    ...defaultColDef,
    field: 'defectQty',
    headerName: 'Defect Qty',
    colId: 'defectQty',
    tooltipField: 'defectQty',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 60
  },
  {
    ...defaultColDef,
    field: 'tactTime',
    headerName: 'Tact Time',
    colId: 'tactTime',
    tooltipField: 'tactTime',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 60
  },

  {
    ...defaultColDef,
    field: 'operation',
    headerName: 'Operation',
    colId: 'operation',
    tooltipField: 'Operation',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'process.name',
    headerName: 'Process',
    colId: 'process.name',
    tooltipField: 'process.name',
    width: 80
  },

  {
    ...defaultColDef,
    field: 'topModel',
    headerName: 'Top Model Name',
    colId: 'topModel',
    tooltipField: 'topModel',
    width: 80
  },

  ...defaultAuditFields
];
