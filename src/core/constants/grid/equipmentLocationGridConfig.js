import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const equipmentLocationGridConfig = {
  stock: [
    ...defaultFactoryFields,
    {
      ...defaultColDef,
      suppressMovable: true,
      field: 'equipmentID.code',
      headerName: 'Equip. ID',
      colId: 'code',
      width: 260,
      pinned: 'left'
    },
    {
      ...defaultColDef,
      suppressMovable: true,
      field: 'equipmentID.name',
      headerName: 'Equip. ID Name',
      colId: 'equipmentName',
      width: 300,
      pinned: 'left'
    },
    {
      ...defaultColDef,
      suppressMovable: true,
      field: 'equipmentID.equipmentSpec',
      headerName: 'Equip. ID Spec',
      colId: 'equipmentIDSpec',
      width: 320
    },
    {
      ...defaultColDef,
      field: 'equipmentID.equipmentCode.unit.name',
      headerName: 'Unit',
      colId: 'unit',
      width: 150
    },
    {
      ...defaultColDef,
      field: 'bin.zone.stock.name',
      headerName: 'Storage',
      colId: 'Storage',
      width: 180
    },
    {
      ...defaultColDef,
      field: 'bin.zone.name',
      headerName: 'Zone',
      colId: 'Zone',
      width: 180
    },
    {
      ...defaultColDef,
      field: 'bin.name',
      headerName: 'Bin',
      colId: 'Bin',
      width: 180
    }
  ],
  line: [
    ...defaultFactoryFields,
    {
      ...defaultColDef,
      suppressMovable: true,
      field: 'equipmentID.code',
      headerName: 'Equip. ID',
      colId: 'code',
      width: 260,
      pinned: 'left'
    },
    {
      ...defaultColDef,
      suppressMovable: true,
      field: 'equipmentID.name',
      headerName: 'Equip. ID Name',
      colId: 'equipmentName',
      width: 300,
      pinned: 'left'
    },
    {
      ...defaultColDef,
      suppressMovable: true,
      field: 'equipmentID.equipmentSpec',
      headerName: 'Equip. ID Spec',
      colId: 'equipmentIDSpec',
      width: 320
    },
    {
      ...defaultColDef,
      field: 'equipmentID.equipmentCode.unit.name',
      headerName: 'Unit',
      colId: 'unit',
      width: 150
    },
    {
      ...defaultColDef,
      field: 'workStation.process.line.name',
      headerName: 'Line',
      colId: 'Line',
      width: 180
    },
    {
      ...defaultColDef,
      field: 'workStation.process.name.name',
      headerName: 'Process',
      colId: 'Process',
      width: 200
    },
    {
      ...defaultColDef,
      field: 'workStation.name',
      headerName: 'W/S',
      colId: 'workStation',
      width: 180
    }
  ],
  scanTwo: [
    ...defaultFactoryFields,
    {
      ...defaultColDef,
      suppressMovable: true,
      field: 'equipmentID.code',
      headerName: 'Equip. ID',
      colId: 'code',
      width: 200,
      pinned: 'left'
    },
    {
      ...defaultColDef,
      suppressMovable: true,
      field: 'equipmentID.name',
      headerName: 'Equip. ID Name',
      colId: 'equipmentName',
      width: 200,
      pinned: 'left'
    },
    {
      ...defaultColDef,
      suppressMovable: true,
      field: 'equipmentID.equipmentSpec',
      headerName: 'Equip. ID Spec',
      colId: 'equipmentIDSpec',
      width: 200
    },
    {
      ...defaultColDef,
      field: 'equipmentID.equipmentCode.unit.name',
      headerName: 'Unit',
      colId: 'unit',
      width: 100
    },
    {
      ...defaultColDef,
      field: 'equipmentIDTarget.code',
      headerName: 'Tar. Equip ID',
      colId: 'Tar. Equip ID',
      width: 200
    },
    {
      ...defaultColDef,
      field: 'equipmentIDTarget.name',
      headerName: 'Tar. Equip. Name',
      colId: 'Tar. Equip. Name',
      width: 200
    },
    {
      ...defaultColDef,
      field: 'equipmentIDTarget.equipmentSpec',
      headerName: 'Tar. Equip. Spec',
      colId: 'Tar. Equip. Spec',
      width: 200
    }
  ]
};
