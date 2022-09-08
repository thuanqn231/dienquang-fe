import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const inspectionItemGridConfig = {
  class: [
    ...defaultFactoryFields,
    {
      ...defaultColDef,
      suppressMovable: true,
      field: "inspectionType.name",
      tooltipField: "inspectionType.name",
      headerName: "Inspection Type",
      colId: "inspectionType.name",
      width: 200,
      pinned: "left"
    },
    {
      ...defaultColDef,
      suppressMovable: true,
      field: "code",
      tooltipField: "code",
      headerName: "Inspection Class Code",
      colId: "code",
      width: 200,
      pinned: "left"
    },
    {
      ...defaultColDef,
      suppressMovable: true,
      field: "name",
      tooltipField: "name",
      headerName: "Inspection Class Name",
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
      headerName: "Detail Insp Code",
      colId: "code",
      width: 200,
      pinned: "left"
    },
    {
      ...defaultColDef,
      suppressMovable: true,
      field: "name",
      tooltipField: "name",
      headerName: "Detail Insp Name",
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