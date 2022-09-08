import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const factorySampleRuleGridConfig = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    suppressMovable: true,
    headerName: 'Product Group',
    field: 'productGroup.name',
    colId: 'productGroup.name',
    tooltipField: "productGroup.name",
    width: 140,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    headerName: 'Inspection Type',
    field: 'inspectionType.name',
    colId: 'inspectionType.name',
    tooltipField: "inspectionType.name",
    width: 140,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    headerName: 'Quality Control Size',
    field: 'qualityControlSize.name',
    colId: 'qualityControlSize.name',
    tooltipField: "qualityControlSize.name",
    width: 140,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    headerName: 'Lot. Qty Min',
    field: 'lotQtyMin',
    colId: 'lotQtyMin',
    tooltipField: "lotQtyMin",
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 100
  },
  {
    ...defaultColDef,
    headerName: 'Lot. Qty Max',
    field: 'lotQtyMax',
    colId: 'lotQtyMax',
    tooltipField: "lotQtyMax",
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 100
  },
  {
    ...defaultColDef,
    headerName: 'Sample Qty',
    field: 'sampleQty',
    colId: 'sampleQty',
    tooltipField: "sampleQty",
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 100
  },
  ...defaultAuditFields
];
