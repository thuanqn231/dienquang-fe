import { Table, TableBody, TableContainer, TableHead, TableRow } from '@material-ui/core';
import MuiTableCell from '@material-ui/core/TableCell';
import { withStyles } from '@material-ui/styles';
import { isEmpty } from 'lodash';
import { query } from '../../core/api';
import { isNullVal } from '../../utils/formatString';

const notAllowPointer = ['line', 'modelCode', 'description', 'topModel', 'diff', 'stockRate', 'balanceIncStock'];

export const defaultStartTimeOfDay = '06:00:00';

export const columnsTooltip = [
  { id: 'planDate', minWidth: 170, align: 'center' },
  { id: 'lineCode', minWidth: 100, align: 'center' },
  { id: 'lineName', minWidth: 100, align: 'center' },
  { id: 'prodOrderNo', minWidth: 100, align: 'center' },
  { id: 'modelCode', minWidth: 100, align: 'center' },
  { id: 'modelVersion', minWidth: 100, align: 'center' },
  { id: 'modelDesc', minWidth: 100, align: 'center' },
  { id: 'planQty', minWidth: 100, align: 'right' },
  { id: 'tactTime', minWidth: 100, align: 'right' },
  { id: 'topModel', minWidth: 100, align: 'right' },
  { id: 'startTime', minWidth: 100, align: 'right' },
  { id: 'endTime', minWidth: 100, align: 'right' }
];

export const columnsProductionStatus = [
  { id: 'line', minWidth: 170, align: 'center' },
  { id: 'modelCode', minWidth: 100, align: 'center' },
  { id: 'description', minWidth: 100, align: 'center' },
  { id: 'modelCode', minWidth: 100, align: 'center' },
  { id: 'planQty', minWidth: 100, align: 'right' },
  { id: 'actualQty', minWidth: 100, align: 'right' },
  { id: 'defectQty', minWidth: 100, align: 'right' },
  { id: 'gap', minWidth: 100, align: 'right' },
  { id: 'eff', minWidth: 100, align: 'right' }
  // { id: 'actualQty', minWidth: 100, align: 'right' },
  // { id: 'diff', minWidth: 100, align: 'right' }
];

export const columnsStuffingStatus = [
  { id: 'modelCode', minWidth: 100, align: 'center' },
  { id: 'planQty', minWidth: 100, align: 'right' },
  { id: 'resultQty', minWidth: 100, align: 'right' },
  { id: 'remainQty', minWidth: 100, align: 'right' },
  { id: 'stock', minWidth: 100, align: 'right' },
  { id: 'stockRate', minWidth: 100, align: 'right' },
  { id: 'balanceIncStock', minWidth: 100, align: 'right' }
];

const TableCellTooltip = withStyles((theme) => ({
  root: {
    backgroundImage: 'none',
    padding: theme.spacing(1),
    border: `1px solid rgba(224, 224, 224, 1)`,
    borderCollapse: 'collapse',
    borderSpacing: 0,
    '&.header': {
      backgroundColor: '#565656',
      color: theme.palette.common.white
    },
    '&.body': {
      backgroundColor: '#282828',
      color: theme.palette.common.white
    },
    '&:first-of-type': {
      paddingLeft: theme.spacing(1),
      boxShadow: 'none'
    },
    '&:last-of-type': {
      paddingRight: theme.spacing(1),
      boxShadow: 'none'
    }
  }
}))(MuiTableCell);

export const generateTooltip = () => {
  const line = (
    <span>
      {`Line Eff(%): `}
      <br />
      {`If < 85%:`} <span style={{ color: '#ff1a1a' }}>Red color</span> <br />
      {` If >= 85%:`} <span style={{ color: '#4dff4d' }}>Green color</span>
    </span>
  );
  const eff = (
    <span>
      Eff(%) = (Plan Qty * T/T)/(24*60*60)
      <br />
      {`If < 85%:`} <span style={{ color: '#ff1a1a' }}>Red color</span> <br />
      {` If >= 85%:`} <span style={{ color: '#4dff4d' }}>Green color</span>
    </span>
  );
  const diff = (
    <span>
      Diff = Actual - Target
      <br />
      {`If Actual >= Target:`} <span style={{ color: '#4dff4d' }}>Green color</span> <br />
      {` If Actual < Target`}: <span style={{ color: '#ff1a1a' }}>Red color</span>
    </span>
  );
  return { line, eff, diff };
};

export const generateHtmlTooltip = (data) => (
  <TableContainer sx={{ height: '100%' }}>
    <Table stickyHeader aria-label="sticky table">
      <TableHead>
        <TableRow key="header-1">
          <TableCellTooltip align="center" key="planDate" className="header">
            Plan Date
          </TableCellTooltip>
          <TableCellTooltip align="center" key="lineCode" className="header">
            Line Code
          </TableCellTooltip>
          <TableCellTooltip align="center" key="lineName" className="header">
            Line Name
          </TableCellTooltip>
          <TableCellTooltip align="center" key="prodOrderNo" className="header">
            Prod Order No.
          </TableCellTooltip>
          <TableCellTooltip align="center" key="modelCode" className="header">
            Model Code
          </TableCellTooltip>
          <TableCellTooltip align="center" key="modelVersion" className="header">
            Model Version
          </TableCellTooltip>
          <TableCellTooltip align="center" key="modelDesc" className="header">
            Model Name
          </TableCellTooltip>
          <TableCellTooltip align="center" key="planQty" className="header">
            Plan Qty
          </TableCellTooltip>
          <TableCellTooltip align="center" key="tactTime" className="header">
            Tact Time
          </TableCellTooltip>
          <TableCellTooltip align="center" key="topModel" className="header">
            Top Model Code
          </TableCellTooltip>
          <TableCellTooltip align="center" key="startTime" className="header">
            Start Time
          </TableCellTooltip>
          <TableCellTooltip align="center" key="endTime" className="header">
            End Time
          </TableCellTooltip>
        </TableRow>
      </TableHead>
      <TableBody>
        {!isEmpty(data) &&
          data.map((row) => (
            <TableRow hover role="checkbox" tabIndex={-1} key={row.line}>
              {!isEmpty(columnsTooltip) &&
                columnsTooltip.map((column) => {
                  const value = row[column.id];
                  return (
                    <TableCellTooltip key={column.id} align={column.align} className="body">
                      {value}
                    </TableCellTooltip>
                  );
                })}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export function getCursor(column, value) {
  if (notAllowPointer.includes(column) || Number(value) === 0 || value === 0 || value === '-') {
    return false;
  }
  return true;
}

export function numberWithCommas(x) {
  if (!isNullVal(x) && x !== '-') {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return x;
}

export function isNumeric(value) {
  return /^-?\d+$/.test(value);
}

export function generateData(value) {
  if (!isNullVal(value)) {
    return value;
  }
  return '-';
}

export function generateDiff(actualQty, targetQty) {
  if (actualQty === '-' || targetQty === '-') {
    return '-';
  }
  return Math.abs(targetQty - actualQty);
}

export function generateEff(totalTactime, numberOfLine = 1) {
  if (totalTactime === '-' || totalTactime === 0) {
    return '-';
  }
  const eff = Math.round((totalTactime / (24 * 60 * 60 * numberOfLine)) * 100);
  return eff > 100 ? 100 : eff;
}

export function generatePercent(planQty, actualQty) {
  if (planQty === '-' || planQty === 0 || actualQty === '-' || actualQty === 0) {
    return '-';
  }
  const eff = Math.round((actualQty / planQty) * 100);
  return eff > 100 ? 100 : eff;
}

export function generateLineClassByEff(eff) {
  if (eff === '-') {
    return '';
  }
  return eff < 85 ? 'redBg' : 'greenBg';
}

export function generateEffClass(eff) {
  if (eff === '-') {
    return '';
  }
  return eff < 85 ? 'redColor' : 'greenColor';
}

export function generateDiffClass(actualQty, targetQty) {
  if (actualQty === '-' || targetQty === '-') {
    return '';
  }
  return actualQty < targetQty ? 'redColor' : 'greenColor';
}

export function generateTarget(totalPlan, timeDiff) {
  if (totalPlan === '-') {
    return '-';
  }
  return Math.round((timeDiff * totalPlan) / (24 * 60 * 60));
}

export function generateRemainQty(planQty, resultQty) {
  if (planQty === '-' || resultQty === '-') {
    return '-';
  }
  return planQty - resultQty;
}

export function generateStockRate(stockQty, resultQty, planQty) {
  if (stockQty === '-' || resultQty === '-' || planQty === '-' || planQty === 0) {
    return '-';
  }
  if (stockQty + resultQty >= planQty) {
    return '100%';
  }
  return `${Math.round(((stockQty + resultQty) / planQty) * 100)}%`;
}

export function generateBalanceIncStock(remainQty, stockQty) {
  if (remainQty === '-' || stockQty === '-') {
    return '-';
  }
  const balance = remainQty - stockQty;
  if (balance <= 0) {
    return 0;
  }
  return Math.abs(balance);
}

export function generateBalanceIncStockClass(remainQty, stockQty) {
  if (remainQty === '-' || stockQty === '-') {
    return '';
  }
  const balance = remainQty - stockQty;
  if (balance <= 0) {
    return 'blueColor';
  }
  return 'redColor';
}

export function generateModelCodeClass(remainQty) {
  if (remainQty === '-') {
    return '';
  }
  return remainQty <= 0 ? 'greyBg' : 'greenBg';
}

export async function getProductionStatus(planDate, factoryCode) {
  const response = await query({
    url: `/v1/fmb/production`,
    params: {
      planDate,
      factoryCode
    },
    featureCode: 'user.create'
  });
  return response;
}

export async function getStuffingStatus(planDate, factoryCode) {
  const response = await query({
    url: `/v1/fmb/stuffing`,
    params: {
      planDate,
      factoryCode
    },
    featureCode: 'user.create'
  });
  return response;
}

export async function getLineStatus(planDate, factoryCode, lineCode) {
  const response = await query({
    url: `/v1/fmb/production`,
    params: {
      planDate,
      factoryCode,
      lineCode
    },
    featureCode: 'user.create'
  });
  return response;
}

export async function getFactoryConfig(paramCode) {
  const response = await query({
    url: '/v1/factory-configuration/search',
    featureCode: 'user.create',
    params: {
      paramCode
    }
  });
  return response;
}

export async function getProductionDetail(params) {
  const response = await query({
    url: '/v1/productionOrder/search',
    featureCode: 'user.create',
    params
  });
  return response;
}
