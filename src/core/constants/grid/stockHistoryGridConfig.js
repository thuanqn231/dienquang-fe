import { defaultColDef } from './defaultColDef';

export const stockHistoryGridConfig = [
    {
        ...defaultColDef,
        filter: false,
        suppressMovable: true,
        sortable: false,
        field: "row_index",
        headerName: "No.",
        valueGetter: "node.rowIndex + 1",
        minWidth: 45,
        colId: "row_index",
        width: 45,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "pk.factoryName",
        tooltipField: "pk.factoryName",
        headerName: "Factory",
        colId: "pk.factoryName",
        width: 100,
        pinned: "left",
        hide: true
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "label.labelType.name",
        headerName: "Label Type",
        colId: "label.labelType.name",
        tooltipField: "label.labelType.name",
        width: 100,
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
        width: 80
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "label.labelDetail.material.description",
        headerName: "Material Desc.",
        colId: "label.labelDetail.material.description",
        tooltipField: "label.labelDetail.material.description",
        width: 140
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "label.labelDetail.material.mainUnit.name",
        headerName: "Unit",
        colId: "label.labelDetail.material.mainUnit.name",
        tooltipField: "label.labelDetail.material.mainUnit.name",
        width: 80
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "operationType.name",
        headerName: "Operation Type",
        colId: "operationType.name",
        tooltipField: "operationType.name",
        width: 80
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "line.name",
        headerName: "Line",
        colId: "line.name",
        tooltipField: "line.name",
        width: 120
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "bin.zone.stock.name",
        headerName: "Storage",
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
        field: "operationNo",
        headerName: "Operation No",
        colId: "operationNo",
        tooltipField: "operationNo",
        width: 80
    },
    {
        ...defaultColDef,
        field: "stockStatus.name",
        headerName: "Stock Status",
        colId: "stockStatus.name",
        tooltipField: "stockStatus.name",
        width: 80
    },
    {
        ...defaultColDef,
        field: "state",
        headerName: "Use (Y/N)",
        colId: "state",
        tooltipField: "state",
        width: 80
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "stockQty",
        headerName: "Qty",
        colId: "stockQty",
        tooltipField: "stockQty",
        cellClass: "vertical-middle ag-right-aligned-cell",
        width: 80
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
        field: "label.labelDetail.supplier.nationalName",
        headerName: "Supplier",
        colId: "label.labelDetail.supplier.nationalName",
        tooltipField: "label.labelDetail.supplier.nationalName",
        width: 120
    },
    {
        ...defaultColDef,
        field: "pic",
        headerName: "PIC",
        colId: "pic",
        tooltipField: "pic",
        width: 80
    },
    {
        ...defaultColDef,
        field: "processTime",
        headerName: "Process Time",
        colId: "processTime",
        tooltipField: "processTime",
        width: 120
    },
    {
        ...defaultColDef,
        field: "stockQtyChange",
        headerName: "Stock Qty Change",
        colId: "stockQtyChange",
        tooltipField: "stockQtyChange",
        cellClass: "vertical-middle ag-right-aligned-cell",
        width: 120
    }
];