import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const lineGridConfig = [
    ...defaultFactoryFields,
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "part.code",
        headerName: "Part Code",
        cellClass: "vertical-middle ag-left-aligned-cell",
        colId: "part.code",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "part.name",
        headerName: "Part Name",
        cellClass: "vertical-middle ag-left-aligned-cell",
        colId: "part.name",
        width: 110,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "code",
        headerName: "Line Code",
        cellClass: "vertical-middle ag-left-aligned-cell",
        colId: "code",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "name",
        headerName: "Line Name",
        cellClass: "vertical-middle ag-left-aligned-cell",
        colId: "name",
        width: 100,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "processType.code",
        headerName: "Process Type",
        colId: "processType.code",
        width: 95,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "processType.description",
        headerName: "Process Type Name",
        colId: "processType.description",
        width: 135,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "productGroup.name",
        headerName: "Prod. Group",
        colId: "productGroup.name",
        width: 110,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "stock.name",
        headerName: "WIP Storage",
        colId: "stock.name",
        width: 110,
        pinned: "left"
    },
    {
        ...defaultColDef,
        field: "description",
        headerName: "Line Info",
        cellClass: "vertical-middle ag-left-aligned-cell",
        colId: "description",
        width: 120
    },
    {
        ...defaultColDef,
        field: "rank",
        headerName: "Sort Order",
        cellClass: "vertical-middle ag-right-aligned-cell",
        colId: "rank",
        width: 85
    },
    ...defaultAuditFields
];