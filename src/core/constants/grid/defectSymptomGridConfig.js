import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const defectSymptomGridConfig = {
  class: [
    ...defaultFactoryFields,
    {
      ...defaultColDef,
      suppressMovable: true,
      field: "code",
      tooltipField: "code",
      headerName: "Symptom Class Code",
      colId: "code",
      width: 200,
      pinned: "left"
    },
    {
      ...defaultColDef,
      suppressMovable: true,
      field: "name",
      tooltipField: "name",
      headerName: "Symptom Class Name",
      colId: "name",
      width: 280,
    },
    {
      ...defaultColDef,
      suppressMovable: true,
      field: "sortOrder",
      tooltipField: "sortOrder",
      headerName: "Sort Order",
      colId: "sortOrder",
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
      headerName: "Defect Symptom Code",
      colId: "code",
      width: 200,
      pinned: "left"
    },
    {
      ...defaultColDef,
      suppressMovable: true,
      field: "name",
      tooltipField: "name",
      headerName: "Defect Symptom Name",
      colId: "name",
      width: 280,
    },
    {
      ...defaultColDef,
      suppressMovable: true,
      field: "sortOrder",
      tooltipField: "sortOrder",
      headerName: "Sort Order",
      colId: "sortOrder",
      width: 120,
    },
    ...defaultAuditFields
  ]
}