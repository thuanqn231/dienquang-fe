import { defaultColDef } from './defaultColDef';
import { defaultAuditFields } from './defaultAuditFields';

export const productionLabelDetailListGridConfig = [
    {
        ...defaultColDef,
        filter: false,
        suppressColumnsToolPanel: true,
        suppressMovable: true,
        sortable: false,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        maxWidth: 21,
        colId: "0",
        pinned: "left"
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
        field: "serialLabelDetail.generateID",
        headerName: "Generate ID",
        colId: "serialLabelDetail.generateID",
        tooltipField: "serialLabelDetail.generateID",
        width: 100
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "serialLabelDetail.orderNo",
        headerName: "Prod Order No.",
        colId: "serialLabelDetail.orderNo",
        tooltipField: "serialLabelDetail.orderNo",
        width: 110
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "serialLabelDetail.material.unitID.name",
        headerName: "Unit ID",
        colId: "serialLabelDetail.material.unitID.name",
        tooltipField: "serialLabelDetail.material.unitID.name",
        width: 100
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "serialLabelDetail.material.materialId",
        headerName: "Material ID",
        colId: "serialLabelDetail.material.materialId",
        tooltipField: "serialLabelDetail.material.materialId",
        width: 100
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "serialLabelDetail.material.code",
        headerName: "Material Code",
        colId: "serialLabelDetail.material.code",
        tooltipField: "serialLabelDetail.material.code",
        width: 100
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "serialLabelDetail.material.name",
        headerName: "Material Name",
        colId: "serialLabelDetail.material.name",
        tooltipField: "serialLabelDetail.material.name",
        width: 110
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "epassNo",
        headerName: "E-Pass No",
        colId: "epassNo",
        tooltipField: "epassNo",
        width: 250
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "printNo",
        headerName: "Print No.",
        colId: "printNo",
        tooltipField: "printNo",
        width: 80
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "lastPrintTime",
        headerName: "Last Print Time",
        colId: "lastPrintTime",
        tooltipField: "lastPrintTime",
        width: 120
    },
    {
        ...defaultColDef,
        field: "usrLogI",
        tooltipField: "usrLogI",
        headerName: "Registered By",
        cellClass: "vertical-middle",
        colId: "usrLogI",
        width: 120
    },
    {
        ...defaultColDef,
        field: "usrLogU",
        tooltipField: "usrLogU",
        headerName: "Last Print By",
        cellClass: "vertical-middle",
        colId: "usrLogU",
        width: 120
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "rePrintReason",
        headerName: "Re-Print Reason",
        colId: "rePrintReason",
        tooltipField: "rePrintReason"
    }
];