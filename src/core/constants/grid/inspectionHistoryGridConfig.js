import { defaultColDef } from './defaultColDef';

export const inspectionHistoryGridConfig = [
  {
    ...defaultColDef,
    filter: false,
    suppressColumnsToolPanel: true,
    suppressMovable: true,
    sortable: false,
    checkboxSelection: true,
    maxWidth: 21,
    colId: '0',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    filter: false,
    suppressMovable: true,
    sortable: false,
    field: 'row_index',
    headerName: 'No.',
    valueGetter: 'node.rowIndex + 1',
    minWidth: 45,
    colId: 'row_index',
    width: 45,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'inspectionType',
    headerName: 'Insp Type',
    colId: 'inspectionType',
    tooltipField: 'inspectionType',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'material.code',
    headerName: 'Material Code',
    colId: 'material.code',
    tooltipField: 'material.code',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'material.description',
    headerName: 'Material Description',
    colId: 'material.description',
    tooltipField: 'material.description',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'material.mainUnit.name',
    headerName: 'Unit',
    colId: 'material.mainUnit.name',
    tooltipField: 'material.mainUnit.name',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'goodReceiptPlan.grNo',
    headerName: 'Gr No',
    colId: 'goodReceiptPlan.grNo',
    tooltipField: 'goodReceiptPlan.grNo',
    width: 100,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'qty',
    headerName: 'Qty',
    colId: 'qty',
    tooltipField: 'qty',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'qcResult.description',
    headerName: 'Result',
    colId: 'qcResult.description',
    tooltipField: 'qcResult.description',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'label.labelNo',
    headerName: 'Label No',
    colId: 'label.labelNo',
    tooltipField: 'label.labelNo',
    width: 180,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'ngQty',
    headerName: 'NG Qty',
    colId: 'ngQty',
    tooltipField: 'ngQty',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'sampleQty',
    headerName: 'Sample Qty',
    colId: 'sampleQty',
    tooltipField: 'sampleQty',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'attachment',
    headerName: 'Attachment (Y/N)',
    colId: 'attachment',
    tooltipField: 'attachment',
    width: 90,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'remark',
    headerName: 'Remark',
    colId: 'remark',
    tooltipField: 'remark',
    width: 80
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'inspectionTime',
    headerName: 'Inspection Time',
    colId: 'inspectionTime',
    tooltipField: 'inspectionTime',
    width: 180
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'lastInspectionTime',
    headerName: 'Last Inspection Time',
    colId: 'lastInspectionTime',
    tooltipField: 'lastInspectionTime',
    width: 180
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'pic.fullName',
    headerName: 'Inspection Pic',
    colId: 'pic.fullName',
    tooltipField: 'pic.fullName',
    width: 80
  }
];
