import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const purchaseGrPlanRegistrationGridConfig = [
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
        width: 80,
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
        width: 100,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "material.materialId",
        headerName: "Material ID",
        colId: "material.materialId",
        tooltipField: "material.materialId",
        width: 90,
        pinned: "left"
    },
    {
        ...defaultColDef,
        field: "material.materialDescription",
        headerName: "Material Desc.",
        colId: "material.materialDescription",
        tooltipField: "material.materialDescription",
        width: 160
    },
    {
        ...defaultColDef,
        field: "purOrderNo",
        headerName: "Pur. No",
        colId: "purOrderNo",
        tooltipField: "purOrderNo",
        width: 100
    },
    {
        ...defaultColDef,
        field: "grType.name",
        headerName: "G/R Type",
        colId: "grType.name",
        tooltipField: "grType.name",
        width: 110
    },
    {
        ...defaultColDef,
        field: "planQty",
        headerName: "G/R Plan Qty",
        colId: "planQty",
        tooltipField: "planQty",
        width: 100
    },
    {
        ...defaultColDef,
        field: "supplier.name",
        headerName: "Supplier",
        colId: "supplier.name",
        tooltipField: "supplier.name",
        width: 160
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