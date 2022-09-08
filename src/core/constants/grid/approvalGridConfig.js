import { defaultColDef } from './defaultColDef';

export const approvalGridConfig = [
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
    headerName: 'Priority',
    field: 'priority',
    colId: 'priority',
    tooltipField: "priority",
    pinned: "left"
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    headerName: 'Requester',
    field: 'requester',
    colId: 'requester',
    tooltipField: "requester"
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    headerName: 'Title',
    field: 'title',
    colId: 'title',
    tooltipField: "title",
    cellClass: 'vertical-middle ag-left-aligned-cell',
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    headerName: 'Status',
    field: 'status',
    colId: 'status',
    tooltipField: "status"
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    headerName: 'Requested Time',
    field: 'requestedTime',
    colId: 'requestedTime',
    tooltipField: "requestedTime"
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    headerName: 'Approved Time',
    field: 'approvedTime',
    colId: 'approvedTime',
    tooltipField: "approvedTime"
  }
];
