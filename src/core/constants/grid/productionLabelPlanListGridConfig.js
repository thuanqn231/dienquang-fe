import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const productionLabelPlanListGridConfig = [
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
    field: "productionOrder.pk.factoryName",
    tooltipField: "productionOrder.pk.factoryName",
    headerName: "Factory",
    colId: "productionOrder.pk.factoryName",
    width: 120,
    pinned: "left",
    hide: true
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "productionOrder.planDate",
    headerName: "Plan Date",
    colId: "productionOrder.planDate",
    tooltipField: "productionOrder.planDate",
    width: 80,
    pinned: "left"
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "productionOrder.planId",
    headerName: "Plan ID",
    colId: "productionOrder.planId",
    tooltipField: "productionOrder.planId",
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
    field: "productionOrder.topPO",
    headerName: "Top PO",
    colId: "productionOrder.topPO",
    tooltipField: "productionOrder.topPO",
    width: 80,
    pinned: "left"
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "productionOrder.modelId.parentCode.materialId",
    headerName: "Material ID",
    colId: "productionOrder.modelId.parentCode.materialId",
    tooltipField: "productionOrder.modelId.parentCode.materialId",
    width: 70,
    pinned: "left"
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "productionOrder.modelId.parentCode.code",
    headerName: "Material Code",
    colId: "productionOrder.modelId.parentCode.code",
    tooltipField: "productionOrder.modelId.parentCode.code",
    width: 80,
    pinned: "left"
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "productionOrder.modelId.parentCode.name",
    headerName: "Material Name",
    colId: "productionOrder.modelId.parentCode.name",
    tooltipField: "productionOrder.modelId.parentCode.name",
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "productionOrder.modelId.parentCode.description",
    headerName: "Material Desc.",
    colId: "productionOrder.modelId.parentCode.description",
    tooltipField: "productionOrder.modelId.parentCode.description",
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
    field: "productionOrder.topModel.parentCode.code",
    headerName: "Top Material Code",
    colId: "productionOrder.topModel.parentCode.code",
    tooltipField: "productionOrder.topModel.parentCode.code",
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "productionOrder.tactTime",
    headerName: "Cycle Time",
    colId: "productionOrder.tactTime",
    tooltipField: "productionOrder.tactTime",
    cellClass: "vertical-middle ag-right-aligned-cell",
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "productionOrder.startTime",
    headerName: "Plan Start Time",
    colId: "productionOrder.startTime",
    tooltipField: "productionOrder.startTime",
    width: 120
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "productionOrder.endTime",
    headerName: "Plan End Time",
    colId: "productionOrder.endTime",
    tooltipField: "productionOrder.endTime",
    width: 120
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "productionOrder.line.code",
    headerName: "Line Code",
    colId: "productionOrder.line.code",
    tooltipField: "productionOrder.line.code",
    width: 70
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "productionOrder.line.name",
    headerName: "Line Name",
    colId: "productionOrder.line.name",
    tooltipField: "productionOrder.line.name",
    width: 100
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: "productionOrder.modelId.parentCode.mrp.name",
    headerName: "MRP Controller",
    colId: "productionOrder.modelId.parentCode.mrp.name",
    tooltipField: "productionOrder.modelId.parentCode.mrp.name",
    width: 100
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
    field: "productionOrder.planQty",
    headerName: "Plan Qty",
    colId: "productionOrder.planQty",
    tooltipField: "productionOrder.planQty",
    cellClass: "vertical-middle ag-right-aligned-cell",
    width: 70
  },
  {
    ...defaultColDef,
    field: "productionOrder.process.name",
    headerName: "Process Type",
    colId: "productionOrder.process.name",
    tooltipField: "productionOrder.process.name",
    width: 80
  },
  {
    ...defaultColDef,
    field: "productionOrder.poType.name",
    headerName: "PO Type",
    colId: "productionOrder.poType.name",
    tooltipField: "productionOrder.poType.name",
    width: 80
  },
  {
    ...defaultColDef,
    field: "productionOrder.modelId.parentCode.unitID.name",
    headerName: "Unit ID",
    colId: "productionOrder.modelId.parentCode.unitID.name",
    tooltipField: "productionOrder.modelId.parentCode.unitID.name",
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
