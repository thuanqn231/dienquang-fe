import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const stockGridConfig = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'stockType.name',
    headerName: 'Material Type',
    colId: 'stockType.name',
    width: 130,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'code',
    headerName: 'Storage Code',
    colId: 'code',
    width: 100,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'name',
    headerName: 'Storage Name',
    colId: 'name',
    width: 140,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'personInCharge',
    headerName: 'PIC',
    colId: 'personInCharge',
    width: 60
  },
  {
    ...defaultColDef,
    field: 'agingDay',
    headerName: 'Aging Day',
    colId: 'agingDay',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'overAgingDay',
    headerName: 'Critical Aging Day',
    colId: 'overAgingDay',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'remark',
    headerName: 'Remark',
    colId: 'remark',
    width: 200
  },
  ...defaultAuditFields
];
