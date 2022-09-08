import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const factorySymtomCauseMapping = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'productGroup.name',
    // tooltipField: 'equipmentID.equipmentLine.name',
    headerName: 'Product Group',
    width: 100,
    colId: 'productGroup.name',
    pinned: 'left'
  },

  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'processType.name',
    // tooltipField: 'equipmentID.equipmentProcess.name.name',
    headerName: 'Process Type Name',
    width: 130,
    colId: 'processType.name',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'process.name.name',
    // tooltipField: 'equipmentID.equipmentWorkStation.name',
    headerName: 'Process Name',
    width: 130,
    colId: 'process.name.name',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'defectSymptomDetail.defectSymptomClass.code',
    // tooltipField: 'equipmentID.code',
    headerName: 'Symptom Class Code',
    width: 130,
    colId: 'defectSymptomClass.code',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'defectSymptomDetail.defectSymptomClass.name',
    // tooltipField: 'equipmentID.name',
    headerName: 'Symptom Class Name',
    width: 130,
    colId: 'defectSymptomClass.name',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'defectSymptomDetail.code',
    // tooltipField: 'code',
    headerName: 'Symptom Code',
    width: 130,
    colId: 'defectSymptomDetail.code',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'defectSymptomDetail.name',
    // tooltipField: 'pmStartDate',
    headerName: 'Symptom Name',
    width: 130,
    colId: 'defectSymptomDetail.name'
  },
  {
    ...defaultColDef,
    field: 'defectLevel.name',
    // tooltipField: 'pmType.name',
    headerName: 'Defect Level',
    width: 130,
    colId: 'defectLevel.name'
  },
  {
    ...defaultColDef,
    field: 'defectCauseDetail.code',
    // tooltipField: 'pmCycle.name',
    headerName: 'Cause Code',
    width: 130,
    colId: 'defectCauseDetail.code'
  },
  {
    ...defaultColDef,
    field: 'defectCauseDetail.name',
    // tooltipField: 'noticeYN',
    headerName: 'Cause Name',
    width: 130,
    colId: 'defectCauseDetail.name'
  },
  ...defaultAuditFields
];