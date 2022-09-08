import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

// default name title of collumns


export const equipmentCodeGridConfig = [
    ...defaultFactoryFields,
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "code",
        headerName: "Equip. Code",
        colId: "equipmentGroupCode",
        width: 120,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "equipmentGroup.code",
        headerName: "Equip. Group",
        colId: "equipmentGroupName",
        width: 120,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "equipmentType.name",
        headerName: "Equip. Type",
        colId: "equipmentGroupType",
        width: 130,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "name",
        headerName: "Equip. Name",
        colId: "equipmentGroupName",
        width: 180,
        pinned: "left"
    },
    {
        ...defaultColDef,
        field: "equipmentSpec",
        headerName: "Equip. Spec",
        colId: "equipmentGroupSpec",
        width: 130
    },
    {
        ...defaultColDef,
        field: "unit.code",
        headerName: "Unit",
        colId: "equipmentGroupUnit",
        width: 130
    },
    {
        ...defaultColDef,
        field: "vendor.nationalName",
        headerName: "Vendor",
        colId: "vendor.nationalName",
        width: 130
    },
    {
        ...defaultColDef,
        field: "maker.nationalName",
        headerName: "Maker",
        colId: "maker.nationalName",
        width: 130
    },
    ...defaultAuditFields
];