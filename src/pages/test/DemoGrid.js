import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Container,
  DialogActions,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
  Switch
} from '@material-ui/core';
import ReactApexChart from 'apexcharts';

import { styled } from '@material-ui/styles';
import { Icon } from '@iconify/react';
import { isEmpty, isUndefined } from 'lodash-es';
import Highcharts from 'highcharts/highstock';
import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import { AgGridReact } from 'ag-grid-react';
import Page from '../../components/Page';
import GlobalChart from '../../components/GlobalChart';
import { Dropdown, DthButtonPermission, DthDatePicker } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
import OrganizationTree from '../../components/OrganizationTree';
import { useDispatch, useSelector } from '../../redux/store';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import useSettings from '../../hooks/useSettings';
import { numberWithCommas } from '../../utils/formatNumber';
import CustomEditorComponent from './CustomEditorComponent';
import { capitalizeFirstChar } from '../../utils/formatString';

const pageCode = 'demo';
const widgets = [
  {
    code: 'hierachyOnGrid',
    name: 'Hierachy On Grid'
  },
  {
    code: 'cellEditting',
    name: 'Cell Editting'
  }
  // {
  //   code: "productionAnalyst",
  //   name: "Production Analyst"
  // },
];

const CalendarCellRenderer = (props) => {
  const image = props.value === 'Male' ? 'male.png' : 'female.png';
  const imageSource = `https://www.ag-grid.com/example-assets/genders/${image}`;
  return (
    <span>
      <DthDatePicker value={props.value} sx={{ my: 1 }} fullWidth size="small" />
    </span>
  );
};

const cellCellEditorParams = (params) => {
  const selectedCountry = params.data.country;
  const allowedCities = countyToCityMap(selectedCountry);
  return {
    values: allowedCities,
    formatValue: (value) => `${value} (${selectedCountry})`
  };
};

const countyToCityMap = (match) => {
  const map = {
    Korea: ['Seoul', 'Suwon', 'Incheon'],
    Vietnam: ['Ho Chi Minh', 'Ha Noi', 'Da Nang', 'Can Tho']
  };
  return map[match];
};

const getData = () => [
  {
    name: 'Bob Harrison',
    gender: 'Male',
    address: '1197 Thunder Wagon Common, Cataract, RI, 02987-1016, US, (401) 747-0763',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Mary Wilson',
    gender: 'Female',
    age: 11,
    address: '3685 Rocky Glade, Showtucket, NU, X1E-9I0, CA, (867) 371-4215',
    city: 'Ho Chi Minh',
    country: 'Vietnam',
    dateOfBirth: ''
  },
  {
    name: 'Zahid Khan',
    gender: 'Male',
    age: 12,
    address: '3235 High Forest, Glen Campbell, MS, 39035-6845, US, (601) 638-8186',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Jerry Mane',
    gender: 'Male',
    age: 12,
    address: '2234 Sleepy Pony Mall , Drain, DC, 20078-4243, US, (202) 948-3634',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Bob Harrison',
    gender: 'Male',
    address: '1197 Thunder Wagon Common, Cataract, RI, 02987-1016, US, (401) 747-0763',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Mary Wilson',
    gender: 'Female',
    age: 11,
    address: '3685 Rocky Glade, Showtucket, NU, X1E-9I0, CA, (867) 371-4215',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Zahid Khan',
    gender: 'Male',
    age: 12,
    address: '3235 High Forest, Glen Campbell, MS, 39035-6845, US, (601) 638-8186',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Jerry Mane',
    gender: 'Male',
    age: 12,
    address: '2234 Sleepy Pony Mall , Drain, DC, 20078-4243, US, (202) 948-3634',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Bob Harrison',
    gender: 'Male',
    address: '1197 Thunder Wagon Common, Cataract, RI, 02987-1016, US, (401) 747-0763',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Mary Wilson',
    gender: 'Female',
    age: 11,
    address: '3685 Rocky Glade, Showtucket, NU, X1E-9I0, CA, (867) 371-4215',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Zahid Khan',
    gender: 'Male',
    age: 12,
    address: '3235 High Forest, Glen Campbell, MS, 39035-6845, US, (601) 638-8186',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Jerry Mane',
    gender: 'Male',
    age: 12,
    address: '2234 Sleepy Pony Mall , Drain, DC, 20078-4243, US, (202) 948-3634',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Bob Harrison',
    gender: 'Male',
    address: '1197 Thunder Wagon Common, Cataract, RI, 02987-1016, US, (401) 747-0763',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Mary Wilson',
    gender: 'Female',
    age: 11,
    address: '3685 Rocky Glade, Showtucket, NU, X1E-9I0, CA, (867) 371-4215',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Zahid Khan',
    gender: 'Male',
    age: 12,
    address: '3235 High Forest, Glen Campbell, MS, 39035-6845, US, (601) 638-8186',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Jerry Mane',
    gender: 'Male',
    age: 12,
    address: '2234 Sleepy Pony Mall , Drain, DC, 20078-4243, US, (202) 948-3634',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Bob Harrison',
    gender: 'Male',
    address: '1197 Thunder Wagon Common, Cataract, RI, 02987-1016, US, (401) 747-0763',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Mary Wilson',
    gender: 'Female',
    age: 11,
    address: '3685 Rocky Glade, Showtucket, NU, X1E-9I0, CA, (867) 371-4215',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Zahid Khan',
    gender: 'Male',
    age: 12,
    address: '3235 High Forest, Glen Campbell, MS, 39035-6845, US, (601) 638-8186',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Jerry Mane',
    gender: 'Male',
    age: 12,
    address: '2234 Sleepy Pony Mall , Drain, DC, 20078-4243, US, (202) 948-3634',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Bob Harrison',
    gender: 'Male',
    address: '1197 Thunder Wagon Common, Cataract, RI, 02987-1016, US, (401) 747-0763',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Mary Wilson',
    gender: 'Female',
    age: 11,
    address: '3685 Rocky Glade, Showtucket, NU, X1E-9I0, CA, (867) 371-4215',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Zahid Khan',
    gender: 'Male',
    age: 12,
    address: '3235 High Forest, Glen Campbell, MS, 39035-6845, US, (601) 638-8186',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  },
  {
    name: 'Jerry Mane',
    gender: 'Male',
    age: 12,
    address: '2234 Sleepy Pony Mall , Drain, DC, 20078-4243, US, (202) 948-3634',
    city: 'Seoul',
    country: 'Korea',
    dateOfBirth: ''
  }
];

const ContainerChart = styled(Container)({
  width: '100%',
  height: '100%',
  border: '2px solid #00AB55',
  maxWidth: 'none',
  padding: 0,
  margin: 0
});

export default function DemoGrid() {
  const dispatch = useDispatch();
  const { translate } = useLocales();
  const { themeAgGridClass } = useSettings();
  const [selectedWidget, setSelectedWidget] = useState({
    widgetCode: widgets[0].code,
    widgetName: widgets[0].name
  });
  const {
    user,
    commonDropdown: { treeNodes }
  } = useAuth();
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const pageSelectedWidget = selectedWidget[pageCode];
  console.log('treeNodes', treeNodes);
  const [rowData, setRowData] = useState([]);
  const [rowDataUser, setRowDataUser] = useState(getData());
  const [columnDefs, setColumnDefs] = useState([
    // we're using the auto group column by default!
    {
      field: 'level'
    },
    {
      field: 'plan',
      cellClass: 'vertical-middle ag-right-aligned-cell',
      valueGetter: (params) => numberWithCommas(params.data.plan)
    },
    {
      field: 'actual',
      cellClass: 'vertical-middle ag-right-aligned-cell',
      valueGetter: (params) => numberWithCommas(params.data.actual)
    },
    {
      field: 'diff',
      cellClass: 'vertical-middle ag-right-aligned-cell color-red',
      valueGetter: (params) => `(${numberWithCommas(params.data.diff)})`
    }
  ]);

  const [columnUserDefs, setColumnUserDefs] = useState([
    { field: 'name' },
    {
      field: 'gender',
      cellEditor: 'agRichSelectCellEditor',
      cellEditorPopup: true,
      cellEditorParams: {
        values: ['Male', 'Female'],
        cellEditorPopup: true
      }
    },
    {
      field: 'dateOfBirth',
      cellEditor: 'customEditor'
    },
    {
      field: 'country',
      cellEditor: 'agRichSelectCellEditor',
      cellEditorPopup: true,
      cellEditorParams: {
        values: ['Korea', 'Vietnam']
      }
    },
    {
      field: 'city',
      cellEditor: 'agRichSelectCellEditor',
      cellEditorPopup: true,
      cellEditorParams: cellCellEditorParams
    },
    {
      field: 'address',
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true,
      minWidth: 550
    }
  ]);
  const defaultColUserDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 130,
      editable: true,
      resizable: true
    }),
    []
  );

  const onCellValueChanged = useCallback((params) => {
    const colId = params.column.getId();
    if (colId === 'country') {
      const selectedCountry = params.data.country;
      const selectedCity = params.data.city;
      const allowedCities = countyToCityMap(selectedCountry);
      const cityMismatch = allowedCities.indexOf(selectedCity) < 0;
      if (cityMismatch) {
        params.node.setDataValue('city', null);
      }
    }
  }, []);

  useEffect(() => {
    const _rowData = [];
    const treeLoop = (nodes, _rowData, currentNodes) => {
      nodes.forEach((node) => {
        const _currentNodes = [...currentNodes];
        if (!node.value.includes('process')) {
          _currentNodes.push(node.label);
          const level = capitalizeFirstChar(node.value.split('_')[0]);
          _rowData.push({
            orgHierarchy: _currentNodes,
            plan: node.plan ? node.plan : 0,
            actual: node.actual ? node.actual : 0,
            diff: node.diff ? node.diff : 0,
            level
          });
          if (!isEmpty(node.children)) {
            treeLoop(node.children, _rowData, _currentNodes);
          }
        }
      });
    };
    treeNodes.forEach((node) => {
      const currentNodes = [node.label];
      const level = capitalizeFirstChar(node.value.split('_')[0]);
      _rowData.push({
        orgHierarchy: [node.label],
        plan: node.plan ? node.plan : 0,
        actual: node.actual ? node.actual : 0,
        diff: node.diff ? node.diff : 0,
        level
      });
      if (!isEmpty(node.children)) {
        treeLoop(node.children, _rowData, currentNodes);
      }
    });
    setRowData(_rowData);
  }, [treeNodes]);

  const defaultColDef = useMemo(
    () => ({
      flex: 1
    }),
    []
  );

  const autoGroupColumnDef = useMemo(
    () => ({
      headerName: 'Organization Hierarchy',
      cellRendererParams: {
        suppressCount: true
      }
    }),
    []
  );

  const getDataPath = useMemo(() => (data) => data.orgHierarchy, []);

  const handleParseSelectedTree = (selected) => {
    setParseSelectedTree(selected);
  };

  const onClickWidget = (widgetCode, widgetName) => {
    setSelectedWidget({
      widgetCode,
      widgetName
    });
  };

  const ACCORDIONS = [
    {
      value: `panel1`,
      heading: `Organization`,
      defaultExpanded: true,
      detail: <OrganizationTree renderAll parseSelected={handleParseSelectedTree} />,
      maxHeight: '35vh'
    },
    {
      value: `panel2`,
      heading: `Widget`,
      defaultExpanded: true,
      detail: (
        <List>
          {widgets.map((element) => {
            const isActive = selectedWidget?.widgetCode === element.code;
            return (
              <ListItem key={element.code}>
                <ListItemButton
                  sx={{
                    px: 1,
                    height: 48,
                    typography: 'body2',
                    color: 'text.secondary',
                    textTransform: 'capitalize',
                    ...(isActive && {
                      color: 'text.primary',
                      fontWeight: 'fontWeightMedium',
                      bgcolor: 'action.selected'
                    })
                  }}
                  onClick={() => onClickWidget(element.code, element.name)}
                >
                  <ListItemText primary={element.name} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )
    }
  ];

  const onInquiry = () => {
    console.log('onInquiry');
  };

  const frameworkComponents = {
    customEditor: CustomEditorComponent
  };

  //   const options = {
  //     chart: {
  //       height: 350,
  //       type: 'scatter',
  //       zoom: {
  //         type: 'xy'
  //       }
  //     },
  //     dataLabels: {
  //       enabled: false
  //     },
  //     grid: {
  //       xaxis: {
  //         lines: {
  //           show: true
  //         }
  //       },
  //       yaxis: {
  //         lines: {
  //           show: true
  //         }
  //       },
  //     },
  //     xaxis: {
  //       type: 'datetime',
  //     },
  //     yaxis: {
  //       max: 70
  //     }
  //   };

  //   const series = [{
  //     name: 'TEAM 1',
  //     data: generateDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 20, {
  //       min: 10,
  //       max: 60
  //     })
  //   },
  //   {
  //     name: 'TEAM 2',
  //     data: generateDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 20, {
  //       min: 10,
  //       max: 60
  //     })
  //   },
  //   {
  //     name: 'TEAM 3',
  //     data: generateDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 30, {
  //       min: 10,
  //       max: 60
  //     })
  //   },
  //   {
  //     name: 'TEAM 4',
  //     data: generateDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 10, {
  //       min: 10,
  //       max: 60
  //     })
  //   },
  //   {
  //     name: 'TEAM 5',
  //     data: generateDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 30, {
  //       min: 10,
  //       max: 60
  //     })
  //   },
  // ];

  return (
    <Page title="Demo | Điện Quang">
      <Container sx={{ px: `0px !important` }} maxWidth={false}>
        <Grid container spacing={0} sx={{ px: 0, height: `calc(100vh - 154px)` }}>
          <Grid item xs={12} md={2}>
            <Card sx={{ py: 1, px: 1, borderRadius: '0px', height: { md: `calc(100vh - 190px)` }, overflow: 'auto' }}>
              <Box sx={{ mb: 5 }}>
                {ACCORDIONS.map((accordion, index) => (
                  <Accordion
                    key={accordion.value}
                    defaultExpanded={accordion.defaultExpanded}
                    sx={{
                      ...(accordion.maxHeight && {
                        maxHeight: accordion.maxHeight,
                        overflowY: 'auto'
                      })
                    }}
                  >
                    <AccordionSummary expandIcon={<Icon icon={arrowIosDownwardFill} width={20} height={20} />}>
                      <Typography variant="subtitle1">{accordion.heading}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>{accordion.detail}</AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </Card>
            <Card sx={{ p: 0, height: '36px', borderRadius: '0px' }}>
              <Button onClick={() => onInquiry()} variant="contained" sx={{ width: '100%', height: '100%' }}>
                {translate(`button.inquiry`)}
              </Button>
            </Card>
          </Grid>
          <Grid item xs={12} md={10}>
            <>
              <Grid container spacing={0} sx={{ px: 0, height: `calc(100vh - 154px)` }}>
                <Grid item xs={12} md={12}>
                  <Card
                    sx={{
                      p: 1,
                      borderRadius: '0px',
                      display: 'row',
                      height: '100%',
                      minHeight: { xs: `calc((80vh - 100px))` }
                    }}
                  >
                    <div className={themeAgGridClass} style={{ height: '100%', width: '100%' }}>
                      {selectedWidget?.widgetCode === 'hierachyOnGrid' && (
                        <AgGridReact
                          rowData={rowData}
                          columnDefs={columnDefs}
                          defaultColDef={defaultColDef}
                          autoGroupColumnDef={autoGroupColumnDef}
                          treeData
                          animateRows
                          groupDefaultExpanded={-1}
                          getDataPath={getDataPath}
                        />
                      )}
                      {selectedWidget?.widgetCode === 'cellEditting' && (
                        <AgGridReact
                          frameworkComponents={frameworkComponents}
                          rowData={rowDataUser}
                          columnDefs={columnUserDefs}
                          defaultColDef={defaultColUserDef}
                          onCellValueChanged={onCellValueChanged}
                        />
                      )}
                      {/* {
                        selectedWidget?.widgetCode === 'productionAnalyst' && (

                          <ContainerChart>
                            <ReactApexChart options={options} series={series} type="scatter" height={350} />
                          </ContainerChart>
                        )
                      } */}
                    </div>
                  </Card>
                </Grid>
              </Grid>
            </>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
