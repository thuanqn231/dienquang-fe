import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const modifyPlanBomMappingGridConfig = [
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
    minWidth: 60,
    colId: 'row_index',
    width: 60,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'childMatCode',
    // tooltipField: '',
    headerName: 'Child Mat. Code',
    width: 100,
    colId: 'childMatCode',
    pinned: 'left'
  },

  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'versionBom',
    // tooltipField: 'equipmentID.equipmentProcess.name.name',
    headerName: 'Version',
    width: 100,
    colId: 'versionBom',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'standQty',
    // tooltipField: 'equipmentID.equipmentWorkStation.name',
    headerName: 'Stand Qty',
    width: 100,
    colId: 'standQty',
    pinned: 'left'
  },
  // {
  // ...defaultColDef,
  // suppressMovable: true,
  // field: 'planQty',
  // // tooltipField: 'equipmentID.code',
  // headerName: 'Plan Qty',
  // width: 100,
  // colId: 'planQty',
  // pinned: 'left'
  // },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'planStandQty',
    // tooltipField: 'equipmentID.name',
    headerName: 'Plan Stand Qty',
    width: 100,
    colId: 'planStandQty',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'devStatusName',
    // tooltipField: 'code',
    headerName: 'Dev. Status',
    width: 100,
    colId: 'devStatusName',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'revisionDrawing',
    // tooltipField: 'pmStartDate',
    headerName: 'Revision Drawing',
    width: 100,
    colId: 'revisionDrawing'
  },
  {
    ...defaultColDef,
    field: 'supplierName',
    // tooltipField: 'pmType.name',
    headerName: 'Supplier',
    width: 100,
    colId: 'supplierName'
  },
  {
    ...defaultColDef,
    field: 'planLossQty',
    // tooltipField: 'pmCycle.name',
    headerName: 'Plan Loss Qty',
    width: 100,
    colId: 'planLossQty'
  },

  {
    ...defaultColDef,
    field: 'testQty',
    // tooltipField: 'noticeYN',
    headerName: 'Test Qty',
    width: 100,
    colId: 'testQty'
  },
  {
    ...defaultColDef,
    field: 'remark',
    // tooltipField: 'noticePIC',
    headerName: 'Remark',
    width: 100,
    colId: 'remark'
  },
  {
    ...defaultColDef,
    field: 'use',
    // tooltipField: 'noticeBefore',
    headerName: 'Use (Y/N)',
    width: 100,
    colId: 'use'
  }
];
