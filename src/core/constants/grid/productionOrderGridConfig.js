import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const productionOrderGridConfig = [

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
        field: "line.code",
        headerName: "Line Code",
        colId: "line.code",
        tooltipField: "line.code",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "line.name",
        headerName: "Line Name",
        colId: "line.name",
        tooltipField: "line.name",
        width: 120,
        pinned: "left"
    },
    {
        ...defaultColDef,
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
        field: "prodOrderNo",
        headerName: "PO No.",
        colId: "prodOrderNo",
        tooltipField: "prodOrderNo",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "modelId.parentCode.materialId",
        headerName: "Model ID",
        colId: "modelId.parentCode.materialId",
        tooltipField: "modelId.parentCode.materialId",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "modelId.parentCode.code",
        headerName: "Model Code",
        colId: "modelId.parentCode.code",
        tooltipField: "modelId.parentCode.code",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "modelId.parentCode.name",
        headerName: "Model Name",
        colId: "modelId.parentCode.name",
        tooltipField: "modelId.parentCode.name",
        width: 80
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "modelId.parentCode.description",
        headerName: "Model Desc.",
        colId: "modelId.parentCode.description",
        tooltipField: "modelId.parentCode.description",
        width: 120
    },
    {
        ...defaultColDef,
        field: "modelId.bomVersionParent",
        headerName: "Model Version",
        colId: "modelId.bomVersionParent",
        tooltipField: "modelId.bomVersionParent",
        width: 70
    },
    {
        ...defaultColDef,
        field: "aprStatus.name",
        headerName: "Approval Status",
        colId: "aprStatus.name",
        tooltipField: "aprStatus.name",
        width: 80
    },
    {
        ...defaultColDef,
        field: "prodStatus.name",
        headerName: "Production Status",
        colId: "prodStatus.name",
        tooltipField: "prodStatus.name",
        width: 100
    },
    {
        ...defaultColDef,
        field: "poType.name",
        headerName: "PO Type",
        colId: "poType.name",
        tooltipField: "poType.name",
        width: 80
    },
    {
        ...defaultColDef,
        field: "startTime",
        headerName: "Plan Start Time",
        colId: "startTime",
        tooltipField: "startTime",
        width: 120
    },
    {
        ...defaultColDef,
        field: "endTime",
        headerName: "Plan End Time",
        colId: "endTime",
        tooltipField: "endTime",
        width: 120
    },
    {
        ...defaultColDef,
        field: "actualStartTime",
        headerName: "Actual Start Time",
        colId: "actualStartTime",
        tooltipField: "actualStartTime",
        width: 120
    },
    {
        ...defaultColDef,
        field: "actualEndTime",
        headerName: "Actual End Time",
        colId: "actualEndTime",
        tooltipField: "actualEndTime",
        width: 120
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
        field: "defectQty",
        headerName: "Defect Qty",
        colId: "defectQty",
        tooltipField: "defectQty",
        cellClass: "vertical-middle ag-right-aligned-cell",
        width: 60
    },
    {
        ...defaultColDef,
        field: "tactTime",
        headerName: "Tact Time",
        colId: "tactTime",
        tooltipField: "tactTime",
        cellClass: "vertical-middle ag-right-aligned-cell",
        width: 60
    },
    {
        ...defaultColDef,
        field: "plant.name",
        headerName: "Plant",
        colId: "plant.name",
        tooltipField: "plant.name",
        width: 80
    },
    {
        ...defaultColDef,
        field: "operation",
        headerName: "Operation",
        colId: "operation",
        tooltipField: "Operation",
        width: 80
    },
    {
        ...defaultColDef,
        field: "process.name",
        headerName: "Process Type",
        colId: "process.name",
        tooltipField: "process.name",
        width: 80
    },
    {
        ...defaultColDef,
        field: "topPO",
        headerName: "Top PO",
        colId: "topPO",
        tooltipField: "topPO",
        width: 80
    },
    {
        ...defaultColDef,
        field: "topModel.parentCode.code",
        headerName: "Top Model Code",
        colId: "topModelCode.parentCode.code",
        tooltipField: "topModelCode.parentCode.code",
        width: 80
    },
    {
        ...defaultColDef,
        field: "topModel.parentCode.name",
        headerName: "Top Model Name",
        colId: "topModelCode.parentCode.name",
        tooltipField: "topModelCode.parentCode.name",
        width: 80
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