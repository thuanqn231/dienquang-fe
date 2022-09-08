import { defaultColDef } from './defaultColDef';

import { defaultAuditFields } from './defaultAuditFields';

export const inspectionResultGridConfig = [
  {
    ...defaultColDef,
    filter: false,
    suppressColumnsToolPanel: true,
    suppressMovable: true,
    sortable: false,
    checkboxSelection: true,
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
    field: 'goodReceiptPlan.pk.factoryName',
    tooltipField: 'goodReceiptPlan.pk.factoryName',
    headerName: 'Factory',
    colId: 'goodReceiptPlan.pk.factoryName',
    width: 100,
    pinned: 'left'
  },
  {
    ...defaultColDef,

    field: 'goodReceiptPlan.goodReceiptPlanType',
    headerName: 'Type',
    colId: 'goodReceiptPlan.goodReceiptPlanType',
    tooltipField: 'goodReceiptPlan.goodReceiptPlanType',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,

    field: 'goodReceiptPlan.planDate',
    headerName: 'Plan Date',
    colId: 'goodReceiptPlan.planDate',
    tooltipField: 'goodReceiptPlan.planDate',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,

    field: 'goodReceiptPlan.grNo',
    headerName: 'G/R No.',
    colId: 'goodReceiptPlan.grNo',
    tooltipField: 'goodReceiptPlan.grNo',
    cellRendererFramework: null,
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,

    field: 'goodReceiptPlan.orderNo',
    headerName: 'Order No',
    colId: 'goodReceiptPlan.orderNo',
    tooltipField: 'goodReceiptPlan.orderNo',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,

    field: 'calculatedQcResult.description',
    headerName: 'QC Result',
    colId: 'calculatedQcResult.description',
    tooltipField: 'calculatedQcResult.description',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,

    field: 'goodReceiptPlan.material.materialId',
    headerName: 'Material ID',
    colId: 'goodReceiptPlan.material.materialId',
    tooltipField: 'goodReceiptPlan.material.materialId',
    width: 80
  },
  {
    ...defaultColDef,

    field: 'goodReceiptPlan.material.code',
    headerName: 'Material Code',
    colId: 'goodReceiptPlan.material.code',
    tooltipField: 'goodReceiptPlan.material.code',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'goodReceiptPlan.material.description',
    headerName: 'Material Desc.',
    colId: 'goodReceiptPlan.material.description',
    tooltipField: 'goodReceiptPlan.material.description',
    width: 120
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'goodReceiptPlan.material.version',
    headerName: 'Material Version',
    colId: 'goodReceiptPlan.material.version',
    tooltipField: 'goodReceiptPlan.material.version',
    width: 80
  },
  {
    ...defaultColDef,

    field: 'goodReceiptPlan.material.mrp.name',
    headerName: 'MRP Controller',
    colId: 'goodReceiptPlan.material.mrp.name',
    tooltipField: 'goodReceiptPlan.material.mrp.name',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'goodReceiptPlan.planQty',
    headerName: 'Plan Qty',
    colId: 'goodReceiptPlan.planQty',
    tooltipField: 'planQty',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'goodReceiptPlan.material.mainUnit.code',
    headerName: 'Unit',
    colId: 'goodReceiptPlan.material.mainUnit.code',
    tooltipField: 'goodReceiptPlan.material.mainUnit.code',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'goodReceiptPlan.grType.description',
    headerName: 'G/R Type',
    colId: 'goodReceiptPlan.grType.description',
    tooltipField: 'goodReceiptPlan.grType',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'qty',
    headerName: 'Inspect Qty',
    colId: 'qty',
    tooltipField: 'qty',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'ballanceQty',
    headerName: 'Bal Qty',
    colId: 'ballanceQty',
    tooltipField: 'ballanceQty',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'sampleQty',
    headerName: 'Sample Qty',
    colId: 'sampleQty',
    tooltipField: 'sampleQty',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'ngQty',
    headerName: 'NG Qty',
    colId: 'ngQty',
    tooltipField: 'ngQty',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'goodReceiptPlan.supplier.nationalName',
    headerName: 'Supplier',
    colId: 'goodReceiptPlan.supplier.nationalName',
    tooltipField: 'goodReceiptPlan.supplier.nationalName',
    width: 100
  },

  {
    ...defaultColDef,
    field: 'goodReceiptPlan.line.processType.description',
    headerName: 'Process Type',
    colId: 'goodReceiptPlan.line.processType.description',
    tooltipField: 'goodReceiptPlan.line.processType.description',
    width: 100
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'goodReceiptPlan.line.name',
    headerName: 'Line Name',
    colId: 'goodReceiptPlan.line.name',
    tooltipField: 'goodReceiptPlan.line.name',
    width: 120
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'goodReceiptPlan.line.code',
    headerName: 'Line Code',
    colId: 'goodReceiptPlan.line.code',
    tooltipField: 'goodReceiptPlan.line.code',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'action.description',
    headerName: 'QC Action',
    colId: 'action.description',
    tooltipField: 'action.description',

    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'approvalStatus.description',
    headerName: 'Approval Status',
    colId: 'approvalStatus.description',
    tooltipField: 'approvalStatus.description',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'approval.approvedTime',
    headerName: 'Approval Time',
    colId: 'approval.approvedTime',
    tooltipField: 'approval.approvedTime',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'approval.usrLogU',
    headerName: 'Approval PIC',
    colId: 'approval.usrLogU',
    tooltipField: 'approval.usrLogU',
    width: 80
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
    suppressMovable: true,
    field: 'status',
    headerName: 'Order Status',
    colId: 'status',
    tooltipField: 'status',
    width: 80
  },

  {
    ...defaultColDef,
    field: 'goodReceiptPlan.tecoRemark',
    headerName: 'Teco Reason',
    colId: 'goodReceiptPlan.tecoRemark',
    tooltipField: 'goodReceiptPlan.tecoRemark',
    width: 80
  },
  ...defaultAuditFields
];
