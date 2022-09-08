import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const productionGrPlanGridConfig = [
    {
        ...defaultColDef,
        filter: false,
        suppressColumnsToolPanel: true,
        suppressMovable: true,
        sortable: false,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
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
        tooltipField: "pk.factoryName",
        headerName: "Factory",
        colId: "pk.factoryName",
        width: 140,
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
        field: "planId",
        headerName: "Plan ID",
        colId: "planId",
        tooltipField: "planId",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "grNo",
        headerName: "G/R No.",
        colId: "grNo",
        tooltipField: "grNo",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "productionOrder.prodOrderNo",
        headerName: "Prod Order No.",
        colId: "productionOrder.prodOrderNo",
        tooltipField: "productionOrder.prodOrderNo",
        width: 80,
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
        suppressMovable: true,
        field: "material.code",
        headerName: "Material Code",
        colId: "material.code",
        tooltipField: "material.code",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "material.name",
        headerName: "Material Name",
        colId: "material.name",
        tooltipField: "material.name",
        width: 80
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "material.description",
        headerName: "Material Desc.",
        colId: "material.description",
        tooltipField: "material.description",
        width: 120
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "productionOrder.modelId.bomVersionParent",
        headerName: "Material Version",
        colId: "productionOrder.modelId.bomVersionParent",
        tooltipField: "productionOrder.modelId.bomVersionParent",
        width: 80
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "productionOrder.line.code",
        headerName: "Line Code",
        colId: "productionOrder.line.code",
        tooltipField: "productionOrder.line.code",
        width: 60
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "productionOrder.line.name",
        headerName: "Line Name",
        colId: "productionOrder.line.name",
        tooltipField: "productionOrder.line.name",
        width: 120
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "approvalStatus.name",
        headerName: "Appr. Status",
        colId: "approvalStatus.name",
        tooltipField: "approvalStatus.name",
        width: 80
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "approval.approvedTime",
        headerName: "Appr. Time",
        colId: "approval.approvedTime",
        tooltipField: "approval.approvedTime",
        width: 120
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "material.mrp.name",
        headerName: "MRP Controller",
        colId: "material.mrp.name",
        tooltipField: "material.mrp.name",
        width: 100
    },
    {
        ...defaultColDef,
        field: "planQty",
        headerName: "Plan Qty",
        colId: "planQty",
        tooltipField: "planQty",
        cellClass: "vertical-middle ag-right-aligned-cell",
        width: 60
    },
    {
        ...defaultColDef,
        field: "actualQty",
        headerName: "Actual Qty",
        colId: "actualQty",
        tooltipField: "actualQty",
        cellClass: "vertical-middle ag-right-aligned-cell",
        width: 60
    },
    {
        ...defaultColDef,
        field: "balQty",
        headerName: "Bal Qty",
        colId: "balQty",
        tooltipField: "balQty",
        cellClass: "vertical-middle ag-right-aligned-cell",
        width: 60
    },
    {
        ...defaultColDef,
        field: "productionOrder.planQty",
        headerName: "Prod. Plan Qty",
        colId: "productionOrder.planQty",
        tooltipField: "productionOrder.planQty",
        cellClass: "vertical-middle ag-right-aligned-cell",
        width: 70
    },
    {
        ...defaultColDef,
        field: "productionOrder.actualQty",
        headerName: "Prod. Result Qty",
        colId: "productionOrder.actualQty",
        tooltipField: "productionOrder.actualQty",
        cellClass: "vertical-middle ag-right-aligned-cell",
        width: 80
    },
    {
        ...defaultColDef,
        field: "material.mainUnit.name",
        headerName: "Unit",
        colId: "material.mainUnit.name",
        tooltipField: "material.mainUnit.name",
        width: 100
    },
    {
        ...defaultColDef,
        field: "productionOrder.process.name",
        headerName: "Process Type",
        colId: "productionOrder.process.name",
        tooltipField: "productionOrder.process.name",
        width: 100
    },
    {
        ...defaultColDef,
        field: "grStatus.name",
        headerName: "G/R Status",
        colId: "grStatus.name",
        tooltipField: "grStatus.name",
        width: 80
    },
    {
        ...defaultColDef,
        field: "grType.name",
        headerName: "G/R Type",
        colId: "grType.name",
        tooltipField: "grType.name",
        width: 120
    },
    {
        ...defaultColDef,
        field: "remark",
        headerName: "Remark",
        colId: "remark",
        tooltipField: "remark",
        width: 120
    },
    {
        ...defaultColDef,
        field: "teco.name",
        headerName: "TECO Reason",
        colId: "teco.name",
        tooltipField: "teco.name",
        width: 80
    },
    {
        ...defaultColDef,
        field: "tecoRemark",
        headerName: "TECO Remark",
        colId: "tecoRemark",
        tooltipField: "tecoRemark",
        width: 120
    },
    ...defaultAuditFields
];