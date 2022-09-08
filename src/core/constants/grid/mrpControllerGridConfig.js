import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const mrpControllerGridConfig = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'code',
    headerName: 'MRP Controller Code',
    colId: 'code',
    width: 240,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'name',
    width: 240,
    headerName: 'MRP Controller Name',
    colId: 'name',
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
