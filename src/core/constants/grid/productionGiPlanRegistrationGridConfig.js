import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const productionGiPlanRegistrationGridConfig = [
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
        field: "material.code",
        headerName: "Material Code",
        colId: "material.code",
        tooltipField: "material.code",
        width: 90,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "material.materialId",
        headerName: "Material ID",
        colId: "material.materialId",
        tooltipField: "material.materialId",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        field: "material.materialDescription",
        headerName: "Material Desc.",
        colId: "material.materialDescription",
        tooltipField: "material.materialDescription",
        width: 150
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
        headerName: "Plan Qty",
        colId: "planQty",
        tooltipField: "planQty",
        width: 70
    },
    {
        ...defaultColDef,
        field: "line.name",
        headerName: "Line",
        colId: "line.name",
        tooltipField: "line.name",
        width: 90
    },
    {
        ...defaultColDef,
        field: "displayOnly.process.name",
        headerName: "Process Type",
        colId: "displayOnly.process.name",
        tooltipField: "displayOnly.process.name",
        width: 100
    },
    {
        ...defaultColDef,
        field: "giType.name",
        headerName: "G/I Type",
        colId: "giType.name",
        tooltipField: "giType.name",
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