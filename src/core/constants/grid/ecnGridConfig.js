import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const ecnGridConfig = [
    ...defaultFactoryFields,
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "ecNo",
        tooltipField: "ecNo",
        headerName: "EC No",
        colId: "ecNo",
        width: 60,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "ecType",
        tooltipField: "ecType",
        headerName: "EC Type",
        colId: "ecType",
        width: 70,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "bomStatus",
        tooltipField: "bomStatus",
        headerName: "Status",
        colId: "bomStatus",
        width: 60,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "reflect",
        tooltipField: "reflect",
        headerName: "Reflect (Y/N)",
        colId: "reflect",
        width: 60,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "action",
        tooltipField: "action",
        headerName: "Action",
        colId: "action",
        width: 60,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "parentCode.code",
        tooltipField: "parentCode.code",
        headerName: "Parent Code",
        colId: "parentCode.code",
        width: 90,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "ecVersionParent",
        tooltipField: "ecVersionParent",
        headerName: "Parent Version",
        colId: "ecVersionParent",
        width: 70,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "childCode.code",
        tooltipField: "childCode.code",
        headerName: "Child Code",
        colId: "childCode.code",
        width: 85,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "childCode.name",
        tooltipField: "childCode.name",
        headerName: "Child Name",
        colId: "childCode.name",
        width: 85,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "ecVersion",
        tooltipField: "ecVersion",
        headerName: "Child Version",
        colId: "ecVersion",
        width: 70,
        pinned: "left"
    },
    {
        ...defaultColDef,
        field: "standQty",
        tooltipField: "standQty",
        headerName: "Stand Qty",
        colId: "standQty",
        width: 80
    },
    {
        ...defaultColDef,
        field: "loss",
        tooltipField: "loss",
        headerName: "Loss (%)",
        colId: "loss",
        width: 70
    },
    {
        ...defaultColDef,
        field: "testQty",
        tooltipField: "testQty",
        headerName: "Test Qty",
        colId: "testQty",
        width: 70
    },
    {
        ...defaultColDef,
        field: "childCode.mainUnit.name",
        tooltipField: "childCode.mainUnit.name",
        headerName: "Unit",
        colId: "unit",
        width: 50
    },
    {
        ...defaultColDef,
        field: "validFrom",
        tooltipField: "validFrom",
        headerName: "Valid From",
        colId: "validFrom",
        width: 120
    },
    {
        ...defaultColDef,
        field: "validTo",
        tooltipField: "validTo",
        headerName: "Valid To",
        colId: "validTo",
        width: 120
    },
    {
        ...defaultColDef,
        field: "devStatus.name",
        tooltipField: "devStatus.name",
        headerName: "Dev Status",
        colId: "devStatus.name",
        width: 85
    },
    {
        ...defaultColDef,
        field: "revisionDrawing",
        tooltipField: "revisionDrawing",
        headerName: "Revision Drawing",
        colId: "revisionDrawing",
        width: 120
    },
    {
        ...defaultColDef,
        field: "supplier",
        tooltipField: "supplier",
        headerName: "Supplier",
        colId: "supplier",
        width: 150
    },
    {
        ...defaultColDef,
        field: "remark",
        tooltipField: "remark",
        headerName: "Remark",
        colId: "remark",
        width: 150
    },
    ...defaultAuditFields
];