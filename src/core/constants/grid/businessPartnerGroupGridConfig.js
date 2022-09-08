import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const businessPartnerGroupGridConfig = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'code',
    headerName: 'Biz Partner Group Code',
    colId: 'code',
    width: 240,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'name',
    headerName: 'Biz Partner Group Name',
    colId: 'name',
    width: 240,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'description',
    headerName: 'Remark',
    colId: 'description',
    width: 340
  },
  ...defaultAuditFields
];
