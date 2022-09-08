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


export const workFormGridConfig = [
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "factory",
        headerName: "Factory",
        colId: "factory",
        width: 140,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "workFormNo",
        headerName: "Work Form No",
        colId: "workFormNo",
        width: 120,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "workFormName",
        headerName: "Work Form Name",
        colId: "workFormName",
        width: 150,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "shiftName",
        headerName: "Shift",
        colId: "shiftName",
        width: 100,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "overTime",
        headerName: "Over Time (Y/N)",
        colId: "overTime",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        field: "shiftStartTime",
        headerName: "Start Time",
        colId: "shiftStartTime",
        width: 140
    },
    {
        ...defaultColDef,
        field: "finishTime",
        headerName: "Finish Time",
        colId: "finishTime",
        width: 120
    },
    {
        ...defaultColDef,
        field: "startRest",
        headerName: "Start Rest Time",
        colId: "startRest",
        width: 120
    },
    {
        ...defaultColDef,
        field: "endRestTime",
        headerName: "End Rest Time",
        colId: "endRestTime",
        width: 120
    },
    {
        ...defaultColDef,
        field: "workingTime",
        headerName: "Working Time (m)",
        colId: "workingTime",
        width: 120
    },
    {
        ...defaultColDef,
        field: "restTime",
        headerName: "Rest Time",
        colId: "restTime",
        width: 100
    },
    {
        ...defaultColDef,
        field: "overTimeM",
        headerName: "Over Time (m)",
        colId: "overTimeM",
        width: 120
    },
];