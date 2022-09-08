import { defaultColDef } from './defaultColDef';

export const adjustIncreaseClosingGridConfig = [
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
    field: 'label.labelDetail.material.name',
    headerName: 'Material Name',
    colId: 'label.labelDetail.material.name',
    tooltipField: 'label.labelDetail.material.name',
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
    field: 'label.labelDetail.material.mainUnit.code',
    headerName: 'Unit',
    colId: 'label.labelDetail.material.mainUnit.code',
    tooltipField: 'label.labelDetail.material.mainUnit.code',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'bin.zone.stock.code',
    headerName: 'Storage Code',
    colId: 'bin.zone.stock.code',
    tooltipField: 'bin.zone.stock.code',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'bin.zone.stock.name',
    headerName: 'Storage Name',
    colId: 'bin.zone.stock.name',
    tooltipField: 'bin.zone.stock.name',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'operationType.name',
    headerName: 'Oper. Type',
    colId: 'operationType.name',
    tooltipField: 'operationType.name',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'objectType.name',
    headerName: 'Object Type',
    colId: 'objectType.name',
    tooltipField: 'objectType.name',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'reason.name',
    headerName: 'Reason',
    colId: 'reason.name',
    tooltipField: 'reason.name',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'detailReason',
    headerName: 'Detail Reason',
    colId: 'detailReason',
    tooltipField: 'detailReason',
    width: 120
  },

  {
    ...defaultColDef,
    field: 'label.lotNo',
    headerName: 'Lot No',
    colId: 'label.lotNo',
    tooltipField: 'label.lotNo',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'operationDate',
    headerName: 'Operation Date',
    colId: 'operationDate',
    tooltipField: 'operationDate',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'dteLogI',
    headerName: 'Registered Date',
    colId: 'dteLogI',
    tooltipField: 'dteLogI',
    width: 80
  },
  {
    ...defaultColDef,
    field: 'usrLogI',
    headerName: 'Registered PIC',
    colId: 'usrLogI',
    tooltipField: 'usrLogI',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'dteLogU',
    headerName: 'Changed Date',
    colId: 'dteLogU',
    tooltipField: 'dteLogU',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'usrLogU',
    headerName: 'Changed PIC',
    colId: 'usrLogU',
    tooltipField: 'usrLogU',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'stockQtyChange',
    headerName: 'Stock Qty',
    colId: 'stockQtyChange',
    tooltipField: 'stockQtyChange',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 120
  }
];
