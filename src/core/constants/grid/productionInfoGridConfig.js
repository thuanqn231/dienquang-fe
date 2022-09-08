import { defaultColDef } from './defaultColDef';

export const productionInfoGridConfig = [
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'pk.factoryName',
    tooltipField: 'pk.factoryName',
    headerName: 'Factory',
    colId: 'pk.factoryName',
    width: 140,
    hide: true
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'labelDetail.goodReceiptPlan.productionOrder.modelId.parentCode.materialId',
    headerName: 'Material ID',
    colId: 'labelDetail.goodReceiptPlan.productionOrder.modelId.parentCode.materialId',
    tooltipField: 'labelDetail.goodReceiptPlan.productionOrder.modelId.parentCode.materialId',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'labelDetail.goodReceiptPlan.productionOrder.modelId.parentCode.code',
    headerName: 'Material Code',
    colId: 'labelDetail.goodReceiptPlan.productionOrder.modelId.parentCode.code',
    tooltipField: 'labelDetail.goodReceiptPlan.productionOrder.modelId.parentCode.code',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'labelDetail.goodReceiptPlan.productionOrder.modelId.parentCode.description',
    headerName: 'Material Desc.',
    colId: 'labelDetail.goodReceiptPlan.productionOrder.modelId.parentCode.description',
    tooltipField: 'labelDetail.goodReceiptPlan.productionOrder.modelId.parentCode.description',
    width: 120
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'labelDetail.goodReceiptPlan.productionOrder.modelId.parentCode.mainUnit.code',
    headerName: 'Unit',
    colId: 'labelDetail.goodReceiptPlan.productionOrder.modelId.parentCode.mainUnit.code',
    tooltipField: 'labelDetail.goodReceiptPlan.productionOrder.modelId.parentCode.mainUnit.code',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'labelNo',
    headerName: 'Label',
    colId: 'labelNo',
    tooltipField: 'labelNo',
    width: 80
  },

  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'lotNo',
    headerName: 'Lot No',
    colId: 'lotNo',
    tooltipField: 'lotNo',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'labelDetail.goodReceiptPlan.productionOrder.line.code',
    headerName: 'Line Code',
    colId: 'labelDetail.goodReceiptPlan.productionOrder.line.code',
    tooltipField: 'labelDetail.goodReceiptPlan.productionOrder.line.code',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'labelDetail.goodReceiptPlan.productionOrder.line.name',
    headerName: 'Line Name',
    colId: 'labelDetail.goodReceiptPlan.productionOrder.line.name',
    tooltipField: 'labelDetail.goodReceiptPlan.productionOrder.line.name',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'labelDetail.goodReceiptPlan.orderNo',
    headerName: 'Order No',
    colId: 'labelDetail.goodReceiptPlan.orderNo',
    tooltipField: 'labelDetail.goodReceiptPlan.orderNo',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'labelDetail.goodReceiptPlan.grNo',
    headerName: 'G/R No',
    colId: 'labelDetail.goodReceiptPlan.grNo',
    tooltipField: 'labelDetail.goodReceiptPlan.grNo',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'labelDetail.goodReceiptPlan.planDate',
    headerName: 'Plan Date',
    colId: 'labelDetail.goodReceiptPlan.planDate',
    tooltipField: 'labelDetail.goodReceiptPlan.planDate',
    width: 120
  },

  {
    ...defaultColDef,
    field: 'usrLogI',
    headerName: 'Prod. PIC',
    colId: 'usrLogI',
    tooltipField: 'usrLogI',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 60
  },
  {
    ...defaultColDef,
    field: 'dteLogI',
    headerName: 'Prod. Time',
    colId: 'dteLogI',
    tooltipField: 'dteLogI',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 70
  },
  {
    ...defaultColDef,
    field: 'qty',
    headerName: 'Prod. Qty',
    colId: 'qty',
    tooltipField: 'qty',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 60
  }
];
