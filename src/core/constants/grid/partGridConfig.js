import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const partGridConfig = [
    ...defaultFactoryFields,
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "group.team.plant.code",
        headerName: "Plant Code",
        cellClass: "vertical-middle ag-left-aligned-cell",
        colId: "group.team.plant.code",
        width: 85,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "group.team.plant.name",
        headerName: "Plant Name",
        cellClass: "vertical-middle ag-left-aligned-cell",
        colId: "group.team.plant.name",
        width: 90,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "group.team.code",
        headerName: "Team Code",
        cellClass: "vertical-middle ag-left-aligned-cell",
        colId: "group.team.code",
        width: 85,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "group.team.name",
        headerName: "Team Name",
        cellClass: "vertical-middle ag-left-aligned-cell",
        colId: "group.team.name",
        width: 115,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "group.code",
        headerName: "Group Code",
        cellClass: "vertical-middle ag-left-aligned-cell",
        colId: "group.code",
        width: 90,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "group.name",
        headerName: "Group Name",
        cellClass: "vertical-middle ag-left-aligned-cell",
        colId: "group.name",
        width: 105,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "code",
        headerName: "Part Code",
        cellClass: "vertical-middle ag-left-aligned-cell",
        colId: "code",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "name",
        headerName: "Part Name",
        cellClass: "vertical-middle ag-left-aligned-cell",
        colId: "name",
        width: 105,
        pinned: "left"
    },
    {
        ...defaultColDef,
        field: "rank",
        headerName: "Sort Order",
        cellClass: "vertical-middle ag-right-aligned-cell",
        colId: "rank",
        width: 80
    },
    ...defaultAuditFields
];