import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const lossMasterGridConfig = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'lossType.name',
    headerName: 'Loss Type',
    colId: 'lossType.name',
    width: 140
    // pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'classification.description',
    headerName: 'Classification',
    colId: 'classification.description',
    width: 240
    // pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'lossCls.name',
    headerName: 'Loss Detail Cls',
    colId: 'lossCls.name',
    width: 340
  },
  {
    ...defaultColDef,
    field: 'lossItem',
    headerName: 'Loss Item',
    colId: 'lossItem',
    width: 260
  },
  ...defaultAuditFields
];
