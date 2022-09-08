import { defaultColDef } from './defaultColDef';

export const factoryDefectCauseGridConfig = [
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
    minWidth: 60,
    colId: 'row_index',
    width: 60,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'pk.factoryName',
    headerName: 'Factory',
    colId: 'pk.factoryName',
    width: 120,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'productGroup.name',
    headerName: 'Product Group',
    colId: 'productGroup.name',
    width: 120,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'processTypeCode.name',
    headerName: 'Process Type Name',
    colId: 'processTypeCode.name',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'process.name.name',
    headerName: 'Process Name',
    colId: 'process.name.name',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'defectCauseDetail.defectCauseClass.code',
    headerName: 'Cause Class Code',
    colId: 'defectCauseDetail.defectCauseClass.code',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'defectCauseDetail.defectCauseClass.name',
    headerName: 'Cause Class Name',
    colId: 'defectCauseDetail.defectCauseClass.name',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'defectCauseDetail.code',
    headerName: 'Cause Code',
    colId: 'defectCauseDetail.code',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'defectCauseDetail.name',
    headerName: 'Cause Name',
    colId: 'defectCauseDetail.name',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'rank',
    headerName: 'Sort Order',
    colId: 'rank',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'state',
    headerName: 'User (Y/N)',
    colId: 'state',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'usrLogI',
    tooltipField: 'usrLogI',
    headerName: 'Registered By',
    cellClass: 'vertical-middle',
    colId: 'usrLogI',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'dteLogI',
    tooltipField: 'dteLogI',
    headerName: 'Registered Date',
    cellClass: 'vertical-middle',
    colId: 'dteLogI',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'usrLogU',
    tooltipField: 'usrLogU',
    headerName: 'Changed By',
    cellClass: 'vertical-middle',
    colId: 'usrLogU',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'dteLogU',
    tooltipField: 'dteLogU',
    headerName: 'Changed Date',
    cellClass: 'vertical-middle',
    colId: 'dteLogU',
    width: 120
  }
];
