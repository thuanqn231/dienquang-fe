import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const zoneGridConfig = [
    ...defaultFactoryFields,
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "code",
        headerName: "Zone Code",
        colId: "code",
        width: 200,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "name",
        headerName: "Zone Name",
        colId: "name",
        width: 200,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "stock.name",
        headerName: "Storage Name",
        colId: "stock.name",
        width: 200,
        pinned: "left"
    },
    {
        ...defaultColDef,
        field: "caPaLimit",
        headerName: "Capa Limit",
        colId: "caPaLimit",
        width: 200
    },
    ...defaultAuditFields
];