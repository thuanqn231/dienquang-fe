// material
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { styled } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/styles';
import { isEmpty, isUndefined } from 'lodash';

import {
  Tooltip,
  Paper,
  Table,
  TableBody,
  Box,
  TableContainer,
  TableHead,
  TableRow,
  Container,
  Grid,
  Card
} from '@material-ui/core';
import MuiTableCell from '@material-ui/core/TableCell';
import Highcharts from 'highcharts';
import Highchart3D from 'highcharts/highcharts-3d';
import HighchartCylinder from 'highcharts/modules/cylinder';
import GlobalChart from '../../components/GlobalChart';
import FmbNavbar from '../../layouts/fmb/FmbNavbar';
import useLocales from '../../hooks/useLocales';
import { useSelector } from '../../redux/store';
import useAuth from '../../hooks/useAuth';
// components
import Page from '../../components/Page';
import LoadingScreen from '../../components/LoadingScreen';
import {
  // columnsProductionStatus as columns,
  generateData,
  generateDiff,
  generateDiffClass,
  generateEff,
  generateEffClass,
  generateLineClassByEff,
  generateTooltip,
  getCursor,
  getLineStatus,
  isNumeric,
  numberWithCommas
} from './helper';
//
// ----------------------------------------------------------------------

Highchart3D(Highcharts);
HighchartCylinder(Highcharts);

const RootStyle = styled(Page)(({ theme }) => ({
  minHeight: '100%'
}));

const TableCell = withStyles((theme) => ({
  root: {
    height: `calc((100vh - 64px)/5)`,
    backgroundImage: 'none',
    padding: theme.spacing(1),
    // borderCollapse: 'collapse',
    border: '1px solid black',
    borderSpacing: 0,
    '&.header': {
      backgroundColor: '#565656',
      color: theme.palette.common.white,
      fontSize: '2.2rem'
    },
    '&.body': {
      backgroundColor: '	#FFFAFA',
      color: theme.palette.common.black,
      fontSize: '6rem',
      fontWeight: 'bold'
    },
    '&.bodyLeft': {
      color: theme.palette.common.white,
      fontSize: '6rem',
      fontWeight: 'bold'
    },
    '&:first-of-type': {
      paddingLeft: theme.spacing(1),
      boxShadow: 'none'
    },
    '&:last-of-type': {
      paddingRight: theme.spacing(1),
      boxShadow: 'none',
      marginBottom: '0px'
    },
    '&.greenBg': {
      backgroundColor: '#098d41'
    },
    '&.redBg': {
      backgroundColor: '#ff3939'
    },
    '&.greenColor': {
      color: '#4dff4d'
    },
    '&.redColor': {
      color: '#ff1a1a'
    },
    '&.blueColor': {
      color: '#4eadff'
    },
    '&.blueBg': {
      backgroundColor: '#002d54'
    }
  }
}))(MuiTableCell);

// ----------------------------------------------------------------------

function createData(headerName, value) {
  return { headerName, value };
}

let rows = [
  createData('Plan', 1200),
  // createData('Taget', 400),
  createData('Actual', 450),
  createData('GAP', 50),
  createData('Model', 'T4459C'),
  createData('Defect', '6(1.5%)')
];

const columns = [
  { id: 'headerName', minWidth: 100, align: 'center' },
  {
    id: 'value',
    minWidth: 100,
    align: 'right',
    cellStyle: (e, rowData) => {
      if (!rowData.first_login) {
        return { color: 'red' };
      }
    }
  }
  // {
  //     id: 'density',
  //     label: 'Density',
  //     minWidth: 170,
  //     align: 'right',
  //     format: (value) => value.toFixed(2),
  // },
];
// const colors = ['#a8d18d', '#f4b184', '#4473c5', '#E80C7A', '#E80C7A'];
const colors = ['#a8d18d', '#4473c5', '#E80C7A', '#E80C7A'];
export default function LineStatus() {
  const { commonDropdown } = useAuth();
  const currentIntervalID = useRef(null);
  const [isLoading, setLoading] = useState(false);
  const { factoryCode } = useParams();

  const [rowDatas, setRowDatas] = useState({
    modelCode: '-',
    planQty: '0',
    targetQty: '0',
    gapQty: '0',
    actualQty: '0',
    defectQty: '0'
  });
  const [chart, setChart] = useState([]);
  const [lineName, setLineName] = useState([]);
  const {
    fmb: { hideMenu }
  } = useSelector((state) => state.page);
  const {
    lineStatus: { prodDate }
  } = useSelector((state) => state.fmb);
  const { translate } = useLocales();

  useEffect(() => {
    onLoadData();
    clearInterval(currentIntervalID.current);
    currentIntervalID.current = setInterval(() => {
      onLoadData();
    }, 60000);

    return () => {
      clearInterval(currentIntervalID.current);
    };
  }, [prodDate]);

  useEffect(async () => {
    dataChart();
    let defectDisplay = '0(0%)';
    if (rowDatas.defectQty > 0 && rowDatas.actualQty > 0) {
      defectDisplay = `${rowDatas.defectQty}(${((rowDatas.defectQty / rowDatas.actualQty) * 100).toFixed(1)}%)`;
    }
    rows = [
      createData('Plan', numberWithCommas(generateData(rowDatas.planQty))),
      // createData('Taget', numberWithCommas(rowDatas.targetQty)),
      createData('Actual', numberWithCommas(rowDatas.actualQty)),
      createData('GAP', numberWithCommas(rowDatas.gapQty)),
      createData('Model', generateData(rowDatas.modelCode)),
      createData('Defect', defectDisplay)
    ];
    setLoading(false);
  }, [rowDatas]);

  const dataChart = () => {
    console.log('rowDatas', rowDatas, rowDatas.planQty);
    const planQty = parseFloat(rowDatas.planQty, 10);
    const targetQty = parseInt(rowDatas.targetQty, 10);
    const actualQty = parseInt(rowDatas.actualQty, 10);
    console.log('rowDatas', rowDatas, planQty, targetQty, actualQty);
    const options = {
      credits: false,
      chart: {
        type: 'cylinder',
        options3d: {
          enabled: true,
          alpha: 25,
          beta: 0,
          depth: 0,
          viewDistance: 95
        }
      },
      title: {
        text: null
      },
      plotOptions: {
        series: {
          depth: 195,
          colorByPoint: true,
          dataLabels: {
            enabled: true,
            align: 'center',
            // color: '#294469',
            color: 'black',
            shadow: false,
            y: -20,

            style: { fontSize: '3rem', textShadow: '0px', fontWeight: 'bold' }
          }
        }
      },
      colors,
      xAxis: {
        gridLineWidth: 0,
        minorGridLineWidth: 0,
        // categories: ['Plan', 'Target', 'Actual'],
        categories: ['Plan', 'Actual'],
        labels: {
          skew3d: true,
          y: 90,
          style: {
            fontSize: '3rem',
            color: 'black',
            fontWeight: 'bold'
          }
        }
      },

      yAxis: {
        visible: false
      },
      series: [
        {
          data: [planQty, actualQty],
          name: '',
          showInLegend: false
        }
      ]
    };
    setChart(options);
  };
  const onLoadData = async () => {
    const url = window.location.href;
    const paramUrl = url.split('/');
    paramUrl.reverse();
    console.log('url', paramUrl);
    let lineCode = '';
    if (paramUrl.length > 5) {
      // eslint-disable-next-line prefer-destructuring
      lineCode = paramUrl[0];
    }

    console.log('lineName', commonDropdown, commonDropdown.lineDropdown);
    const lineName = commonDropdown.lineDropdown.find((line) => line.code === lineCode).label;
    if (lineName !== null) {
      setLoading(true);
    }
    setLineName(lineName);
    const response = await getLineStatus(prodDate, factoryCode, lineCode);
    let rowData = [];
    if (response?.data && !isEmpty(response?.data)) {
      const { data } = response;
      let planQty = 0;
      let targetQty = 0;
      let actualQty = 0;
      let gapQty = 0;
      let defectQty = 0;
      rowData = data.map((row) => {
        planQty = row.planQty ? row.planQty : 0;
        targetQty = row.targetQty ? row.targetQty : 0;
        actualQty = row.actualQty ? row.actualQty : 0;
        defectQty = row.defectQty ? row.defectQty : 0;
        // gapQty = actualQty - targetQty;
        gapQty = planQty - actualQty;
        return {
          modelCode: row.modelCode,
          planQty: row.planQty,
          targetQty,
          gapQty,
          actualQty,
          defectQty
        };
      });
    }
    console.log('rows', rowData[0]);
    setRowDatas(rowData[0]);
  };
  return (
    <RootStyle title="Line Status | Điện Quang">
      <FmbNavbar page="lineStatus" title={`${lineName}  ${translate(`fmb.line_status`)}`} />
      <Paper sx={{ width: '100%', height: `calc(100vh - 60px - ${hideMenu ? 0 : 36}px)` }}>
        <Container sx={{ px: `0px !important` }} maxWidth={false}>
          <Box border="1px black solid">
            <Grid container spacing={0} sx={{ px: 0, height: `calc(100vh - 64px)` }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', backgroundColor: 'black' }}>
                  {' '}
                  {/* khi chỉnh màu  */}
                  <TableContainer sx={{ height: '`calc(100vh - 64px)`' }}>
                    <Table stickyHeader aria-label="sticky table">
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow hover role="checkbox" tabIndex={-1} key={row.model}>
                            {columns.map((column) => {
                              const value = row[column.id];
                              if (column.id === 'headerName') {
                                return (
                                  <Tooltip title={value}>
                                    <TableCell key={column.id} align={column.align} className="body blueBg bodyLeft">
                                      {value}
                                    </TableCell>
                                  </Tooltip>
                                );
                              }
                              let gapClass;
                              if (row.headerName === 'GAP') {
                                if (value < 0) {
                                  gapClass = 'redColor';
                                } else {
                                  gapClass = 'greenColor';
                                }
                              }
                              return (
                                <Tooltip title={value}>
                                  <TableCell
                                    key={column.id}
                                    align={column.align}
                                    className={`body ${gapClass} ${row.headerName === 'Defect' && 'redColor'}`}
                                  >
                                    {value}
                                  </TableCell>
                                </Tooltip>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <GlobalChart
                    highcharts={Highcharts}
                    options={chart}
                    containerProps={{ style: { height: '100%', fontSize: '6rem' } }}
                  />
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Paper>
    </RootStyle>
  );
}
