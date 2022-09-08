import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

// default name title of collumns


export const cycleTimeGridConfig = [
    ...defaultFactoryFields,
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "materialMaster.code",
        headerName: "Material Code",
        colId: "materialMaster.code",
        width: 120,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "materialMaster.name",
        headerName: "Material Name",
        colId: "materialMaster.name",
        width: 120,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "materialMaster.materialId",
        headerName: "Material ID",
        colId: "materialMaster.materialId",
        width: 120,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "process.line.code",
        headerName: "Line Code",
        colId: "process.line.code",
        width: 130,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "process.line.name",
        headerName: "Line Name",
        colId: "process.line.name",
        width: 100,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "process.code",
        headerName: "Process Code",
        colId: "process.code",
        width: 100,
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "process.name.name",
        headerName: "Process Name",
        colId: "process.name.name",
        width: 100
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "cycleTimeNum",
        headerName: "Cycle Time",
        colId: "cycleTimeNum",
        width: 100
    },
    {
        ...defaultColDef,
        field: "applyStartDate",
        headerName: "Apply Start Date",
        colId: "applyStartDate",
        cellClass: "vertical-middle",
        width: 130
    },
    {
        ...defaultColDef,
        field: "applyEndDate",
        headerName: "Apply End Date",
        cellClass: "vertical-middle",
        colId: "applyEndDate",
        width: 130
    },
    ...defaultAuditFields
];