import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const pmResultGridConfig = [
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
    suppressMovable: true,
    field: 'maintenanceEquipment.pk.factoryName',
    tooltipField: 'maintenanceEquipment.pk.factoryName',
    headerName: 'Factory',
    colId: 'maintenanceEquipment.pk.factoryName',
    width: 140,
    pinned: 'left',
    hide: true
  },
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
    field: 'maintenanceEquipment.pmSchedule.planID',
    tooltipField: 'maintenanceEquipment.pmSchedule.planID',
    headerName: 'Plan ID',
    width: 85,
    colId: 'maintenanceEquipment.pmSchedule.planID',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'maintenanceEquipment.pmSchedule.pmStartDate',
    tooltipField: 'maintenanceEquipment.pmSchedule.pmStartDate',
    headerName: 'PM Start Date',
    width: 70,
    colId: 'maintenanceEquipment.pmSchedule.pmStartDate'
  },
  {
    ...defaultColDef,
    field: 'actualPMDate',
    tooltipField: 'actualPMDate',
    headerName: 'Actual PM Date',
    width: 70,
    colId: 'actualPMDate'
  },
  {
    ...defaultColDef,
    field: 'maintenanceEquipment.pmSchedule.pmType.name',
    tooltipField: 'maintenanceEquipment.pmSchedule.pmType.name',
    headerName: 'PM Type',
    width: 150,
    colId: 'maintenanceEquipment.pmSchedule.pmType.name'
  },
  {
    ...defaultColDef,
    field: 'maintenanceEquipment.pmSchedule.pmCycle.name',
    tooltipField: 'maintenanceEquipment.pmSchedule.pmCycle.name',
    headerName: 'PM Cycle',
    width: 150,
    colId: 'maintenanceEquipment.pmSchedule.pmCycle.name'
  },
  {
    ...defaultColDef,
    field: 'pmNo',
    tooltipField: 'pmNo',
    headerName: 'PM No',
    colId: 'pmNo'
  },

  {
    ...defaultColDef,
    field: 'maintenanceEquipment.pmSchedule.noticePIC',
    tooltipField: 'maintenanceEquipment.pmSchedule.noticePIC',
    headerName: 'Notice PIC',
    width: 80,
    colId: 'maintenanceEquipment.pmSchedule.noticePIC'
  },
  {
    ...defaultColDef,
    field: 'approvalStatus.name',
    tooltipField: 'approvalStatus.name',
    headerName: 'PM Result Status',
    width: 100,
    colId: 'approvalStatus.name'
  },
  {
    ...defaultColDef,
    field: 'spUse',
    tooltipField: 'spUse',
    headerName: 'SP Use (Y/N)',
    width: 100,
    colId: 'spUse'
  },
  {
    ...defaultColDef,
    field: 'maintenanceEquipment.pmSchedule.pmContent',
    tooltipField: 'maintenanceEquipment.pmSchedule.pmContent',
    headerName: 'PM Content',
    width: 150,
    colId: 'maintenanceEquipment.pmSchedule.pmContent'
  },

  {
    ...defaultColDef,
    field: 'usrLogI',
    tooltipField: 'usrLogI',
    headerName: 'Registered By',
    cellClass: 'vertical-middle',
    colId: 'usrLogI',
    width: 140
  },
  {
    ...defaultColDef,
    field: 'dteLogI',
    tooltipField: 'dteLogI',
    headerName: 'Registered Date',
    cellClass: 'vertical-middle',
    colId: 'dteLogI',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'usrLogU',
    tooltipField: 'usrLogU',
    headerName: 'Updated By',
    cellClass: 'vertical-middle',
    colId: 'usrLogU',
    width: 140
  },
  {
    ...defaultColDef,
    field: 'dteLogU',
    tooltipField: 'dteLogU',
    headerName: 'Updated Date',
    cellClass: 'vertical-middle',
    colId: 'dteLogU',
    width: 120
  }
];
