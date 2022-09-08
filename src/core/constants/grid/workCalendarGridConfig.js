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


export const workCalendarGridConfig = [
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
        suppressMovable: true,
        field: "group",
        headerName: "Work Group",
        colId: "group",
        width: 120,
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
    {
        ...defaultColDef,
        field: 'registerBy',
        tooltipField: 'usrLogI',
        headerName: 'Registered By',
        cellClass: 'vertical-middle',
        colId: 'registerBy',
        width: 100
      },
      {
        ...defaultColDef,
        field: 'registerDay',
        tooltipField: 'dteLogI',
        headerName: 'Registered Date',
        cellClass: 'vertical-middle',
        colId: 'registerDay',
        width: 120
      },
      {
        ...defaultColDef,
        field: 'updateBy',
        tooltipField: 'usrLogU',
        headerName: 'Changed By',
        cellClass: 'vertical-middle',
        colId: 'updateBy',
        width: 100
      },
      {
        ...defaultColDef,
        field: 'updateDay',
        tooltipField: 'dteLogU',
        headerName: 'Changed Date',
        cellClass: 'vertical-middle',
        colId: 'updateDay',
        width: 120
      }
];