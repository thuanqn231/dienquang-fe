const defaultColDef = {
    flex: true,
    resizable: true,
    rowGroup: false,
    rowGroupIndex: null,
    pivot: false,
    pivotIndex: null,
    aggFunc: null,
    sort: null,
    sortIndex: null,
    cellClass: "vertical-middle",
    pinned: null,
    sortable: true,
    filter: true,
    minWidth: 50
}


export const AssignFormGrid = [
    {
        ...defaultColDef,
        filter: false,
        suppressColumnsToolPanel: true,
        suppressMovable: true,
        sortable: false,
        checkboxSelection: true,
        maxWidth: 30,
        colId: "0",
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "nameFactory",
        headerName: "Factory",
        colId: "nameFactory",
        width: 200,
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "workDate",
        headerName: "Work Date",
        colId: "workDate",
        width: 230,
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "nameLine",
        headerName: "Line",
        colId: "nameLine",
        width: 150,
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "nameShift",
        headerName: "Shift",
        colId: "nameShift",
        width: 200,
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "nameGroup",
        headerName: "Work Group",
        colId: "nameGroup",
        width: 170,
    },
    {
        ...defaultColDef,
        field: "nameWorkType",
        headerName: "Work Type",
        colId: "nameWorkType",
        width: 169
    }
];