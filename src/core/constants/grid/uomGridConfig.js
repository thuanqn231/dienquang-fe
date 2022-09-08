import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const uomGridConfig = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'code',
    headerName: 'Unit Code',
    colId: 'code',
    width: 240,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'name',
    headerName: 'Unit Name',
    colId: 'name',
    width: 240,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'description',
    headerName: 'Description',
    colId: 'description',
    width: 340
  },
  ...defaultAuditFields
];
