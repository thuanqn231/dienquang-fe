import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const equipmentGroupGridConfig = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'code',
    headerName: 'Equip. Grp Code',
    colId: 'code',
    width: 230,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'name',
    headerName: 'Equip. Grp Name',
    colId: 'name',
    width: 230,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'remark',
    headerName: 'Remark',
    colId: 'remark',
    width: 330
  },
  ...defaultAuditFields
];
