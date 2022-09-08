import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const userAuthorizationGridConfig = [
    ...defaultFactoryFields,
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "code",
        headerName: "Employee ID",
        colId: "code",
        width: 150,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "userName",
        headerName: "User ID",
        colId: "userName",
        width: 150,
        pinned: "left"
    },
    {
        ...defaultColDef,
        field: "department.name",
        headerName: "Department",
        colId: "department.name",
        width: 150
    },
    {
        ...defaultColDef,
        field: "fullName",
        headerName: "Employee Name",
        colId: "fullName",
        width: 150
    },
    {
        ...defaultColDef,
        field: "profile.name",
        headerName: "Role",
        colId: "profile.name",
        width: 200
    },
    ...defaultAuditFields
];