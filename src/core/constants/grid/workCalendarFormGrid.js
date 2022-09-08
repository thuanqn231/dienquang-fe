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


export const workCalendarFormGrid = [
    {
        ...defaultColDef,
        filter: false,
        suppressColumnsToolPanel: true,
        suppressMovable: true,
        sortable: false,
        checkboxSelection: true,
        maxWidth: 21,
        colId: "0",
        pinned: "left"
    },
    {

        ...defaultColDef,
        suppressMovable: true,
        field: "factory",
        headerName: "Factory",
        colId: "factory",
        width: 120,
        pinned: "left"
    },
    {

        ...defaultColDef,
        suppressMovable: true,
        field: "workDate",
        headerName: "Work Date",
        colId: "workDate",
        width: 120,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "line",
        headerName: "Line",
        colId: "line",
        width: 130,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "final",
        headerName: "Final (Y/N)",
        colId: "final",
        width: 100,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "process",
        headerName: "Process",
        colId: "process",
        width: 100,
        pinned: "left"
    },
    {
        ...defaultColDef,
        field: "shiftName",
        headerName: "Shift",
        colId: "shiftName",
        width: 120
    },
    {
        ...defaultColDef,
        field: "overTime",
        headerName: "Overtime (Y/N)",
        colId: "overTime",
        width: 80
    },
    {
        ...defaultColDef,
        field: "shiftStartTime",
        headerName: "Start Time",
        colId: "shiftStartTime",
        width: 120
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
        field: "startRestTime",
        headerName: "Start Rest Time",
        colId: "startRestTime",
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
        headerName: "Working Time",
        colId: "workingTime",
        width: 120
    },
    {
        ...defaultColDef,
        field: "restTime",
        headerName: "Rest Time",
        colId: "restTime",
        width: 120
    },
    {
        ...defaultColDef,
        field: "overTimeM",
        headerName: "Over Time (m)",
        colId: "overTimeM",
        width: 120
    },
    
];