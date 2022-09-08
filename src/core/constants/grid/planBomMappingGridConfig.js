import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const planBomMappingGridConfig = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'productionOrder.prodOrderNo',
    // tooltipField: 'equipmentID.equipmentLine.name',
    headerName: 'PO No',
    width: 100,
    colId: 'productionOrder.prodOrderNo',
    pinned: 'left'
  },

  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'productionOrder.planId',
    // tooltipField: 'equipmentID.equipmentProcess.name.name',
    headerName: 'Plan ID',
    width: 100,
    colId: 'productionOrder.planId',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'productionOrder.planDate',
    // tooltipField: 'equipmentID.equipmentWorkStation.name',
    headerName: 'Plan Date',
    width: 100,
    colId: 'productionOrder.planDate',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'bomStatus',
    // tooltipField: 'equipmentID.code',
    headerName: 'Status',
    width: 100,
    colId: 'bomStatus',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'parentCode.code',
    // tooltipField: 'equipmentID.name',
    headerName: 'Parent Code',
    width: 100,
    colId: 'parentCode.code',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'parentVersion',
    // tooltipField: 'code',
    headerName: 'Parent Ver',
    width: 100,
    colId: 'parentVersion',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'childCode.code',
    // tooltipField: 'pmStartDate',
    headerName: 'Child Code',
    width: 100,
    colId: 'childCode.code'
  },
  {
    ...defaultColDef,
    field: 'childVersion',
    // tooltipField: 'pmType.name',
    headerName: 'Child Ver',
    width: 100,
    colId: 'childVersion'
  },
  {
    ...defaultColDef,
    field: 'childCode.description',
    // tooltipField: 'pmCycle.name',
    headerName: 'Mat. Description',
    width: 100,
    colId: 'childCode.description'
  },
  {
    ...defaultColDef,
    field: 'childCode.materialType',
    // tooltipField: 'noticeYN',
    headerName: 'Mat. Type',
    width: 100,
    colId: 'childCode.materialType'
  },
  {
    ...defaultColDef,
    field: 'calType',
    // tooltipField: 'noticePIC',
    headerName: 'Cal Type',
    width: 100,
    colId: 'calType'
  },
  {
    ...defaultColDef,
    field: 'poPlanQty',
    // tooltipField: 'noticeBefore',
    headerName: 'Plan Qty',
    width: 100,
    colId: 'poPlanQty'
  },
  {
    ...defaultColDef,
    field: 'standQty',
    // tooltipField: 'noticeCycle.name',
    headerName: 'Stand Qty',
    width: 100,
    colId: 'standQty'
  },
  {
    ...defaultColDef,
    field: 'poStandQty',
    // tooltipField: 'pmContent',
    headerName: 'Plan Stand Qty',
    width: 100,
    colId: 'poStandQty'
  },
  {
    ...defaultColDef,
    field: 'poLossQty',
    // tooltipField: 'pmContent',
    headerName: 'Plan Loss Qty',
    width: 100,
    colId: 'poLossQty'
  },
  {
    ...defaultColDef,
    field: 'poTestQty',
    // tooltipField: 'pmContent',
    headerName: 'Test Qty',
    width: 100,
    colId: 'poTestQty'
  },
  {
    ...defaultColDef,
    field: 'validFrom',
    // tooltipField: 'pmContent',
    headerName: 'Valid From',
    width: 100,
    colId: 'validFrom'
  },
  {
    ...defaultColDef,
    field: 'childCode.materialGroup.code',
    // tooltipField: 'pmContent',
    headerName: 'Mat. Group',
    width: 100,
    colId: 'childCode.materialGroup.code'
  },
  {
    ...defaultColDef,
    field: 'childCode.spec',
    // tooltipField: 'pmContent',
    headerName: 'Material Spec.',
    width: 100,
    colId: 'childCode.spec'
  },
  {
    ...defaultColDef,
    field: 'devStatus.name',
    // tooltipField: 'pmContent',
    headerName: 'Dev. Status',
    width: 100,
    colId: 'devStatus.name'
  },
  {
    ...defaultColDef,
    field: 'supplierName',
    // tooltipField: 'pmContent',
    headerName: 'Supplier',
    width: 100,
    colId: 'supplierName'
  },
  {
    ...defaultColDef,
    field: 'remark',
    // tooltipField: 'pmContent',
    headerName: 'Remark',
    width: 100,
    colId: 'remark'
  },

  ...defaultAuditFields
];
