import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const lineStockAdjustmentGridConfig = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    field: 'line.name',
    headerName: 'Line',
    colId: 'line.name',
    tooltipField: 'line.name',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    width: 90,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'material.materialId',
    headerName: 'Material ID',
    colId: 'material.materialId',
    tooltipField: 'material.materialId',
    width: 90,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'material.name',
    headerName: 'Material Name',
    colId: 'material.name',
    tooltipField: 'material.name',
    width: 110,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'material.code',
    headerName: 'Material Code',
    colId: 'material.code',
    tooltipField: 'material.code',
    width: 100,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'material.description',
    headerName: 'Material Desc.',
    colId: 'material.description',
    tooltipField: 'material.description',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'material.mainUnit.name',
    headerName: 'Unit',
    colId: 'material.mainUnit.name',
    tooltipField: 'material.mainUnit.name',
    width: 60
  },
  {
    ...defaultColDef,
    field: 'operationType.name',
    headerName: 'Operation Type',
    colId: 'operationType.name',
    tooltipField: 'operationType.name',
    width: 110
  },
  {
    ...defaultColDef,
    field: 'objectType.name',
    headerName: 'Object Type',
    colId: 'objectType.name',
    tooltipField: 'objectType.name',
    width: 90
  },
  {
    ...defaultColDef,
    field: 'reason.name',
    headerName: 'Reason',
    colId: 'reason.name',
    tooltipField: 'reason.name',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'detailReason',
    headerName: 'Detail Reason',
    colId: 'detailReason',
    tooltipField: 'detailReason',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'supplier.nationalName',
    headerName: 'Supplier',
    colId: 'supplier.nationalName',
    tooltipField: 'supplier.nationalName',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'lotNo',
    headerName: 'Lot. No',
    colId: 'lotNo',
    tooltipField: 'lotNo',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'operationDate',
    headerName: 'Operation Date',
    colId: 'operationDate',
    tooltipField: 'operationDate',
    width: 110
  },
  {
    ...defaultColDef,
    field: 'quantity',
    headerName: 'Stock Qty',
    colId: 'quantity',
    tooltipField: 'quantity',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 90
  },
  ...defaultAuditFields
];
