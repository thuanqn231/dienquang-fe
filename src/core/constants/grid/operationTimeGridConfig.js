import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const operationTimeGridConfig = [
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'equipmentPart',
    headerName: 'Part',
    colId: 'equipmentPart',
    tooltipField: 'equipmentPart',
    width: 120,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'equipmentLine',
    headerName: 'Line',
    colId: 'equipmentLine',
    tooltipField: 'equipmentLine',
    width: 90,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'equipmentProcess',
    headerName: 'Process',
    colId: 'equipmentProcess',
    tooltipField: 'equipmentProcess',
    width: 90,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'equipmentWorkStation',
    headerName: 'Work Station',
    colId: 'equipmentWorkStation',
    tooltipField: 'equipmentWorkStation',
    width: 80,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'equipmentID.code',
    headerName: 'Equip ID Code',
    colId: 'equipmentID.code',
    tooltipField: 'equipmentID.code',
    width: 130,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'equipmentID.name',
    headerName: 'Equip ID Name',
    colId: 'equipmentID.name',
    tooltipField: 'equipmentID.name',
    width: 130,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'operationDate',
    headerName: 'Operation Date',
    colId: 'operationDate',
    tooltipField: 'operationDate',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'operationTime',
    headerName: 'Operation Time',
    colId: 'operationTime',
    tooltipField: 'operationTime',
    cellClass: "vertical-middle ag-right-aligned-cell",
    width: 120
  },
  {
    ...defaultColDef,
    field: 'lossTime',
    headerName: 'Loss Time',
    colId: 'lossTime',
    tooltipField: 'lossTime',
    cellClass: "vertical-middle ag-right-aligned-cell",
    width: 130
  },
  {
    ...defaultColDef,
    field: 'totalTime',
    headerName: 'Total Time',
    colId: 'totalTime',
    tooltipField: 'totalTime',
    cellClass: "vertical-middle ag-right-aligned-cell",
    width: 120
  },
  {
    ...defaultColDef,
    field: 'operationRate',
    headerName: 'Operation Rate',
    colId: 'operationRate',
    tooltipField: 'operationRate',
    cellClass: "vertical-middle ag-right-aligned-cell",
    width: 120
  }
];
