import { defaultColDef } from './defaultColDef';

export const grStockDetailGridConfig = [
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "label.pk.factoryName",
        tooltipField: "label.pk.factoryName",
        headerName: "Factory",
        colId: "label.pk.factoryName",
        width: 100,
        pinned: "left",
        hide: true
    },
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
        field: "label.lotNo",
        headerName: "Lot No.",
        colId: "label.lotNo",
        tooltipField: "label.lotNo",
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
        field: "dteLogI",
        headerName: "Process Time",
        colId: "dteLogI",
        tooltipField: "dteLogI",
        width: 120,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "sumStockQty",
        headerName: "Stock Qty",
        colId: "sumStockQty",
        tooltipField: "sumStockQty",
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
        field: "label.labelDetail.orderNo",
        headerName: "Order No.",
        colId: "label.labelDetail.orderNo",
        tooltipField: "label.labelDetail.orderNo",
        width: 80
    },
    {
        ...defaultColDef,
        field: "goodReceiptPlan.grNo",
        headerName: "G/R No.",
        colId: "goodReceiptPlan.grNo",
        tooltipField: "goodReceiptPlan.grNo",
        width: 80
    },
    {
        ...defaultColDef,
        field: "grDate",
        headerName: "Last G/R Date",
        colId: "grDate",
        tooltipField: "grDate",
        width: 120
    },
    {
        ...defaultColDef,
        field: "lastGIDate",
        headerName: "Last G/I Date",
        colId: "lastGIDate",
        tooltipField: "lastGIDate",
        width: 120
    },
    {
        ...defaultColDef,
        field: "grPic",
        headerName: "G/R PIC",
        colId: "grPic",
        tooltipField: "grPic",
        width: 120
    },
    {
        ...defaultColDef,
        field: "lastGIPic",
        headerName: "G/I PIC",
        colId: "lastGIPic",
        tooltipField: "lastGIPic",
        width: 100
    }
];