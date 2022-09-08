import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';
import { defaultColDef } from './defaultColDef';

export const lossPicGridConfig = [
  ...defaultFactoryFields,

  {
    ...defaultColDef,
    field: 'lossType.name',
    headerName: 'Loss Category',
    colId: 'lossType.name',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'classification.name',
    headerName: 'Classification',
    colId: 'classification.name',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'lossCls.name',
    headerName: 'Loss Detail Cls',
    colId: 'lossCls.name',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'user.fullName',
    headerName: 'PIC Name',
    colId: 'user.fullName',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'user.userName',
    headerName: 'PIC ID',
    colId: 'user.userName',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'user.code',
    headerName: 'PIC NO',
    colId: 'user.code',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'user.department.name',
    headerName: 'Department',
    colId: 'user.department.name',
    width: 230
  },

  ...defaultAuditFields
];
