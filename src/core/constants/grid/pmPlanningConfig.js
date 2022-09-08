import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const pmPlanningGridConfig = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'maintenanceEquipment.equipmentID.equipmentPart.name',
    tooltipField: 'maintenanceEquipment.equipmentID.equipmentPart.name',
    headerName: 'Part',
    width: 50,
    colId: 'maintenanceEquipment.equipmentID.equipmentPart.name',
    pinned: 'left',
    cellClass: 'vertical-middle ag-middle-aligned-cell'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'maintenanceEquipment.equipmentID.equipmentLine.name',
    tooltipField: 'maintenanceEquipment.equipmentID.equipmentLine.name',
    headerName: 'Line',
    width: 85,
    colId: 'maintenanceEquipment.equipmentID.equipmentLine.name',
    pinned: 'left'
  },

  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'maintenanceEquipment.equipmentID.equipmentProcess.name.name',
    tooltipField: 'maintenanceEquipment.equipmentID.equipmentProcess.name.name',
    headerName: 'Process',
    width: 70,
    colId: 'maintenanceEquipment.equipmentID.equipmentProcess.name.name',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'maintenanceEquipment.equipmentID.equipmentWorkStation.name',
    tooltipField: 'maintenanceEquipment.equipmentID.equipmentWorkStation.name',
    headerName: 'Work Station',
    width: 60,
    colId: 'maintenanceEquipment.equipmentID.equipmentWorkStation.name',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'maintenanceEquipment.equipmentID.code',
    tooltipField: 'maintenanceEquipment.equipmentID.code',
    headerName: 'Equip ID Code',
    width: 90,
    colId: 'maintenanceEquipment.equipmentID.code',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'maintenanceEquipment.equipmentID.name',
    tooltipField: 'maintenanceEquipment.equipmentID.name',
    headerName: 'Equip ID Name',
    width: 70,
    colId: 'maintenanceEquipment.equipmentID.name',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'code',
    tooltipField: 'code',
    headerName: 'Plan ID',
    width: 85,
    colId: 'code',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'pmStartDate',
    tooltipField: 'pmStartDate',
    headerName: 'PM Start Date',
    width: 70,
    colId: 'pmStartDate'
  },
  {
    ...defaultColDef,
    field: 'pmType.name',
    tooltipField: 'pmType.name',
    headerName: 'PM Type',
    width: 150,
    colId: 'pmType.name'
  },
  {
    ...defaultColDef,
    field: 'pmCycle.name',
    tooltipField: 'pmCycle.name',
    headerName: 'PM Cycle',
    width: 150,
    colId: 'pmCycle.name'
  },
  {
    ...defaultColDef,
    field: 'noticeYN',
    tooltipField: 'noticeYN',
    headerName: 'Notice (Y/N)',
    width: 100,
    colId: 'noticeYN'
  },
  {
    ...defaultColDef,
    field: 'noticePIC',
    tooltipField: 'noticePIC',
    headerName: 'Notice PIC',
    width: 80,
    colId: 'noticePIC'
  },
  {
    ...defaultColDef,
    field: 'noticeBefore',
    tooltipField: 'noticeBefore',
    headerName: 'Notice before (day)',
    width: 100,
    colId: 'noticeBefore'
  },
  {
    ...defaultColDef,
    field: 'noticeCycle.name',
    tooltipField: 'noticeCycle.name',
    headerName: 'Notice Frequency',
    width: 100,
    colId: 'noticeCycle.name'
  },
  {
    ...defaultColDef,
    field: 'pmContent',
    tooltipField: 'pmContent',
    headerName: 'PM Content',
    width: 150,
    colId: 'pmContent'
  },

  ...defaultAuditFields
];
