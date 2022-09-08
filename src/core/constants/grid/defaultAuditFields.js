import { defaultColDef } from './defaultColDef';

export const defaultAuditFields = [
  {
    ...defaultColDef,
    field: 'state',
    tooltipField: 'state',
    headerName: 'Use (Y/N)',
    cellClass: 'vertical-middle',
    colId: 'state',
    width: 80
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
    width: 140
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
