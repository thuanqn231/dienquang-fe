import { defaultColDef } from './defaultColDef';

export const manualLabelListGridConfig = [
  {
    ...defaultColDef,
    filter: false,
    suppressColumnsToolPanel: true,
    suppressMovable: true,
    sortable: false,
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
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
    width: 45
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'pk.factoryName',
    tooltipField: 'pk.factoryName',
    headerName: 'Factory',
    colId: 'pk.factoryName',
    width: 120,
    hide: true
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'boxLabelDetail.generateID',
    headerName: 'Generate ID',
    colId: 'boxLabelDetail.generateID',
    tooltipField: 'boxLabelDetail.generateID',
    width: 100
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'boxLabelDetail.material.code',
    headerName: 'Material Code',
    colId: 'boxLabelDetail.material.code',
    tooltipField: 'boxLabelDetail.material.code',
    width: 120
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'boxLabelDetail.material.name',
    headerName: 'Material Name',
    colId: 'boxLabelDetail.material.name',
    tooltipField: 'boxLabelDetail.material.name',
    width: 120
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'boxLabelDetail.material.materialId',
    headerName: 'Material ID',
    colId: 'boxLabelDetail.material.materialId',
    tooltipField: 'boxLabelDetail.material.materialId',
    width: 120
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'lotNo',
    headerName: 'Lot No.',
    colId: 'lotNo',
    tooltipField: 'lotNo',
    width: 120
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'labelNo',
    headerName: 'Box No.',
    colId: 'labelNo',
    tooltipField: 'labelNo',
    width: 200
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'boxLabelDetail.supplier.nationalName',
    headerName: 'Supplier',
    colId: 'boxLabelDetail.supplier.nationalName',
    tooltipField: 'boxLabelDetail.supplier.nationalName',
    width: 200
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'qty',
    headerName: 'Qty',
    colId: 'qty',
    tooltipField: 'qty',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'printNo',
    headerName: 'Print No.',
    colId: 'printNo',
    tooltipField: 'printNo',
    cellClass: 'vertical-middle ag-right-aligned-cell',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'lastPrintTime',
    headerName: 'Last Print Time',
    colId: 'lastPrintTime',
    tooltipField: 'lastPrintTime',
    width: 140
  },
  {
    ...defaultColDef,
    field: 'usrLogI',
    tooltipField: 'usrLogI',
    headerName: 'Registered By',
    cellClass: 'vertical-middle',
    colId: 'usrLogI',
    width: 140
  },
  {
    ...defaultColDef,
    field: 'usrLogU',
    tooltipField: 'usrLogU',
    headerName: 'Last Print By',
    cellClass: 'vertical-middle',
    colId: 'usrLogU',
    width: 140
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'rePrintReason',
    headerName: 'Re-Print Reason',
    colId: 'rePrintReason',
    tooltipField: 'rePrintReason',
    width: 200
  }
];
