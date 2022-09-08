import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Icon } from '@iconify/react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Card,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { useDemoData } from '@material-ui/x-grid-data-generator';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import { useEffect, useState } from 'react';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import {
  MdAddBox,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdChevronRight,
  MdFolder,
  MdFolderOpen,
  MdIndeterminateCheckBox,
  MdInsertDriveFile,
  MdKeyboardArrowDown
} from 'react-icons/md';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
import SearchPage from '../../../core/layout/SearchPage';
import { PATH_PAGES } from '../../../routes/paths';
import useLocales from "../../../hooks/useLocales";

// ----------------------------------------------------------------------
const nodes = [
  {
    value: 'ParentOne',
    label: 'ParentOne',
    children: [
      {
        value: 'SectionOneChild',
        label: 'SectionOneChild',
        children: [
          {
            value: 'SectionOneChil-of-Child-1',
            label: 'SectionOneChil-of-Child-1',
            children: [
              {
                value: 'SectionOneChil-of-Child-1-of-Child',
                label: 'SectionOneChil-of-Child-1-of-Child'
              }
            ]
          },
          {
            value: 'SectionOneChil-of-Child-2',
            label: 'SectionOneChil-of-Child-2'
          }
        ]
      },
      {
        value: 'SectionTwo',
        label: 'SectionTwo',
        children: [
          {
            value: 'SectionTwo-Child',
            label: 'SectionTwo-Child'
          }
        ]
      }
    ]
  },
  {
    value: 'ParentTwo',
    label: 'ParentTwo',
    children: [
      {
        value: 'ParentTwo-Child-1',
        label: 'ParentTwo-Child-1'
      },
      {
        value: 'ParentTwo-Child-2',
        label: 'ParentTwo-Child-2'
      }
    ]
  }
];
const ControlledTreeView = () => {
  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState([]);
  const icons = {
    check: <MdCheckBox className="rct-icon rct-icon-check" />,
    uncheck: <MdCheckBoxOutlineBlank className="rct-icon rct-icon-uncheck" />,
    halfCheck: <MdIndeterminateCheckBox className="rct-icon rct-icon-half-check" />,
    expandClose: <MdChevronRight className="rct-icon rct-icon-expand-close" />,
    expandOpen: <MdKeyboardArrowDown className="rct-icon rct-icon-expand-open" />,
    expandAll: <MdAddBox className="rct-icon rct-icon-expand-all" />,
    collapseAll: <MdIndeterminateCheckBox className="rct-icon rct-icon-collapse-all" />,
    parentClose: <MdFolder className="rct-icon rct-icon-parent-close" />,
    parentOpen: <MdFolderOpen className="rct-icon rct-icon-parent-open" />,
    leaf: <MdInsertDriveFile className="rct-icon rct-icon-leaf-close" />
  };
  const handleExpand = (expanded) => {
    setExpanded(expanded);
  };

  const handleSelect = (event) => {
    setSelected(event);
  };

  return (
    <CheckboxTree
      nodes={nodes}
      checked={selected}
      expanded={expanded}
      onCheck={handleSelect}
      onExpand={handleExpand}
      icons={icons}
      showNodeIcon={false}
    />
  );
};
const ACCORDIONS = [
  {
    value: `panel1`,
    heading: `Organization`,
    defaultExpanded: true,
    detail: <ControlledTreeView />
  },
  {
    value: `panel2`,
    heading: `Basic Search`,
    defaultExpanded: true,
    detail: (
      <>
        <ToggleButtonGroup sx={{ py: 0 }} value="general" exclusive aria-label="text alignment">
          <ToggleButton value="general" sx={{ p: 1, borderRadius: '0px' }}>
            TO End Time
          </ToggleButton>
          <ToggleButton value="compare" sx={{ p: 1, borderRadius: '0px' }}>
            FP Plan Date
          </ToggleButton>
        </ToggleButtonGroup>
        <TextField
          id="date"
          label={false}
          size="small"
          type="date"
          defaultValue="2017-05-24"
          InputLabelProps={{
            shrink: true
          }}
          sx={{ py: 1 }}
        />
        <TextField
          id="date2"
          label={false}
          size="small"
          type="date"
          defaultValue="2017-05-24"
          InputLabelProps={{
            shrink: true
          }}
          sx={{ py: 1 }}
        />
        <RadioGroup row aria-label="position" name="position" defaultValue="gr">
          <FormControlLabel value="gr" control={<Radio color="primary" />} label="GR" />
          <FormControlLabel value="gi" control={<Radio color="primary" />} label="GI" />
        </RadioGroup>
      </>
    )
  },
  {
    value: `panel3`,
    heading: `Detail`,
    defaultExpanded: true,
    detail: (
      <>
        <ToggleButtonGroup sx={{ py: 0 }} value="general" exclusive aria-label="text alignment">
          <ToggleButton value="general" sx={{ p: 1, borderRadius: '0px' }}>
            T/O
          </ToggleButton>
          <ToggleButton value="compare" sx={{ p: 1, borderRadius: '0px' }}>
            Main P/O
          </ToggleButton>
          <ToggleButton value="po" sx={{ p: 1, borderRadius: '0px' }}>
            P/O
          </ToggleButton>
        </ToggleButtonGroup>
        <TextField
          id="manuf"
          label="Manuf."
          size="small"
          InputLabelProps={{
            shrink: true
          }}
          sx={{ my: 3 }}
        />
        <TextField
          id="manuf2"
          label="Manuf."
          size="small"
          InputLabelProps={{
            shrink: true
          }}
          sx={{ py: 1 }}
        />
        <TextField
          id="manuf-process"
          label="Manuf. Process"
          size="small"
          InputLabelProps={{
            shrink: true
          }}
          sx={{ py: 1 }}
        />
        <TextField
          id="manuf"
          label="Manuf."
          size="small"
          InputLabelProps={{
            shrink: true
          }}
          sx={{ py: 1 }}
        />
        <TextField
          id="manuf2"
          label="Manuf."
          size="small"
          InputLabelProps={{
            shrink: true
          }}
          sx={{ py: 1 }}
        />
        <TextField
          id="manuf-process"
          label="Manuf. Process"
          size="small"
          InputLabelProps={{
            shrink: true
          }}
          sx={{ py: 1 }}
        />
      </>
    )
  }
];

const SearchConfig = () => {
  const [alignment, setAlignment] = useState('general');
  const { translate } = useLocales()

  const handleAlignment = (event, newAlignment) => {
    setAlignment(newAlignment);
  };
  return (
    <>
      <ToggleButtonGroup
        sx={{ py: 0 }}
        value={alignment}
        exclusive
        onChange={handleAlignment}
        aria-label="text alignment"
      >
        <ToggleButton value="general" disabled={alignment === 'general'} sx={{ p: 1, borderRadius: '0px' }}>
          {translate(`button.general`)}
        </ToggleButton>
        <ToggleButton value="compare" disabled={alignment === 'compare'} sx={{ p: 1, borderRadius: '0px' }}>
          {translate(`button.compare`)}
        </ToggleButton>
      </ToggleButtonGroup>
      {ACCORDIONS.map((accordion, index) => (
        <Accordion key={accordion.value} disabled={index === 3} defaultExpanded={accordion.defaultExpanded}>
          <AccordionSummary expandIcon={<Icon icon={arrowIosDownwardFill} width={20} height={20} />}>
            <Typography variant="subtitle1">{accordion.heading}</Typography>
          </AccordionSummary>
          <AccordionDetails>{accordion.detail}</AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

function loadServerRows(page, data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data.rows.slice(page * 25, (page + 1) * 25));
    }, Math.random() * 500 + 100); // simulate network latency
  });
}

const columnDefs = [
  {
    colId: 'day',
    field: 'date',
    headerName: 'Day',
    filter: 'agSetColumnFilter'
  },
  {
    colId: 'date',
    field: 'date',
    headerName: 'Date',
    filter: 'agSetColumnFilter'
  },
  {
    colId: 'mealTime',
    field: 'mealTime',
    headerName: 'Mealtime',
    filter: 'agSetColumnFilter'
  },
  {
    colId: 'food',
    field: 'food',
    headerName: 'What was easten?',
    filter: 'agSetColumnFilter',
    sortable: false
  },
  {
    colId: 'price',
    field: 'price',
    headerName: 'Price',
    filter: 'agSetColumnFilter'
  }
];
const rowData = [
  {
    date: new Date(Date.UTC(2020, 5, 0, 23, 0, 0)),
    mealTime: 'BREAKFAST',
    food: 'PORRIDGE',
    price: 2.56
  },
  {
    date: new Date(Date.UTC(2020, 5, 1, 23, 0, 0)),
    mealTime: 'LUNCH',
    food: 'OMLETTE',
    price: 5
  },
  {
    date: new Date(Date.UTC(2020, 5, 2, 23, 0, 0)),
    mealTime: 'DINNER',
    food: 'SANDWICH',
    price: 3.19
  },
  {
    date: new Date(Date.UTC(2020, 5, 3, 23, 0, 0)),
    mealTime: 'BREAKFAST',
    food: 'SOUP',
    price: 1.55
  },
  {
    date: new Date(Date.UTC(2020, 5, 4, 23, 0, 0)),
    mealTime: 'LUNCH',
    food: 'PROTEINSHAKE',
    price: 4.2
  },
  {
    date: new Date(Date.UTC(2020, 5, 5, 23, 0, 0)),
    mealTime: 'DINNER',
    food: 'CHOCOLATEBAR',
    price: 0.75
  },
  {
    date: new Date(Date.UTC(2020, 5, 6, 23, 0, 0)),
    mealTime: 'BREAKFAST',
    food: 'STEAK',
    price: 13.45
  },
  {
    date: new Date(Date.UTC(2020, 5, 7, 23, 0, 0)),
    mealTime: 'LUNCH',
    food: 'LAMBCHOPS',
    price: 18.3
  }
];

const DataConfig = () => {
  const pageSize = 3;
  const [gridApi, setGridApi] = useState(null);
  const { data } = useDemoData({
    dataSet: 'Commodity',
    rowLength: 1000,
    maxColumns: 6
  });
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  useEffect(() => {
    if (gridApi) {
      const dataSource = {
        getRows: (params) => {
          // Use startRow and endRow for sending pagination to Backend
          // params.startRow : Start Page
          // params.endRow : End Page

          const page = params.endRow / pageSize;
          fetch(`https://reqres.in/api/users?per_page=${pageSize}&page=${page}`)
            .then((resp) => resp.json())
            // .then((resp) => {
            //   console.log('resp', resp.json());
            // })
            .then((res) => {
              params.successCallback(res.data, res.total);
            })
            .catch((err) => {
              params.successCallback([], 0);
            });
        }
      };

      gridApi.setDatasource(dataSource);
    }
  }, [gridApi]);
  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      const newRows = await loadServerRows(page, data);

      if (!active) {
        return;
      }
      setRows(newRows);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [page, data]);

  const defaultColDef = {
    filter: true,
    flex: 1,
    sortable: true,
    minWidth: 100,
    resizable: true
  };

  const onRowSelected = (event) => {
    window.alert(`'row ${event.node.data.date} selected = ${event.node.isSelected()}`);
  };

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    window.alert(`selection changed, ${rowCount} rows selected`);
  };

  const avatarFormatter = ({ value }) => <img src={value} alt="avatar" width="50px" height="50px" />;

  return (
    <>
      <Card sx={{ p: 1, borderRadius: '0px', height: '10%' }}>
        <HeaderBreadcrumbs
          sx={{ mt: 1 }}
          heading="Department Management"
          links={[
            { name: 'Dashboard', href: PATH_PAGES.root },
            { name: 'User', href: PATH_PAGES.user.root },
            { name: 'List' }
          ]}
          action={
            <>
              <Button
                sx={{ marginRight: '5px' }}
                variant="contained"
                startIcon={<Icon icon={plusFill} width={20} height={20} />}
              >
                Add
              </Button>
              <Button
                sx={{ marginRight: '5px' }}
                variant="contained"
                startIcon={<Icon icon={plusFill} width={20} height={20} />}
              >
                Tabs
              </Button>
            </>
          }
        />
      </Card>
      <Card sx={{ p: 1, borderRadius: '0px', display: 'flex', height: '90%', minHeight: { xs: `calc(80vh - 100px)` } }}>
        <div className="ag-theme-balham" style={{ height: '100%', width: '49%' }}>
          <AgGridReact
            applyColumnDefOrder
            defaultColDef={defaultColDef}
            // rowData={rowData}
            // columnDefs={columnDefs}
            suppressRowClickSelection
            pagination
            rowModelType="infinite"
            paginationPageSize={pageSize}
            cacheBlockSize={pageSize}
            onGridReady={onGridReady}
          >
            <AgGridColumn field="first_name" headerName="First Name" cellClass="vertical-middle" />
            <AgGridColumn field="last_name" headerName="Last Name" cellClass="vertical-middle" />
            <AgGridColumn field="email" headerName="Email" cellClass="vertical-middle" />
            <AgGridColumn
              field="avatar"
              headerName="Avatar"
              cellRendererFramework={avatarFormatter}
              cellClass="vertical-middle"
            />
          </AgGridReact>
        </div>
        <div className="ag-theme-balham" style={{ height: '100%', width: '49%' }}>
          <AgGridReact
            applyColumnDefOrder
            defaultColDef={defaultColDef}
            rowData={rowData}
            suppressRowClickSelection
            rowSelection="single"
            onRowSelected={onRowSelected}
            onSelectionChanged={onSelectionChanged}
          >
            <AgGridColumn
              headerName="Day"
              field="date"
              headerCheckboxSelection
              headerCheckboxSelectionFilteredOnly
              checkboxSelection
            />
            <AgGridColumn field="date" headerName="Date" />
            <AgGridColumn field="mealTime" headerName="Date" minWidth={150} />
            <AgGridColumn field="food" headerName="Food" />
            <AgGridColumn field="price" headerName="Price" minWidth={150} />
          </AgGridReact>
        </div>
      </Card>
    </>
  );
};

export default function PermissionList() {
  return <SearchPage pageTitle="Permission List" searchConfig={<SearchConfig />} dataConfig={<DataConfig />} />;
}
