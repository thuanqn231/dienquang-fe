import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const equipmentIDGridConfig = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'code',
    headerName: 'Equip. ID',
    colId: 'code',
    width: 120,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'equipmentCode.code',
    headerName: 'Equip. Code',
    colId: 'equipmentCode.code',
    width: 120,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'name',
    headerName: 'Equip. ID Name',
    colId: 'name',
    width: 130,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'equipmentSpec',
    headerName: 'Equip. ID Spec',
    colId: 'equipmentSpec',
    width: 180
  },
  {
    ...defaultColDef,
    field: 'equipmentPlant.name',
    headerName: 'Equip. ID Plant',
    colId: 'equipmentPlant.name',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'equipmentTeam.name',
    headerName: 'Equip. ID Team',
    colId: 'equipmentTeam.name',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'equipmentGroup.name',
    headerName: 'Equip. ID Group',
    colId: 'equipmentGroup.name',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'equipmentPart.name',
    headerName: 'Equip. ID Part',
    colId: 'equipmentPart.name',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'equipmentLine.name',
    headerName: 'Equip. ID Line',
    colId: 'equipmentLine.name',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'equipmentProcess.code',
    headerName: 'Equip. ID Process',
    colId: 'equipmentProcess.code',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'equipmentWorkStation.name',
    headerName: 'Equip. ID Work Station',
    colId: 'equipmentWorkStation.name',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'equipmentSeqByLine',
    headerName: 'Equipment Seq By Line',
    colId: 'equipmentSeqByLine',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'equipmentSeqByEquip',
    headerName: 'Equipment Seq By Equip',
    colId: 'equipmentSeqByEquip',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'lossMngt',
    headerName: 'LossMngt',
    colId: 'lossMngt',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'mchMngt',
    headerName: 'mchMngt',
    colId: 'mchMngt',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'equipmentSerial',
    headerName: 'Equipment Serial',
    colId: 'equipmentSerial',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'equipmentAsset',
    headerName: 'Equipment Asset',
    colId: 'equipmentAsset',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'equipmentGroup.code',
    headerName: 'Equip. ID Group',
    colId: 'equipmentGroup.code',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'rfidCode',
    headerName: 'Rfid Code',
    colId: 'rfidCode',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'equipmentModel',
    headerName: 'Equipment Model',
    colId: 'equipmentModel',
    width: 130
  },
  {
    ...defaultColDef,
    field: 'equipmentStatus.name',
    headerName: 'Equipment Status',
    colId: 'equipmentStatus.name',
    width: 130
  },
  ...defaultAuditFields
];
