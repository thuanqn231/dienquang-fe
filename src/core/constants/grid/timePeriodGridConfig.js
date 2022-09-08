import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const timePeriodGridConfig = [
    ...defaultFactoryFields,
    {
        ...defaultColDef,
        "suppressMovable": true,
        "field": "year.name",
        "headerName": "Year",
        "colId": "year.name",
        "width": 140,
        "pinned": "left"
    },
    {
        ...defaultColDef,
        "suppressMovable": true,
        "field": "month",
        "headerName": "Month",
        "colId": "month",
        "width": 130,
        "pinned": "left"
    },
    {
        ...defaultColDef,
        "suppressMovable": true,
        "field": "week",
        "headerName": "Week",
        "colId": "week",
        "width": 140,
        "pinned": "left"
    },
    {
        ...defaultColDef,
        "suppressMovable": true,
        "field": "startDate",
        "headerName": "Start Date",
        "colId": "startDate",
        "width": 200,
        "pinned": "left"
    },
    {
        ...defaultColDef,
        "suppressMovable": true,
        "field": "endDate",
        "headerName": "End Date",
        "colId": "endDate",
        "width": 200,
        "pinned": "left"
    },
    ...defaultAuditFields
]