import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const bomGridConfig = [
    ...defaultFactoryFields,
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "topCode.code",
        tooltipField: "topCode.code",
        headerName: "Top Model",
        width: 85,
        colId: "topCode.code",
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "level",
        tooltipField: "level",
        headerName: "Level",
        width: 50,
        colId: "level",
        pinned: "left",
        cellClass: "vertical-middle ag-left-aligned-cell",
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "topVersion",
        tooltipField: "topVersion",
        headerName: "Top Version",
        width: 70,
        colId: "topVersion",
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "bomStatus",
        tooltipField: "bomStatus",
        headerName: "Status",
        width: 60,
        colId: "bomStatus",
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "parentCode.code",
        tooltipField: "parentCode.code",
        headerName: "Parent Code",
        width: 90,
        colId: "parentCode.code",
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "bomVersionParent",
        tooltipField: "bomVersionParent",
        headerName: "Parent Version",
        width: 70,
        colId: "bomVersionParent",
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "childCode.code",
        tooltipField: "childCode.code",
        headerName: "Child Code",
        width: 85,
        colId: "childCode.code",
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "childCode.name",
        tooltipField: "childCode.name",
        headerName: "Child Name",
        width: 85,
        colId: "childCode.name",
        pinned: "left"
    },
    {
        ...defaultColDef,
        field: "bomVersion",
        tooltipField: "bomVersion",
        headerName: "Child Version",
        width: 70,
        colId: "bomVersion",
    },
    {
        ...defaultColDef,
        field: "childCode.description",
        tooltipField: "childCode.description",
        headerName: "Mat. Description",
        width: 150,
        colId: "childCode.description"
    },
    {
        ...defaultColDef,
        field: "childCode.spec",
        tooltipField: "childCode.spec",
        headerName: "Material Spec",
        width: 150,
        colId: "childCode.spec"
    },
    {
        ...defaultColDef,
        field: "childCode.materialType.name",
        tooltipField: "childCode.materialType.name",
        headerName: "Material Type",
        width: 100,
        colId: "childCode.materialType.name"
    },
    {
        ...defaultColDef,
        field: "standQty",
        tooltipField: "standQty",
        headerName: "Stand Qty",
        width: 80,
        colId: "standQty"
    },
    {
        ...defaultColDef,
        field: "loss",
        tooltipField: "loss",
        headerName: "Loss",
        width: 50,
        colId: "loss"
    },
    {
        ...defaultColDef,
        field: "testQty",
        tooltipField: "testQty",
        headerName: "Test Qty",
        width: 70,
        colId: "testQty"
    },
    {
        ...defaultColDef,
        field: "childCode.mainUnit.name",
        tooltipField: "childCode.mainUnit.name",
        headerName: "Unit",
        width: 50,
        colId: "childCode.mainUnit.name"
    },
    {
        ...defaultColDef,
        field: "validFrom",
        tooltipField: "validFrom",
        headerName: "Valid From",
        width: 120,
        colId: "validFrom"
    },
    {
        ...defaultColDef,
        field: "childCode.prodType.name",
        tooltipField: "childCode.prodType.name",
        headerName: "Proc. Type",
        width: 80,
        colId: "childCode.prodType.name"
    },
    {
        ...defaultColDef,
        field: "childCode.mrpType.name",
        tooltipField: "childCode.mrpType.name",
        headerName: "MRP Type",
        width: 80,
        colId: "childCode.mrpType.name"
    },
    {
        ...defaultColDef,
        field: "childCode.materialGroup.name",
        tooltipField: "childCode.materialGroup.name",
        headerName: "Material Group",
        width: 110,
        colId: "childCode.materialGroup.name"
    },
    {
        ...defaultColDef,
        field: "devStatus.name",
        tooltipField: "devStatus.name",
        headerName: "Dev Status",
        width: 85,
        colId: "devStatus.name"
    },
    {
        ...defaultColDef,
        field: "revisionDrawing",
        tooltipField: "revisionDrawing",
        headerName: "Revision Drawing",
        width: 120,
        colId: "revisionDrawing"
    },
    {
        ...defaultColDef,
        field: "supplier",
        tooltipField: "supplier",
        headerName: "Supplier",
        width: 150,
        colId: "supplier"
    },
    {
        ...defaultColDef,
        field: "remark",
        tooltipField: "remark",
        headerName: "Remark",
        width: 150,
        colId: "remark"
    },
    ...defaultAuditFields
];