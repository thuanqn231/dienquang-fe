import { defaultColDef } from './defaultColDef';

export const lossPicRegistrationGridConfig = [
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
    field: 'fullName',
    headerName: 'Full Name',
    colId: 'fullName',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'employeeId',
    headerName: 'Employee ID',
    colId: 'employeeId',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'employeeNo',
    headerName: 'Employee No',
    colId: 'employeeNo',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'departmentName',
    headerName: 'Department',
    colId: 'departmentName',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'email',
    headerName: 'Email',
    colId: 'email',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'mobileNo',
    headerName: 'Mobile No',
    width: 230
  }
];
