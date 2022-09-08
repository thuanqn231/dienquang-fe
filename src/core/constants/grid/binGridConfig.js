import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const binGridConfig = [
    ...defaultFactoryFields,
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "code",
        headerName: "Bin Code",
        colId: "code",
        width: 150,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "zone.name",
        headerName: "Zone Code",
        colId: "zone.name",
        width: 160,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "zone.name",
        headerName: "Zone Name",
        colId: "zone.name",
        width: 160,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "zone.stock.name",
        headerName: "Storage Name",
        colId: "zone.stock.name",
        width: 210,
        pinned: "left"
    },
    {
        ...defaultColDef,
        field: "caPaLimit",
        headerName: "Capa Limit",
        colId: "caPaLimit",
        width: 130
    },
    ...defaultAuditFields
];