import { defaultColDef } from './defaultColDef';

export const userSearchGridConfig = [
  {
    ...defaultColDef,
    filter: false,
    suppressColumnsToolPanel: true,
    suppressMovable: true,
    sortable: false,
    checkboxSelection: true,
    maxWidth: 50,
    colId: '0',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'departmentName',
    headerName: 'Department',
    colId: 'departmentName',
    width: 300
  },
  {
    ...defaultColDef,
    field: 'employeeId',
    headerName: 'User ID',
    colId: 'employeeId',
    width: 300
  },
  {
    ...defaultColDef,
    field: 'fullName',
    headerName: 'User Name',
    colId: 'fullName',
    width: 300
  },

  {
    ...defaultColDef,
    field: 'email',
    headerName: 'Email',
    colId: 'email',
    width: 250
  }
];
