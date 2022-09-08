import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';
import { defaultColDef } from './defaultColDef';
import { fDateTime } from '../../../utils/formatTime';

export const tactTimeGridConfig = [
  ...defaultFactoryFields,

  {
    ...defaultColDef,
    field: 'material.code',
    headerName: 'Material Code',
    colId: 'material.code',
    width: 230,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'material.name',
    headerName: 'Material Name',
    colId: 'material.name',
    width: 230,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'material.materialId',
    headerName: 'Material ID',
    colId: 'material.materialId',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'line.code',
    headerName: 'Line Code',
    colId: 'line.code',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'line.name',
    headerName: 'Line Name',
    colId: 'line.name',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'shift.name',
    headerName: 'Shift',
    colId: 'shift.name',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'time',
    headerName: 'Tact Time',
    colId: 'time',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'applyStartDate',
    headerName: 'Apply Start Date',
    colId: 'applyStartDate',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'applyEndDate',
    headerName: 'Apply End Date',
    colId: 'applyEndDate',
    width: 230
  },
  ...defaultAuditFields
];
