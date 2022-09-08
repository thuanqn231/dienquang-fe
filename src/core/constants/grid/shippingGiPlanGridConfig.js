import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const shippingGiPlanGridConfig = [
  {
    ...defaultColDef,
    filter: false,
    suppressColumnsToolPanel: true,
    suppressMovable: true,
    sortable: false,
    checkboxSelection: true,
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
    maxWidth: 21,
    colId: '0',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    filter: false,
    suppressMovable: true,
    sortable: false,
    field: 'row_index',
    headerName: 'No.',
    valueGetter: 'node.rowIndex + 1',
    minWidth: 45,
    colId: 'row_index',
    width: 45,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'pk.factoryName',
    tooltipField: 'pk.factoryName',
    headerName: 'Factory',
    colId: 'pk.factoryName',
    width: 140,
    pinned: 'left',
    hide: true
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'planDate',
    headerName: 'Plan Date',
    colId: 'planDate',
    tooltipField: 'planDate',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'planId',
    headerName: 'Plan ID',
    colId: 'planId',
    tooltipField: 'planId',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'giNo',
    headerName: 'G/I No.',
    colId: 'giNo',
    tooltipField: 'giNo',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'approvalStatus.description',
    headerName: 'Status',
    colId: 'approvalStatus.description',
    tooltipField: 'approvalStatus.description',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'soNo',
    headerName: 'SO No',
    colId: 'soNo',
    tooltipField: 'soNo',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'material.materialId',
    headerName: 'Material ID',
    colId: 'material.materialId',
    tooltipField: 'material.materialId',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'material.code',
    headerName: 'Material Code',
    colId: 'material.code',
    tooltipField: 'material.code',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'material.name',
    headerName: 'Material Name',
    colId: 'material.name',
    tooltipField: 'material.name',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'material.description',
    headerName: 'Material Desc.',
    colId: 'material.description',
    tooltipField: 'material.description',
    width: 120
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'material.mrp.name',
    headerName: 'MRP Controller',
    colId: 'material.mrp.name',
    tooltipField: 'material.mrp.name',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'giStatus.name',
    headerName: 'G/I Status',
    colId: 'giStatus.name',
    tooltipField: 'giStatus.name',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'giType.name',
    headerName: 'G/I Type',
    colId: 'giType.name',
    tooltipField: 'giType.name',
    width: 120
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'supplier.nationalName',
    headerName: 'Customer',
    colId: 'supplier.nationalName',
    tooltipField: 'supplier.nationalName',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'planQty',
    headerName: 'Plan Qty',
    colId: 'planQty',
    tooltipField: 'planQty',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'actualQty',
    headerName: 'Actual G/I Qty',
    colId: 'actualQty',
    tooltipField: 'actualQty',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'balQty',
    headerName: 'Bal Qty',
    colId: 'balQty',
    tooltipField: 'balQty',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 80
  },

  {
    ...defaultColDef,
    field: 'material.mainUnit.name',
    headerName: 'Unit',
    colId: 'material.mainUnit.name',
    tooltipField: 'material.mainUnit.name',
    width: 100
  },

  {
    ...defaultColDef,
    field: 'remark',
    headerName: 'Remark',
    colId: 'remark',
    tooltipField: 'remark',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'teco.name',
    headerName: 'TECO Reason',
    colId: 'teco.name',
    tooltipField: 'teco.name',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'tecoRemark',
    headerName: 'TECO Remark',
    colId: 'tecoRemark',
    tooltipField: 'tecoRemark',
    width: 120
  },
  ...defaultAuditFields
];
