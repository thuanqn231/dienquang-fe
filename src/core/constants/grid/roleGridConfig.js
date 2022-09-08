import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const roleGridConfig = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'code',
    headerName: 'Role Code',
    colId: 'code',
    width: 100
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'name',
    headerName: 'Role Name',
    colId: 'name',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'description',
    headerName: 'Description',
    colId: 'description',
    width: 150
  },
  ...defaultAuditFields
];
