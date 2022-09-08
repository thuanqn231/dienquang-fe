import { defaultColDef } from './defaultColDef';

export const backflushInfoGridConfig = [
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
    field: 'childCode.materialId',
    headerName: 'Material ID',
    colId: 'childCode.materialId',
    tooltipField: 'childCode.materialId',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'childCode.code',
    headerName: 'Material Code',
    colId: 'childCode.code',
    tooltipField: 'childCode.code',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'childCode.description',
    headerName: 'Material Desc.',
    colId: 'childCode.description',
    tooltipField: 'childCode.description',
    width: 120
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'childCode.mainUnit.code',
    headerName: 'Unit',
    colId: 'childCode.mainUnit.code',
    tooltipField: 'childCode.mainUnit.code',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'productionOrder.planDate',
    headerName: 'Plan Date',
    colId: 'productionOrder.planDate',
    tooltipField: 'productionOrder.planDate',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'productionOrder.prodOrderNo',
    headerName: 'PO No',
    colId: 'productionOrder.prodOrderNo',
    tooltipField: 'productionOrder.prodOrderNo',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'productionOrder.modelId.parentCode.materialId',
    headerName: 'PO Model ID',
    colId: 'productionOrder.modelId.parentCode.materialId',
    tooltipField: 'productionOrder.modelId.parentCode.materialId',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'productionOrder.modelId.parentCode.code',
    headerName: 'PO Model Code',
    colId: 'productionOrder.modelId.parentCode.code',
    tooltipField: 'productionOrder.modelId.parentCode.code',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'productionOrder.modelId.parentCode.description',
    headerName: 'PO Model Desc.',
    colId: 'productionOrder.modelId.parentCode.description',
    tooltipField: 'productionOrder.modelId.parentCode.description',
    width: 70
  },
  {
    ...defaultColDef,
    field: 'productionOrder.modelId.bomVersionParent',
    headerName: 'Model Version',
    colId: 'productionOrder.modelId.bomVersionParent',
    tooltipField: 'productionOrder.modelId.bomVersionParent',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'productionOrder.planQty',
    headerName: 'PO Plan Qty',
    colId: 'productionOrder.planQty',
    tooltipField: 'productionOrder.planQty',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'productionOrder.line.code',
    headerName: 'Line Code',
    colId: 'productionOrder.line.code',
    tooltipField: 'productionOrder.line.code',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'productionOrder.line.name',
    headerName: 'Line Name',
    colId: 'productionOrder.line.name',
    tooltipField: 'productionOrder.line.name',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'productionOrder.prodStatus.description',
    headerName: 'Production Status',
    colId: 'productionOrder.prodStatus.description',
    tooltipField: 'productionOrder.prodStatus.description',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'productionOrder.poType.description',
    headerName: 'PO Type',
    colId: 'productionOrder.poType.description',
    tooltipField: 'productionOrder.poType.description',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'productionOrder.actualQty',
    headerName: 'PO Act. Qty',
    colId: 'productionOrder.actualQty',
    tooltipField: 'productionOrder.actualQty',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'standQty',
    headerName: 'Stand. Qty',
    colId: 'standQty',
    tooltipField: 'standQty',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 60
  },
  {
    ...defaultColDef,
    field: 'testQty',
    headerName: 'Testing Qty',
    colId: 'testQty',
    tooltipField: 'testQty',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 60
  },
  {
    ...defaultColDef,
    field: 'lossQty',
    headerName: 'Loss Rate',
    colId: 'lossQty',
    tooltipField: 'lossQty',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 70
  },
  {
    ...defaultColDef,
    field: 'total',
    headerName: 'Total',
    colId: 'total',
    tooltipField: 'total',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 120
  }
];
