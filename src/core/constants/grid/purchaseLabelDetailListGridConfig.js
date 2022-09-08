import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const purchaseLabelDetailListGridConfig = [
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
        field: "boxLabelDetail.generateID",
        headerName: "Generate ID",
        colId: "boxLabelDetail.generateID",
        tooltipField: "boxLabelDetail.generateID"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "boxLabelDetail.orderNo",
        headerName: "Purchase Order No.",
        colId: "boxLabelDetail.orderNo",
        tooltipField: "boxLabelDetail.orderNo"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "boxLabelDetail.lotNo",
        headerName: "Lot No.",
        colId: "boxLabelDetail.lotNo",
        tooltipField: "boxLabelDetail.lotNo"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "labelNo",
        headerName: "Box No.",
        colId: "labelNo",
        tooltipField: "labelNo"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "qty",
        headerName: "Qty",
        colId: "qty",
        tooltipField: "qty"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "printNo",
        headerName: "Print No.",
        colId: "printNo",
        tooltipField: "printNo"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "lastPrintTime",
        headerName: "Last Print Time",
        colId: "lastPrintTime",
        tooltipField: "lastPrintTime"
    },
    {
        ...defaultColDef,
        field: "usrLogI",
        tooltipField: "usrLogI",
        headerName: "Registered By",
        cellClass: "vertical-middle",
        colId: "usrLogI"
    },
    {
        ...defaultColDef,
        field: "usrLogU",
        tooltipField: "usrLogU",
        headerName: "Last Print By",
        cellClass: "vertical-middle",
        colId: "usrLogU"
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