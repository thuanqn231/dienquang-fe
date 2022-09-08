import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const factoryDSGridConfig = [
  ...defaultFactoryFields,

  {
    ...defaultColDef,
    field: 'productGroup.description',
    headerName: 'Product Group',
    colId: 'productGroup.description',
    width: 100,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'processType.description',
    headerName: 'Process Type Name',
    colId: 'processType.description',
    width: 100,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'process.name.name',
    headerName: 'Process Name',
    colId: 'process.name.name',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'defectSymptomDetail.defectSymptomClass.code',
    headerName: 'Symptom Class Code',
    colId: 'defectSymptomDetail.defectSymptomClass.code',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'defectSymptomDetail.defectSymptomClass.name',
    headerName: 'Symptom Class Name',
    colId: 'defectSymptomDetail.defectSymptomClass.name',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'defectSymptomDetail.code',
    headerName: 'Symptom Code',
    colId: 'defectSymptomDetail.code',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'defectSymptomDetail.name',
    headerName: 'Symptom Name',
    colId: 'defectSymptomDetail.name',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'level.description',
    headerName: 'Defect Level',
    colId: 'level.description',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'rank',
    headerName: 'Sort Order',
    colId: 'rank',
    width: 100
  },

  ...defaultAuditFields
];
