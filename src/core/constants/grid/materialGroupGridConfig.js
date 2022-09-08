import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const materialGroupGridConfig = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'code',
    headerName: 'Material Group Code',
    colId: 'code',
    width: 240,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'name',
    headerName: 'Material Group Name',
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
