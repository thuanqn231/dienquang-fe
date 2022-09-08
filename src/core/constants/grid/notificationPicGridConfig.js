import { defaultFactoryFields } from './defaultFactoryFields';

import { defaultColDef } from './defaultColDef';

export const notificationPicGridConfig = [
  ...defaultFactoryFields,

  {
    ...defaultColDef,
    field: 'user.fullName',
    headerName: 'Full Name',
    colId: 'user.fullName',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'user.userName',
    headerName: 'Employee ID',
    colId: 'user.userName',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'user.code',
    headerName: 'Employee No',
    colId: 'user.code',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'user.department.name',
    headerName: 'Department',
    colId: 'user.department.name',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'user.email',
    headerName: 'Email',
    colId: 'user.email',
    width: 230
  },
  {
    ...defaultColDef,
    field: 'user.phoneNumber',
    headerName: 'Mobile No',
    colId: 'user.phoneNumber',
    width: 230
  }
];
