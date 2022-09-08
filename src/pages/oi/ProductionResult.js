import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
// material
import { styled } from '@material-ui/core/styles';
import { withStyles, makeStyles, createStyles } from '@material-ui/styles';
import {
  Tooltip,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Grid,
  Stack,
  Card,
  Box
} from '@material-ui/core';
import MuiTableCell from '@material-ui/core/TableCell';
import clsx from 'clsx';
// components
import Page from '../../components/Page';
import useLocales from '../../hooks/useLocales';
//
// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  minHeight: '100%'
}));

const TableCellCount = withStyles((theme) => ({
  root: {
    backgroundImage: 'none',
    height: `calc((100vh - 80px)/8)`,
    padding: theme.spacing(1),
    border: `1px solid rgba(224, 224, 224, 1)`,
    borderCollapse: 'collapse',
    borderSpacing: 0,
    '&.header': {
      backgroundColor: '#1782a7',
      color: theme.palette.common.white,
      fontSize: '1.9rem'
    },
    '&.body': {
      backgroundColor: '#82afbf',
      color: theme.palette.common.black,
      fontSize: '2rem'
    },
    '&:first-of-type': {
      paddingLeft: theme.spacing(1),
      boxShadow: 'none'
    },
    '&:last-of-type': {
      paddingRight: theme.spacing(1),
      boxShadow: 'none'
    },
    '&.greenBg': {
      backgroundColor: '#098d41'
    },
    '&.redBg': {
      backgroundColor: '#ff1a1a'
    },
    '&.greenColor': {
      color: '#4dff4d'
    },
    '&.redColor': {
      color: '#ff1a1a'
    },
    '&.blueColor': {
      color: '#4eadff'
    }
  }
}))(MuiTableCell);

const TableCellProd = withStyles((theme) => ({
  root: {
    backgroundImage: 'none',
    height: `calc((100vh - 80px)/14)`,
    padding: theme.spacing(1),
    border: `1px solid rgba(224, 224, 224, 1)`,
    borderCollapse: 'collapse',
    borderSpacing: 0,
    '&.header': {
      backgroundColor: '#1782a7',
      color: theme.palette.common.white,
      fontSize: '1.7rem'
    },
    '&.body': {
      backgroundColor: '#82afbf',
      color: theme.palette.common.black,
      fontSize: '1.5rem'
    },
    '&:first-of-type': {
      paddingLeft: theme.spacing(1),
      boxShadow: 'none'
    },
    '&:last-of-type': {
      paddingRight: theme.spacing(1),
      boxShadow: 'none'
    },
    '&.greenBg': {
      backgroundColor: '#098d41'
    },
    '&.redBg': {
      backgroundColor: '#ff1a1a'
    },
    '&.greyBg': {
      backgroundColor: '#ebebeb'
    },
    '&.greenColor': {
      color: '#4dff4d'
    },
    '&.redColor': {
      color: '#ff1a1a'
    },
    '&.blueColor': {
      color: '#4eadff'
    }
  }
}))(MuiTableCell);

const useStyles = makeStyles((theme) =>
  createStyles({
    yellowBg: {
      backgroundColor: '#ffff00'
    },
    greenBg: {
      animation: `$greenBgEffect 4000ms linear infinite`
    },
    greyBg: {
      backgroundColor: '#ebebeb'
    },
    redBg: {
      animation: `$redBgEffect 4000ms linear infinite`
    },
    '@keyframes greenBgEffect': {
      '0%': {
        backgroundColor: '#098d41',
        color: 'white'
      },
      '25%': {
        backgroundColor: '#ffe6e6',
        color: '#a1a5a9'
      },
      '50%': {
        backgroundColor: '#098d41',
        color: 'white'
      },
      '75%': {
        backgroundColor: '#ffe6e6',
        color: '#a1a5a9'
      },
      '100%': {
        backgroundColor: '#098d41',
        color: 'white'
      }
    },
    '@keyframes redBgEffect': {
      '0%': {
        backgroundColor: '#ff1a1a',
        color: 'white'
      },
      '25%': {
        backgroundColor: '#ffe6e6',
        color: '#a1a5a9'
      },
      '50%': {
        backgroundColor: '#ff1a1a',
        color: 'white'
      },
      '75%': {
        backgroundColor: '#ffe6e6',
        color: '#a1a5a9'
      },
      '100%': {
        backgroundColor: '#ff1a1a',
        color: 'white'
      }
    },
    blueBg: {
      backgroundColor: '#1782a7'
    },
    rootCard: {
      padding: theme.spacing(3, 2),
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  })
);

const columnsWorkInstruction = [
  { id: 'lineNo', align: 'center', label: 'No' },
  { id: 'unitId', minWidth: 100, align: 'center', label: 'Unit ID' },
  { id: 'item', minWidth: 100, align: 'center', label: 'Item' },
  { id: 'targetItem', minWidth: 100, align: 'center', label: 'Target Item' },
  { id: 'scanSerial', minWidth: 100, align: 'center', label: 'Scan Serial' },
  { id: 'qty', minWidth: 100, align: 'right', label: 'Qty' },
  { id: 'status', minWidth: 100, align: 'center', label: 'Status' }
];

function createDataWorkInstruction(lineNo, unitId, item, targetItem, scanSerial, qty, status, className) {
  return { lineNo, unitId, item, targetItem, scanSerial, qty, status, className };
}

const rowsWorkInstruction = [
  createDataWorkInstruction('1', '01', 'ROTOR', 'ROTOR1', 'VN01DONGJINROTOR2GHN0001', 1, 'OK', 'greenBg'),
  createDataWorkInstruction('2', '02', 'STARTOR', 'ROTOR1', 'VN01DONGJINROTOR2GHN0001', 1, 'OK', 'redBg'),
  createDataWorkInstruction('3', '03', 'ROTOR', 'ROTOR1', 'VN01DONGJINROTOR2GHN0001', 1, 'OK', 'greyBg')
];

const columnsProd = [
  { id: 'poNumber', align: 'center', label: 'PO Number' },
  { id: 'modelCode', minWidth: 100, align: 'center', label: 'Model Code' },
  { id: 'planQty', minWidth: 100, align: 'right', label: 'Plan Qty' },
  { id: 'actualQty', minWidth: 100, align: 'right', label: 'Actual Qty' }
];

function createDatacolumnsProd(lineNo, poNumber, modelCode, planQty, actualQty, className) {
  return { lineNo, poNumber, modelCode, planQty, actualQty, className };
}

const rowsProd = [
  createDatacolumnsProd('1', '0100101011', 'MOTOR-1', 500, 500, 'greyBg'),
  createDatacolumnsProd('2', '0100101012', 'MOTOR-2', 300, 2, 'greyBg'),
  createDatacolumnsProd('3', '0100101013', 'ROTOR-1', 300, 0, 'greyBg'),
  createDatacolumnsProd('4', '0100101014', 'ROTOR-2', numberWithCommas(1000), 0, 'greyBg'),
  createDatacolumnsProd('5', '0100101015', 'ASSEM-1', numberWithCommas(3000), 0, 'greyBg'),
  createDatacolumnsProd('6', '0100101016', 'ASSEM-2', numberWithCommas(1000), 0, 'greyBg')
];

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ----------------------------------------------------------------------

export default function ProductionResult() {
  const classes = useStyles();
  const { translate } = useLocales();
  return (
    <RootStyle title="Production Result | Điện Quang">
      <Paper sx={{ width: '100%', height: `calc((100vh - 60px)/2)` }}>
        <Grid container spacing={1} sx={{ height: '100%' }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <TableContainer sx={{ height: '100%' }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {columnsProd.map((column) => (
                        <Tooltip title={column.label}>
                          <TableCellProd key={column.id} align="center" className="header">
                            {column.label}
                          </TableCellProd>
                        </Tooltip>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rowsProd.map((row) => (
                      <TableRow hover role="checkbox" tabIndex={-1} key={row.lineNo}>
                        {columnsProd.map((column) => {
                          const value = row[column.id];
                          return (
                            <Tooltip title={value}>
                              <TableCellProd key={column.id} align={column.align} className={`body ${row.className}`}>
                                {value}
                              </TableCellProd>
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
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <TableContainer sx={{ height: '100%' }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCellCount align="center" key="poNo" className="header">
                        PO NO
                      </TableCellCount>
                      <TableCellCount align="center" key="modelCode" className="header">
                        Model Code
                      </TableCellCount>
                      <TableCellCount align="center" key="tactTime" className="header">
                        T/T(s)
                      </TableCellCount>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow hover role="checkbox" tabIndex={-1} key="po">
                      <Tooltip title="0100101012">
                        <TableCellCount key="poNo" align="center" className="body">
                          0100101012234
                        </TableCellCount>
                      </Tooltip>
                      <Tooltip title="MOTOR-2">
                        <TableCellCount key="modelCode" align="center" className="body">
                          MOTOR-2
                        </TableCellCount>
                      </Tooltip>
                      <Tooltip title="50">
                        <TableCellCount key="tactTime" align="center" className="body">
                          50
                        </TableCellCount>
                      </Tooltip>
                    </TableRow>
                  </TableBody>
                  <TableHead>
                    <TableRow>
                      <TableCellCount align="center" key="poNo" className="header">
                        Plan Qty
                      </TableCellCount>
                      <TableCellCount align="center" key="modelCode" className="header">
                        Target Qty
                      </TableCellCount>
                      <TableCellCount align="center" key="tactTime" className="header">
                        Actual Qty
                      </TableCellCount>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow hover role="checkbox" tabIndex={-1} key="po">
                      <Tooltip title="0100101012">
                        <TableCellCount key="poNo" align="center" className="body">
                          300
                        </TableCellCount>
                      </Tooltip>
                      <Tooltip title="MOTOR-2">
                        <TableCellCount key="modelCode" align="center" className="body">
                          6
                        </TableCellCount>
                      </Tooltip>
                      <Tooltip title="50">
                        <TableCellCount key="tactTime" align="center" className="body">
                          2
                        </TableCellCount>
                      </Tooltip>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '80%' }}>
              <Grid container spacing={1} sx={{ height: '100%' }}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }} className={[classes.greyBg].join(' ')}>
                    <Stack direction="column" alignItems="center" spacing={0}>
                      <Typography variant="h6" sx={{ color: 'common.black', mx: 0.5 }}>
                        <p>{translate(`typo.VN30DONGJINMOTOR2GHN0001`)}</p>
                        <p>{translate(`typo.issue_message`)}:</p>
                        <p>{translate(`typo.please_check_serial_pass_code`)}</p>
                      </Typography>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }} className={[classes.greenBg, classes.rootCard].join(' ')}>
                    <Stack direction="column" alignItems="center" spacing={0}>
                      <Typography
                        className={classes.greenBg}
                        sx={{ fontSize: '8rem', fontWeight: 'bold', mx: 0.5 }}
                        noWrap
                      >
                        {translate(`typo.ok`)}
                      </Typography>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>
            </Card>
            <Card sx={{ height: '20%' }} className={[classes.yellowBg, classes.rootCard].join(' ')}>
              <Stack direction="column" alignItems="center" spacing={0}>
                <Typography variant="h3" sx={{ color: 'common.black', mx: 0.5 }} noWrap>
                  {translate(`typo.VN30DONGJINMOTOR2GHN0001`)}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ width: '100%', height: `calc((100vh - 60px)/2)` }}>
        <Card sx={{ height: '10%' }} className={[classes.blueBg, classes.rootCard].join(' ')}>
          <Stack direction="column" alignItems="center" spacing={0}>
            <Typography variant="h3" sx={{ color: 'common.white', mx: 0.5 }} noWrap>
              {translate(`typo.work_instruction`)}
            </Typography>
          </Stack>
        </Card>
        <Card sx={{ height: '90%' }}>
          <Grid container spacing={1} sx={{ height: '100%' }}>
            <Grid item xs={12} md={10}>
              <Card sx={{ height: '100%' }}>
                <TableContainer sx={{ height: '100%' }}>
                  <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                      <TableRow>
                        {columnsWorkInstruction.map((column) => (
                          <Tooltip title={column.label}>
                            <TableCellProd key={column.id} align="center" className="header">
                              {column.label}
                            </TableCellProd>
                          </Tooltip>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rowsWorkInstruction.map((row) => (
                        <TableRow hover role="checkbox" tabIndex={-1} key={row.lineNo}>
                          {columnsWorkInstruction.map((column) => {
                            const value = row[column.id];
                            return (
                              <Tooltip title={value}>
                                <TableCellProd key={column.id} align={column.align} className={`body ${row.className}`}>
                                  {value}
                                </TableCellProd>
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
            <Grid item xs={12} md={2}>
              <Card sx={{ height: '10%' }} className={[classes.yellowBg, classes.rootCard].join(' ')}>
                <Stack direction="column" alignItems="center" spacing={0}>
                  <Typography variant="h4" sx={{ color: 'common.black', mx: 0.5 }} noWrap>
                    {translate(`typo.inspection_result`)}
                  </Typography>
                </Stack>
              </Card>
              <Card sx={{ height: '88%' }} className={[classes.redBg, classes.rootCard].join(' ')}>
                <Stack direction="column" alignItems="center" spacing={0}>
                  <Typography className={classes.redBg} sx={{ fontSize: '8rem', fontWeight: 'bold', mx: 0.5 }} noWrap>
                    {translate(`typo.ng`)}
                  </Typography>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Card>
      </Paper>
    </RootStyle>
  );
}
