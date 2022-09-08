import { defaultColDef } from './defaultColDef';

export const adjustDecreaseGridConfig = [
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
    field: 'material.materialId',
    headerName: 'Material ID',
    colId: 'material.materialId',
    tooltipField: 'material.materialId',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'material.code',
    headerName: 'Material Code',
    colId: 'material.code',
    tooltipField: 'material.code',
    width: 80
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
    field: 'material.mainUnit.code',
    headerName: 'Unit',
    colId: 'material.mainUnit.code',
    tooltipField: 'material.mainUnit.code',
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
    field: 'supplier.englishName',
    headerName: 'Supplier',
    colId: 'supplier.englishName',
    tooltipField: 'supplier.englishName',
    width: 70
  },
  {
    ...defaultColDef,
    field: 'lotNo',
    headerName: 'Lot No',
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
    field: 'quantity',
    headerName: 'Stock Qty',
    colId: 'quantity',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    tooltipField: 'quantity',
    width: 120
  }
];
