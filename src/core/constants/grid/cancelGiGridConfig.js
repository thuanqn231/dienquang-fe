import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';

export const cancelGiGridConfig = [
    ...defaultFactoryFields,
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "label.labelDetail.material.materialId",
        headerName: "Material ID",
        colId: "label.labelDetail.material.materialId",
        tooltipField: "label.labelDetail.material.materialId",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "label.labelDetail.material.code",
        headerName: "Material Code",
        colId: "label.labelDetail.material.code",
        tooltipField: "label.labelDetail.material.code",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "label.labelDetail.material.name",
        headerName: "Material Name",
        colId: "label.labelDetail.material.name",
        tooltipField: "label.labelDetail.material.name",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "label.labelDetail.material.description",
        headerName: "Material Desc.",
        colId: "label.labelDetail.material.description",
        tooltipField: "label.labelDetail.material.description",
        width: 140,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "label.labelDetail.material.mainUnit.name",
        headerName: "Unit",
        colId: "label.labelDetail.material.mainUnit.name",
        tooltipField: "label.labelDetail.material.mainUnit.name",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "label.labelNo",
        headerName: "Label No.",
        colId: "label.labelNo",
        tooltipField: "label.labelNo",
        width: 180,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "goodIssuePlan.giNo",
        headerName: "G/I No.",
        colId: "goodIssuePlan.giNo",
        tooltipField: "goodIssuePlan.giNo",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "operationType.name",
        headerName: "Operation Type",
        colId: "operationType.name",
        tooltipField: "operationType.name",
        width: 90,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "giQty",
        headerName: "G/I Qty",
        colId: "giQty",
        tooltipField: "giQty",
        cellClass: "vertical-middle ag-right-aligned-cell",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "label.labelDetail.supplier.nationalName",
        headerName: "Supplier",
        colId: "label.labelDetail.supplier.nationalName",
        tooltipField: "label.labelDetail.supplier.nationalName",
        width: 120
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "bin.zone.stock.name",
        headerName: "Stock",
        colId: "bin.zone.stock.name",
        tooltipField: "bin.zone.stock.name",
        width: 120
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "bin.zone.name",
        headerName: "Zone",
        colId: "bin.zone.name",
        tooltipField: "bin.zone.name",
        width: 120
    },
    {
        ...defaultColDef,
        field: "bin.name",
        headerName: "Bin",
        colId: "bin.name",
        tooltipField: "bin.name",
        width: 80
    },
    {
        ...defaultColDef,
        field: "dteLogU",
        headerName: "G/I Date",
        colId: "dteLogU",
        tooltipField: "dteLogU",
        width: 120
    },
    {
        ...defaultColDef,
        field: "usrLogU",
        headerName: "G/I PIC",
        colId: "usrLogU",
        tooltipField: "usrLogU",
        width: 100
    }
];