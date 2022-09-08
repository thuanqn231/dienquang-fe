import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const factoryConfigurationGridConfig = [
    ...defaultFactoryFields,
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "code",
        headerName: "Param Code",
        colId: "code",
        width: 180,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "name",
        headerName: "Param Name",
        colId: "name",
        width: 180,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "paramValue",
        headerName: "Value",
        colId: "paramValue",
        width: 180,
        pinned: "left"
    },
    {
        ...defaultColDef,
        field: "remark",
        headerName: "Remark",
        colId: "remark",
        width: 270
    },
    ...defaultAuditFields
]