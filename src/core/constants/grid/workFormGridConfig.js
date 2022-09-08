
import { defaultColDef } from './defaultColDef';
import { defaultAuditFields } from './defaultAuditFields';



export const workFormGridConfig = [
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
        width: 140,
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "workFormNo",
        headerName: "Work Form No",
        colId: "workFormNo",
        width: 120,
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "workFormName",
        headerName: "Work Form Name",
        colId: "workFormName",
        width: 140,
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "shift.description",
        headerName: "Shift",
        colId: "shift.description",
        width: 70,
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "overTime",
        headerName: "Over Time (Y/N)",
        colId: "overTime",
        width: 120,
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
        width: 100
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
        tooltipField: 'registerBy',
        headerName: 'Registered By',
        cellClass: 'vertical-middle',
        colId: 'registerBy',
        width: 100
      },
      {
        ...defaultColDef,
        field: 'registerDay',
        tooltipField: 'registerDay',
        headerName: 'Registered Date',
        cellClass: 'vertical-middle',
        colId: 'registerDay',
        width: 120
      },
      {
        ...defaultColDef,
        field: 'updateBy',
        tooltipField: 'updateBy',
        headerName: 'Changed By',
        cellClass: 'vertical-middle',
        colId: 'updateBy',
        width: 100
      },
      {
        ...defaultColDef,
        field: 'updateDay',
        tooltipField: 'updateDay',
        headerName: 'Changed Date',
        cellClass: 'vertical-middle',
        colId: 'updateDay',
        width: 120
      }
];