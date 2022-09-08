import { defaultColDef } from './defaultColDef';

export const maintenancePicGridConfig = [
  {
    ...defaultColDef,
    filter: false,
    suppressColumnsToolPanel: true,
    suppressMovable: true,
    sortable: false,
    checkboxSelection: true,
    maxWidth: 21,
    colId: "0",
    pinned: "left"
},

  {
    ...defaultColDef,
    field: 'departmentName',
    headerName: 'Department',
    colId: 'departmentName',
    width: 350
  },
  {
    ...defaultColDef,
    field: 'employeeId',
    headerName: 'User ID',
    colId: 'employeeId',
    width: 350
  },
  {
    ...defaultColDef,
    field: 'fullName',
    headerName: 'User Name',
    colId: 'fullName',
    width: 350
  },

  {
    ...defaultColDef,
    field: 'email',
    headerName: 'Email',
    colId: 'email',
    width: 350
  }
];
