import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const workstationGridConfig = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'process.line.code',
    headerName: 'Line Code',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'process.line.code',
    width: 100,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'process.line.name',
    headerName: 'Line Name',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'process.line.name',
    width: 130,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'process.code',
    headerName: 'Process Code',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'process.code',
    width: 110,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'process.name.name',
    headerName: 'Process Name',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'process.name.name',
    width: 130,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'code',
    headerName: 'WS Code',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'code',
    width: 200,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'name',
    headerName: 'WS Name',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'name',
    width: 200,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'rank',
    headerName: 'Sort Order',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    colId: 'rank',
    width: 90
  },
  {
    ...defaultColDef,
    field: 'reflect',
    headerName: 'Reflect (Y/N)',
    cellClass: 'vertical-middle',
    colId: 'reflect',
    width: 100
  },

  {
    ...defaultColDef,
    field: 'lossCalculation.name',
    headerName: 'Loss Calculation',
    cellClass: 'vertical-middle',
    colId: 'lossCalculation.name',
    width: 100
  },
  ...defaultAuditFields
];
