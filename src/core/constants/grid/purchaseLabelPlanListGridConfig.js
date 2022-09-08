import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const purchaseLabelPlanListGridConfig = [
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
    field: "purchaseGRPlan.pk.factoryName",
    tooltipField: "purchaseGRPlan.pk.factoryName",
    headerName: "Factory",
    colId: "purchaseGRPlan.pk.factoryName",
    width: 120,
    pinned: "left",
    hide: true
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "purchaseGRPlan.planDate",
    headerName: "Plan Date",
    colId: "purchaseGRPlan.planDate",
    tooltipField: "purchaseGRPlan.planDate",
    width: 80,
    pinned: "left"
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "purchaseGRPlan.planId",
    headerName: "Plan ID",
    colId: "purchaseGRPlan.planId",
    tooltipField: "purchaseGRPlan.planId",
    width: 80,
    pinned: "left"
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "purchaseGRPlan.orderNo",
    headerName: "Pur. Order No.",
    colId: "purchaseGRPlan.orderNo",
    tooltipField: "purchaseGRPlan.orderNo",
    width: 80,
    pinned: "left"
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "purchaseGRPlan.grNo",
    headerName: "G/R No.",
    colId: "purchaseGRPlan.grNo",
    tooltipField: "purchaseGRPlan.grNo",
    width: 80,
    pinned: "left"
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "purchaseGRPlan.material.materialId",
    headerName: "Material ID",
    colId: "purchaseGRPlan.material.materialId",
    tooltipField: "purchaseGRPlan.material.materialId",
    width: 80,
    pinned: "left"
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "purchaseGRPlan.material.code",
    headerName: "Material Code",
    colId: "purchaseGRPlan.material.code",
    tooltipField: "purchaseGRPlan.material.code",
    width: 80,
    pinned: "left"
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "purchaseGRPlan.material.name",
    headerName: "Material Name",
    colId: "purchaseGRPlan.material.name",
    tooltipField: "purchaseGRPlan.material.name",
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "purchaseGRPlan.material.description",
    headerName: "Material Desc.",
    colId: "purchaseGRPlan.material.description",
    tooltipField: "purchaseGRPlan.material.description",
    width: 120
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "purchaseGRPlan.material.mrp.name",
    headerName: "MRP Controller",
    colId: "purchaseGRPlan.material.mrp.name",
    tooltipField: "purchaseGRPlan.material.mrp.name",
    width: 120
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "purchaseGRPlan.supplier.nationalName",
    headerName: "Supplier",
    colId: "purchaseGRPlan.supplier.nationalName",
    tooltipField: "purchaseGRPlan.supplier.nationalName",
    width: 80
  },
  {
    ...defaultColDef,
    field: "purchaseGRPlan.planQty",
    headerName: "Plan Qty",
    colId: "purchaseGRPlan.planQty",
    tooltipField: "purchaseGRPlan.planQty",
    cellClass: "vertical-middle ag-right-aligned-cell",
    width: 80
  },
  {
    ...defaultColDef,
    field: "printStatus",
    headerName: "Print Status",
    colId: "printStatus",
    tooltipField: "printStatus",
    width: 70
  },
  {
    ...defaultColDef,
    field: "generateQty",
    headerName: "Generated Qty",
    colId: "generateQty",
    tooltipField: "generateQty",
    cellClass: "vertical-middle ag-right-aligned-cell",
    width: 80
  },
  {
    ...defaultColDef,
    field: "balQty",
    headerName: "Bal. Qty",
    colId: "balQty",
    tooltipField: "balQty",
    cellClass: "vertical-middle ag-right-aligned-cell",
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "purchaseGRPlan.material.mainUnit.name",
    headerName: "Unit",
    colId: "purchaseGRPlan.material..mainUnit.name",
    tooltipField: "purchaseGRPlan.material..mainUnit.name",
    width: 120
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "purchaseGRPlan.grType.name",
    headerName: "G/R Type",
    colId: "purchaseGRPlan.grType.name",
    tooltipField: "purchaseGRPlan.grType.name",
    width: 120
  },
  {
    ...defaultColDef,
    field: "purchaseGRPlan.remark",
    headerName: "Remark",
    colId: "purchaseGRPlan.remark",
    tooltipField: "purchaseGRPlan.remark",
    width: 80
  },
  {
    ...defaultColDef,
    field: "lotNo",
    headerName: "Lot No.",
    colId: "lotNo",
    tooltipField: "lotNo",
    width: 80
  },
  {
    ...defaultColDef,
    field: "generateTime",
    headerName: "Generation Time",
    colId: "generateTime",
    tooltipField: "generateTime",
    width: 120
  },
  ...defaultAuditFields
];
