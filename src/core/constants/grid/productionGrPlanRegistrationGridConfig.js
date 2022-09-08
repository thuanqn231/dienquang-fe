import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const productionGrPlanRegistrationGridConfig = [
    {
        ...defaultColDef,
        filter: false,
        suppressColumnsToolPanel: true,
        suppressMovable: true,
        sortable: false,
        checkboxSelection: true,
        maxWidth: 21,
        colId: "0",
        pinned: "left"
    },
    {
        ...defaultColDef,
        filter: false,
        suppressMovable: true,
        sortable: false,
        field: "row_index",
        headerName: "No.",
        valueGetter: "node.rowIndex + 1",
        minWidth: 45,
        colId: "row_index",
        width: 45,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "pk.factoryName",
        headerName: "Factory",
        colId: "pk.factoryName",
        tooltipField: "pk.factoryName",
        width: 100,
        pinned: "left",
        hide: true
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "planDate",
        headerName: "Plan Date",
        colId: "planDate",
        tooltipField: "planDate",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "displayOnly.materialCode",
        headerName: "Material Code",
        colId: "displayOnly.materialCode",
        tooltipField: "displayOnly.materialCode",
        width: 90,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "displayOnly.materialId",
        headerName: "Material ID",
        colId: "displayOnly.materialId",
        tooltipField: "displayOnly.materialId",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        field: "displayOnly.materialDescription",
        headerName: "Material Desc.",
        colId: "displayOnly.materialDescription",
        tooltipField: "displayOnly.materialDescription",
        width: 150
    },
    {
        ...defaultColDef,
        field: "displayOnly.materialVersion",
        headerName: "Material Version",
        colId: "displayOnly.materialVersion",
        tooltipField: "displayOnly.materialVersion",
        width: 70
    },
    {
        ...defaultColDef,
        field: "plan.prodOrderNo",
        headerName: "Prod. Order No",
        colId: "plan.prodOrderNo",
        tooltipField: "plan.prodOrderNo",
        width: 80
    },
    {
        ...defaultColDef,
        field: "planQty",
        headerName: "G/R Plan Qty",
        colId: "planQty",
        tooltipField: "planQty",
        width: 70
    },
    {
        ...defaultColDef,
        field: "displayOnly.line",
        headerName: "Line",
        colId: "displayOnly.line",
        tooltipField: "displayOnly.line",
        width: 90
    },
    {
        ...defaultColDef,
        field: "displayOnly.process",
        headerName: "Process Type",
        colId: "displayOnly.process",
        tooltipField: "displayOnly.process",
        width: 100
    },
    {
        ...defaultColDef,
        field: "grType.name",
        headerName: "G/R Type",
        colId: "grType.name",
        tooltipField: "grType.name",
        width: 90
    },
    {
        ...defaultColDef,
        field: "remark",
        headerName: "Remark",
        colId: "remark",
        tooltipField: "remark",
        width: 160
    }
];