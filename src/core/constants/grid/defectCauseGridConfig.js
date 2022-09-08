import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const defectCauseGridConfig = {
  class: [
    ...defaultFactoryFields,
    {
      ...defaultColDef,
      suppressMovable: true,
      field: "code",
      tooltipField: "code",
      headerName: "Cause Class Code",
      colId: "code",
      width: 200,
      pinned: "left"
    },
    {
      ...defaultColDef,
      suppressMovable: true,
      field: "name",
      tooltipField: "name",
      headerName: "Cause Class Name",
      colId: "name",
      width: 280,
    },
    {
      ...defaultColDef,
      suppressMovable: true,
      field: "rank",
      tooltipField: "rank",
      headerName: "Sort Order",
      colId: "rank",
      width: 120,
    },
    ...defaultAuditFields
  ],
  detail: [
    ...defaultFactoryFields,
    {
      ...defaultColDef,
      suppressMovable: true,
      field: "code",
      tooltipField: "code",
      headerName: "Defect Cause Code",
      colId: "code",
      width: 200,
      pinned: "left"
    },
    {
      ...defaultColDef,
      suppressMovable: true,
      field: "name",
      tooltipField: "name",
      headerName: "Defect Cause Name",
      colId: "name",
      width: 280,
    },
    {
      ...defaultColDef,
      suppressMovable: true,
      field: "rank",
      tooltipField: "rank",
      headerName: "Sort Order",
      colId: "rank",
      width: 120,
    },
    ...defaultAuditFields
  ]
}