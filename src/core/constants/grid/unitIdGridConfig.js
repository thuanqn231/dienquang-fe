import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const unitIDGridConfig = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'code',
    headerName: 'Unit ID',
    colId: 'id',
    width: 240,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'name',
    headerName: 'Unit Name',
    colId: 'name',
    width: 200
  },
  {
    ...defaultColDef,
    field: 'sum',
    headerName: 'Sum (Y/N)',
    colId: 'sum',
    width: 200
  },
  {
    ...defaultColDef,
    field: 'fp',
    headerName: 'F/P (Y/N)',
    colId: 'fp',
    width: 200
  },
  ...defaultAuditFields
];
