import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const materialMasterGridConfig = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'materialId',
    headerName: 'Material ID',
    colId: 'materialId',
    width: 90,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'code',
    headerName: 'Material Code',
    colId: 'code',
    width: 100,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'name',
    headerName: 'Material Name',
    colId: 'name',
    width: 100,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'materialType.name',
    headerName: 'Material Type',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'materialType.name',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'description',
    headerName: 'Material Description',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'description',
    width: 150
  },
  {
    ...defaultColDef,
    field: 'spec',
    headerName: 'Material Spec',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'spec',
    width: 150
  },
  {
    ...defaultColDef,
    field: 'materialGroup.name',
    headerName: 'Material Group',
    colId: 'materialGroup.name',
    width: 110
  },
  {
    ...defaultColDef,
    field: 'dom.name',
    headerName: 'DOM/IMP',
    colId: 'dom.name',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'prodType.name',
    headerName: 'Proc. Type',
    colId: 'prodType.name',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'detailProc.name',
    headerName: 'Detail Proc.',
    colId: 'detailProc.name',
    width: 90
  },
  {
    ...defaultColDef,
    field: 'purchaser',
    headerName: 'Purchaser',
    cellClass: 'vertical-middle ag-left-aligned-cell',
    colId: 'purchaser',
    width: 90
  },
  {
    ...defaultColDef,
    field: 'mrpType.name',
    headerName: 'MRP Type',
    colId: 'mrpType.name',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'mrp.name',
    headerName: 'MRP Controller',
    colId: 'mrp.name',
    width: 110
  },
  {
    ...defaultColDef,
    field: 'price.name',
    headerName: 'Price Control',
    colId: 'price.name',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'status.name',
    headerName: 'Plan Status',
    colId: 'status.name',
    width: 90
  },
  {
    ...defaultColDef,
    field: 'qcStatus',
    headerName: 'QC (Y/N)',
    colId: 'qcStatus',
    width: 75
  },
  {
    ...defaultColDef,
    field: 'stock.name',
    headerName: 'Default Storage',
    colId: 'stock.name',
    width: 110
  },
  {
    ...defaultColDef,
    field: 'safetyStock',
    headerName: 'Safety Storage',
    colId: 'safetyStock',
    width: 105
  },
  {
    ...defaultColDef,
    field: 'changeCycle',
    headerName: 'Change Cycle',
    colId: 'changeCycle',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'transitTime',
    headerName: 'Transit Time',
    colId: 'transitTime',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'packingSize',
    headerName: 'Packing Size',
    colId: 'packingSize',
    width: 95
  },
  {
    ...defaultColDef,
    field: 'expireDay',
    headerName: 'Expire Day',
    colId: 'expireDay',
    width: 85
  },
  {
    ...defaultColDef,
    field: 'unitID.name',
    headerName: 'Unit ID',
    colId: 'unitID.name',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'giUnit.name',
    headerName: 'G/I Unit',
    colId: 'giUnit.name',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'mainUnit.name',
    headerName: 'Main Unit',
    colId: 'mainUnit.name',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'convertUnit.name',
    headerName: 'Convert Unit',
    colId: 'convertUnit.name',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'convertRate',
    headerName: 'Convert Rate',
    colId: 'convertRate',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'qualityControlSize.name',
    headerName: 'QC Size',
    colId: 'qualityControlSize.name',
    width: 70
  },
  ...defaultAuditFields
];
