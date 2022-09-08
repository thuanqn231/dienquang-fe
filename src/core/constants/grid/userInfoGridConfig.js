import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const userInfoGridConfig = [
    ...defaultFactoryFields,
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "userName",
        headerName: "User ID",
        colId: "userName",
        width: 110,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "code",
        headerName: "Employee ID",
        colId: "code",
        width: 100,
        pinned: "left"
    },
    {
        ...defaultColDef,
        field: "userState",
        headerName: "Status",
        colId: "userState",
        width: 100
    },
    {
        ...defaultColDef,
        field: "fullName",
        headerName: "Employee Name",
        cellClass: "vertical-middle ag-left-aligned-cell",
        colId: "fullName",
        width: 170
    },
    {
        ...defaultColDef,
        field: "department.name",
        headerName: "Department",
        colId: "department.name",
        width: 120
    },
    {
        ...defaultColDef,
        field: "email",
        headerName: "Email",
        colId: "email",
        width: 100
    },
    {
        ...defaultColDef,
        field: "phoneNumber",
        headerName: "Phone No.",
        colId: "phoneNumber",
        width: 120
    },
    ...defaultAuditFields
];