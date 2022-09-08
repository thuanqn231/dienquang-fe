import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const purchaseGrPlanGridConfig = [
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
        field: "purOrderNo",
        headerName: "Pur. Order No.",
        colId: "purOrderNo",
        tooltipField: "purOrderNo",
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
        width: 100,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "material.code",
        headerName: "Material Code",
        colId: "material.code",
        tooltipField: "material.code",
        width: 70,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "material.materialId",
        headerName: "Material ID",
        colId: "material.materialId",
        tooltipField: "material.materialId",
        width: 70,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "material.name",
        headerName: "Material Name",
        colId: "material.name",
        tooltipField: "material.name",
        width: 70
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "material.description",
        headerName: "Material Desc.",
        colId: "material.description",
        tooltipField: "material.description",
        width: 150
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "material.mrp.name",
        headerName: "MRP Controller",
        colId: "material.mrp.name",
        tooltipField: "material.mrp.name",
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
        field: "grStatus.name",
        headerName: "G/R Status",
        colId: "grStatus.name",
        tooltipField: "grStatus.name",
        width: 80
    },
    {
        ...defaultColDef,
        field: "material.mainUnit.name",
        headerName: "Unit",
        colId: "material.mainUnit.name",
        tooltipField: "material.mainUnit.name",
        width: 80
    },
    {
        ...defaultColDef,
        field: "supplier.englishName",
        headerName: "Supplier",
        colId: "supplier.englishName",
        tooltipField: "supplier.englishName",
        width: 120
    },
    {
        ...defaultColDef,
        field: "grType.name",
        headerName: "G/R Type",
        colId: "grType.name",
        tooltipField: "grType.name",
        width: 80
    },
    {
        ...defaultColDef,
        field: "remark",
        headerName: "Remark",
        colId: "remark",
        tooltipField: "remark",
        width: 160
    },
    {
        ...defaultColDef,
        field: "teco.name",
        headerName: "TECO Reason",
        colId: "teco.name",
        tooltipField: "teco.name",
        width: 120
    },
    {
        ...defaultColDef,
        field: "tecoRemark",
        headerName: "TECO Remark",
        colId: "tecoRemark",
        tooltipField: "tecoRemark",
        width: 180
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: 'inspectionGRPlanResult.action.name',
        headerName: 'QC Action',
        colId: 'inspectionGRPlanResult.action.name',
        tooltipField: 'inspectionGRPlanResult.action.description',
    
        width: 80
      },
      {
        ...defaultColDef,
        suppressMovable: true,
        field: 'inspectionGRPlanResult.approvalStatus.name',
        headerName: 'Approval Status',
        colId: 'inspectionGRPlanResult.approvalStatus.name',
        tooltipField: 'inspectionGRPlanResult.approvalStatus.name',
        width: 80
      },
      {
        ...defaultColDef,
        suppressMovable: true,
        field: 'inspectionGRPlanResult.approval.approvedTime',
        headerName: 'Approval Time',
        colId: 'inspectionGRPlanResult.approval.approvedTime',
        tooltipField: 'inspectionGRPlanResult.approval.approvedTime',
        width: 80
      },
      {
        ...defaultColDef,
        suppressMovable: true,
        field: 'inspectionGRPlanResult.approval.usrLogU',
        headerName: 'Approval PIC',
        colId: 'inspectionGRPlanResult.approval.usrLogU',
        tooltipField: 'inspectionGRPlanResult.approval.usrLogU',
        width: 80
      },
    
    ...defaultAuditFields
];