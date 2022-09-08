import { defaultColDef } from './defaultColDef';

export const grToWHGridConfig = [
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
    field: 'label.labelDetail.material.materialId',
    headerName: 'Material ID',
    colId: 'label.labelDetail.material.materialId',
    tooltipField: 'label.labelDetail.material.materialId',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'label.labelDetail.material.code',
    headerName: 'Material Code',
    colId: 'label.labelDetail.material.code',
    tooltipField: 'label.labelDetail.material.code',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'label.labelDetail.material.description',
    headerName: 'Material Desc.',
    colId: 'label.labelDetail.material.description',
    tooltipField: 'label.labelDetail.material.description',
    width: 120
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'label.labelDetail.material.mainUnit.name',
    headerName: 'Unit',
    colId: 'label.labelDetail.material.mainUnit.name',
    tooltipField: 'label.labelDetail.material.mainUnit.name',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'label.labelNo',
    headerName: 'Label',
    colId: 'label.labelNo',
    tooltipField: 'label.labelNo',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'stockStatus.description',
    headerName: 'Status',
    colId: 'stockStatus.description',
    tooltipField: 'stockStatus.description',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'label.lotNo',
    headerName: 'Lot No',
    colId: 'label.lotNo',
    tooltipField: 'label.lotNo',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'label.labelDetail.supplier.englishName',
    headerName: 'Supplier',
    colId: 'label.labelDetail.supplier.englishName',
    tooltipField: 'label.labelDetail.supplier.englishName',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'bin.zone.stock.name',
    headerName: 'Stock',
    colId: 'bin.zone.stock.name',
    tooltipField: 'bin.zone.stock.name',
    width: 70
  },
  {
    ...defaultColDef,
    field: 'bin.zone.code',
    headerName: 'Zone',
    colId: 'bin.zone.code',
    tooltipField: 'bin.zone.code',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'bin.code',
    headerName: 'Bin',
    colId: 'bin.code',
    tooltipField: 'bin.code',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'label.labelDetail.line.code',
    headerName: 'Line Code',
    colId: 'label.labelDetail.line.code',
    tooltipField: 'label.labelDetail.line.code',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'label.labelDetail.line.name',
    headerName: 'Line Name',
    colId: 'label.labelDetail.line.name',
    tooltipField: 'label.labelDetail.line.name',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'goodReceiptPlan.orderNo',
    headerName: 'Order No',
    colId: 'goodReceiptPlan.orderNo',
    tooltipField: 'goodReceiptPlan.orderNo',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'goodReceiptPlan.grNo',
    headerName: 'G/R No',
    colId: 'goodReceiptPlan.grNo',
    tooltipField: 'goodReceiptPlan.grNo',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'grDate',
    headerName: 'Last G/R Date',
    colId: 'grDate',
    tooltipField: 'grDate',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'lastGIDate',
    headerName: 'Last G/I Date',
    colId: 'lastGIDate',
    tooltipField: 'lastGiDate',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 60
  },
  {
    ...defaultColDef,
    field: 'grPic',
    headerName: 'G/R PIC',
    colId: 'grPic',
    tooltipField: 'grPic',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 60
  },
  {
    ...defaultColDef,
    field: 'lastGIPic',
    headerName: 'G/I PIC',
    colId: 'lastGIPic',
    tooltipField: 'lastGIPic',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 70
  },
  {
    ...defaultColDef,
    field: 'stockQtyChange',
    headerName: 'G/R Qty',
    colId: 'stockQtyChange',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    tooltipField: 'stockQtyChange',

    width: 60
  }
];
