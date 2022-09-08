import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const processGridConfig = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'line.code',
    headerName: 'Line Code',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'line.code',
    width: 110,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'line.name',
    headerName: 'Line Name',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'line.name',
    width: 120,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'code',
    headerName: 'Process Code',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'code',
    width: 120,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'name.name',
    headerName: 'Process Name',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'name.name',
    width: 120,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'finalYn',
    headerName: 'Final(Y/N)',
    colId: 'finalYn',
    width: 90
  },
  {
    ...defaultColDef,
    field: 'prodPlan',
    headerName: 'Prod. Plan(Y/N)',
    colId: 'prodPlan',
    width: 110
  },
  {
    ...defaultColDef,
    field: 'barcodeYn',
    headerName: 'Barcode(Y/N)',
    colId: 'barcodeYn',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'inputYn',
    headerName: 'Input(Y/N)',
    colId: 'inputYn',
    width: 100
  },

  {
    ...defaultColDef,
    field: 'tackTimeYn',
    headerName: 'T/Time(Y/N)',
    colId: 'tackTimeYn',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'rank',
    headerName: 'Sort Order',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    colId: 'rank',
    width: 90
  },
  ...defaultAuditFields
];
