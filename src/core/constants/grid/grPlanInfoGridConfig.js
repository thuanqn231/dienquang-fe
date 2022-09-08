import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const grPlanInfoGridConfig = [
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
        field: "factoryName",
        tooltipField: "factoryName",
        headerName: "Factory",
        colId: "factoryName",
        width: 100,
        pinned: "left",
        hide: true
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "type",
        headerName: "Type",
        colId: "type",
        tooltipField: "type",
        width: 80,
        pinned: "left"
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
        field: "orderNo",
        headerName: "Pur./PO No.",
        colId: "orderNo",
        tooltipField: "orderNo",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "materialId",
        headerName: "Material ID",
        colId: "materialId",
        tooltipField: "materialId",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "materialCode",
        headerName: "Material Code",
        colId: "materialCode",
        tooltipField: "materialCode",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "materialName",
        headerName: "Material Name",
        colId: "materialName",
        tooltipField: "materialName",
        width: 80
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "materialDescription",
        headerName: "Material Desc.",
        colId: "materialDescription",
        tooltipField: "materialDescription",
        width: 120
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "materialVersion",
        headerName: "Material Version",
        colId: "materialVersion",
        tooltipField: "materialVersion",
        width: 80
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "mrpName",
        headerName: "MRP Controller",
        colId: "mrpName",
        tooltipField: "mrpName",
        width: 120
    },
    {
        ...defaultColDef,
        field: "planQty",
        headerName: "Plan Qty",
        colId: "planQty",
        tooltipField: "planQty",
        cellClass: "vertical-middle ag-right-aligned-cell",
        width: 80
    },
    {
        ...defaultColDef,
        field: "actualQty",
        headerName: "G/R Qty",
        colId: "actualQty",
        tooltipField: "actualQty",
        cellClass: "vertical-middle ag-right-aligned-cell",
        width: 80
    },
    {
        ...defaultColDef,
        field: "balQty",
        headerName: "Bal Qty",
        colId: "balQty",
        tooltipField: "balQty",
        cellClass: "vertical-middle ag-right-aligned-cell",
        width: 80
    },
    {
        ...defaultColDef,
        field: "unit",
        headerName: "Unit",
        colId: "unit",
        tooltipField: "unit",
        width: 100
    },
    {
        ...defaultColDef,
        field: "grType",
        headerName: "G/R Type",
        colId: "grType",
        tooltipField: "grType",
        width: 120
    },
    {
        ...defaultColDef,
        field: "supplier",
        headerName: "Supplier",
        colId: "supplier",
        tooltipField: "supplier",
        width: 120
    },
    {
        ...defaultColDef,
        field: "processType",
        headerName: "Process Type",
        colId: "processType",
        tooltipField: "processType",
        width: 100
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "lineCode",
        headerName: "Line Code",
        colId: "lineCode",
        tooltipField: "lineCode",
        width: 80
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "lineName",
        headerName: "Line Name",
        colId: "lineName",
        tooltipField: "lineName",
        width: 120
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "qcResult",
        headerName: "QC Result",
        colId: "qcResult",
        tooltipField: "qcResult",
        width: 120
    },
    {
        ...defaultColDef,
        field: "actionInspection",
        headerName: "QC Action",
        colId: "actionInspection",
        tooltipField: "actionInspection",
        width: 80
    },
    {
        ...defaultColDef,
        field: "approvalStatusInspection",
        headerName: "Approval Status",
        colId: "approvalStatusInspection",
        tooltipField: "approvalStatusInspection",
        width: 120
    },
    {
        ...defaultColDef,
        field: "approvalTimeInspection",
        headerName: "Approval Time",
        colId: "approvalTimeInspection",
        tooltipField: "approvalTimeInspection",
        width: 120
    },
    {
        ...defaultColDef,
        field: "approvalPICInspection",
        headerName: "Approval PIC",
        colId: "approvalPICInspection",
        tooltipField: "approvalPICInspection",
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
    ...defaultAuditFields
];