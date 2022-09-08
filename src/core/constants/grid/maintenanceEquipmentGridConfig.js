import { defaultColDef } from './defaultColDef';

export const maintenanceEquipmentGridConfig = [
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
    field: 'equipmentPart',
    headerName: 'Part',
    colId: 'equipmentPart',
    width: 150
  },
  {
    ...defaultColDef,
    field: 'equipmentLine',
    headerName: 'Line',
    colId: 'equipmentLine',
    width: 200
  },
  {
    ...defaultColDef,
    field: 'equipmentProcess',
    headerName: 'Process',
    colId: 'equipmentProcess',
    width: 200
  },

  {
    ...defaultColDef,
    field: 'equipmentWorkStation',
    headerName: 'Work Station',
    colId: 'equipmentWorkStation',
    width: 200
  },
  {
    ...defaultColDef,
    field: 'code',
    headerName: 'Equip ID',
    colId: 'code',
    width: 200
  },

  {
    ...defaultColDef,
    field: 'name',
    headerName: 'Equip Name',
    colId: 'name',
    width: 200
  },

  {
    ...defaultColDef,
    field: 'equipmentSpec',
    headerName: 'Equip Spec',
    colId: 'equipmentSpec',
    width: 250
  }
];
