import { defaultColDef } from './defaultColDef';

export const stockInfoGridConfig = [
    {
        ...defaultColDef,
        filter: false,
        suppressColumnsToolPanel: true,
        suppressMovable: true,
        sortable: false,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        maxWidth: 21,
        colId: "0"
    },
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
        width: 45
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "pk.factoryName",
        tooltipField: "pk.factoryName",
        headerName: "Factory",
        colId: "pk.factoryName",
        width: 120,
        hide: true
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "labelType",
        headerName: "Label Type",
        colId: "labelType",
        tooltipField: "labelType"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "materialId",
        headerName: "Material ID",
        colId: "materialId",
        tooltipField: "materialId"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "materialCode",
        headerName: "Material Code",
        colId: "materialCode",
        tooltipField: "materialCode"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "materialName",
        headerName: "Material Name",
        colId: "materialName",
        tooltipField: "materialName"
        
    },
    {
        ...defaultColDef,
        field: "description",
        headerName: "Material Description",
        cellClass: "vertical-middle ag-left-aligned-cell",
        tooltipField: "description",
        colId: "description"
    },
    {
        ...defaultColDef,
        field: "materialType",
        headerName: "Material Type",
        tooltipField: "materialType",
        colId: "materialType"
    },
    {
        ...defaultColDef,
        field: "unitName",
        headerName: "Unit",
        tooltipField: "unitName",
        colId: "unitName"
    },
    {
        ...defaultColDef,
        field: "stockQty",
        headerName: "Stock Qty",
        tooltipField: "stockQty",
        colId: "stockQty",
        cellClass: "vertical-middle ag-right-aligned-cell"
    },
    {
        ...defaultColDef,
        field: "stockStatus",
        headerName: "Stock Status",
        tooltipField: "stockStatus",
        colId: "stockStatus"
    },
    {
        ...defaultColDef,
        field: "lotNo",
        headerName: "Lot No",
        tooltipField: "lotNo",
        colId: "lotNo"
    },
    {
        ...defaultColDef,
        field: "supplier",
        headerName: "Supplier",
        tooltipField: "supplier",
        colId: "supplier"
    },
    {
        ...defaultColDef,
        field: "boxNo",
        headerName: "Label",
        tooltipField: "boxNo",
        colId: "boxNo"
    }
];