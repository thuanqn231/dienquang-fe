import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
// material
import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  tooltipClasses
} from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import MuiTableCell from '@material-ui/core/TableCell';
import { withStyles } from '@material-ui/styles';
import { isEmpty, isUndefined } from 'lodash';
import useLocales from '../../hooks/useLocales';
import FmbNavbar from '../../layouts/fmb/FmbNavbar';
import { useSelector } from '../../redux/store';
// components
import { DialogDragable } from '../../components/animate';
import LoadingScreen from '../../components/LoadingScreen';
import Page from '../../components/Page';
import DetailProduction from './DetailProduction';
import {
  columnsProductionStatus as columns,
  generateData,
  generateDiff,
  generateDiffClass,
  generatePercent,
  generateEffClass,
  generateLineClassByEff,
  generateTooltip,
  getCursor,
  getProductionStatus,
  isNumeric,
  numberWithCommas
} from './helper';
// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  minHeight: '100%'
}));

const HtmlTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)(
  ({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 'none',
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9'
    }
  })
);

// ----------------------------------------------------------------------

export default function ProductionStatus() {
  const {
    fmb: { hideMenu }
  } = useSelector((state) => state.page);
  const {
    productionStatus: { prodDate }
  } = useSelector((state) => state.fmb);
  const { translate } = useLocales();
  const [rowDatas, setRowDatas] = useState([]);
  const [totalProd, setTotalProd] = useState();
  const [line, setLine] = useState();
  const [columnId, setColumnId] = useState();
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [tooltip, setTooltip] = useState({});
  const { factoryCode } = useParams();
  const [isLoading, setLoading] = useState(false);
  const currentIntervalID = useRef(null);

  const TableCell = withStyles((theme) => ({
    root: {
      backgroundImage: 'none',
      padding: theme.spacing(1),
      border: `1px solid rgba(224, 224, 224, 1)`,
      borderCollapse: 'collapse',
      borderSpacing: 0,
      '&.header': {
        height: `calc((100vh - 70px - ${hideMenu ? 0 : 36}px)/${(rowDatas.length + 1) * 2})`,
        backgroundColor: '#565656',
        color: theme.palette.common.white,
        fontSize: '1.7rem',
        lineHeight: 1.4
      },
      '&.body': {
        height: `calc((100vh - 70px - ${hideMenu ? 0 : 36}px)/${rowDatas.length + 1})`,
        backgroundColor: '#282828',
        color: theme.palette.common.white,
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
      }
    }
  }))(MuiTableCell);

  useEffect(() => {
    setTooltip(generateTooltip());
    onLoadData();
    clearInterval(currentIntervalID.current);
    currentIntervalID.current = setInterval(() => {
      onLoadData();
    }, 300000);

    return () => {
      clearInterval(currentIntervalID.current);
    };
  }, [prodDate]);

  useEffect(async () => {
    setLoading(false);
  }, [rowDatas]);

  const handleCloseModal = () => {
    setOpenActionModal(false);
  };

  const handleOpenModal = () => {
    setOpenActionModal(true);
  };

  const onLoadData = async () => {
    setLoading(true);
    const response = await getProductionStatus(prodDate, factoryCode);
    let rows = [];
    if (response?.data && !isEmpty(response?.data)) {
      const { data } = response;
      let totalPlanQty = 0;
      // let totalTagetQty = 0;
      let totalActualQty = 0;
      let totalGap = 0;
      // let totalItemQty = 0;
      // let totalTactTime = 0;
      rows = data.map((row) => {
        const linePk = `${row.linePk.factoryCode}-${row.linePk.id}`;
        const targetQty = generateData(row.targetQty);
        totalPlanQty += row.planQty ? row.planQty : 0;
        // totalTagetQty += row.targetQty ? row.targetQty : 0;
        totalActualQty += row.actualQty ? row.actualQty : 0;
        // totalItemQty += row.itemQty ? row.itemQty : 0;
        // totalTactTime += row.eff ? row.eff : 0;
        totalGap += row.planQty - row.actualQty;
        const eff = generatePercent(generateData(row.planQty), generateData(row.actualQty));

        return {
          line: row.line,
          linePk,
          eff,
          modelCode: generateData(row.modelCode),
          description: generateData(row.desc),
          topModel: generateData(row.topModel),
          planQty: numberWithCommas(generateData(row.planQty)),
          targetQty: numberWithCommas(targetQty),
          actualQty: numberWithCommas(generateData(row.actualQty)),
          diff: numberWithCommas(generateDiff(generateData(row.actualQty), targetQty)),
          diffClass: generateDiffClass(generateData(row.actualQty), targetQty),
          itemQty: generateData(row.itemQty),
          gap: numberWithCommas(generateData(row.planQty - row.actualQty)),
          className: ''
        };
      });
      // const totalDiff = generateDiff(generateData(totalActualQty), totalTagetQty);
      // const totalDiffClass = generateDiffClass(generateData(totalActualQty), totalTagetQty);
      // const totalEff = generateEff(generateData(totalTactTime), data.length);
      setTotalProd({
        totalPlanQty,
        totalActualQty,
        totalGap
        // totalDiff,
        // totalDiffClass,
        // totalEff,
        // totalEffClass: generateEffClass(totalEff)
      });
    } else {
      setTotalProd({});
    }
    setRowDatas(rows);
  };

  const showDetailViewProduction = (line, column) => {
    setLine(line);
    setColumnId(column);
    if (column) {
      handleOpenModal();
    }
  };

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <RootStyle title="Production Status | Dongjin Vietnam">
      <FmbNavbar page="productionStatus" title={translate(`fmb.production_status`)} />
      <Paper sx={{ width: '100%', height: `calc(100vh - 70px - ${hideMenu ? 0 : 36}px)` }}>
        <TableContainer sx={{ height: '100%' }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow key="header-1">
                <TableCell align="center" width="9%" key="line" className="header">
                  {translate(`fmb.line`)}
                </TableCell>
                <TableCell align="center" width="15%" key="modelCode" rowSpan={2} className="header">
                  {/* {translate(`fmb.model_code`)} */}
                  MODEL NAME
                </TableCell>
                <TableCell align="center" key="description" rowSpan={2} className="header">
                  {/* {translate(`fmb.description`)} */}
                  MODEL DESCRIPTION
                </TableCell>
                <TableCell align="center" width="13%" key="topModel" rowSpan={2} className="header">
                  {/* {translate(`fmb.top_model`)} */}
                  MODEL CODE
                </TableCell>
                {/* <TableCell align="center" width="9%" key="eff" className="header">
                  {translate(`fmb.eff`)}
                </TableCell>
                <TableCell align="center" width="9%" key="itemQty" className="header">
                  {translate(`fmb.item_qty`)}
                </TableCell> */}
                <TableCell align="center" width="12%" key="planQty" className="header">
                  {/* {translate(`fmb.plan_qty`)} */}
                  PLAN QTY
                </TableCell>
                {/* <TableCell align="center" width="9%" key="targetQty" className="header">
                  {translate(`fmb.target_qty`)}
                </TableCell> */}
                <TableCell align="center" width="13%" key="actualQty" className="header">
                  {/* {translate(`fmb.actual_qty`)} */}
                  ACTUAL QTY
                </TableCell>
                <TableCell align="center" width="9%" key="diff" className="header">
                  {/* {translate(`fmb.diff`)} */}
                  GAP
                </TableCell>
                <TableCell align="center" width="9%" key="diff" className="header">
                  %
                </TableCell>
              </TableRow>
              {!isEmpty(totalProd) && !isUndefined(totalProd) && (
                <TableRow key="header-2">
                  <TableCell align="center" className="header">
                    {translate(`fmb.total`)}
                  </TableCell>
                  {/* <HtmlTooltip title={tooltip?.eff || ''}>
                    <TableCell
                      align="right"
                      className={`header ${totalProd.totalEffClass}`}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        showDetailViewProduction('', 'eff');
                      }}
                    >
                      {totalProd.totalEff}
                    </TableCell>
                  </HtmlTooltip> */}
                  {/* <TableCell
                    align="right"
                    className="header"
                    sx={{ ...(getCursor('itemQty', totalProd.totalItemQty) && { cursor: 'pointer' }) }}
                    onClick={() => {
                      if (getCursor('itemQty', totalProd.totalItemQty)) {
                        showDetailViewProduction('', 'itemQty');
                      }
                    }}
                  >
                    {numberWithCommas(totalProd.totalItemQty)}
                  </TableCell> */}
                  <TableCell
                    align="right"
                    className="header"
                    sx={{ ...(getCursor('planQty', totalProd.totalItemQty) && { cursor: 'pointer' }) }}
                    // onClick={() => {
                    //   if (getCursor('itemQty', totalProd.totalItemQty)) {
                    //     showDetailViewProduction('', 'planQty');
                    //   }
                    // }}
                  >
                    {numberWithCommas(totalProd.totalPlanQty)}
                  </TableCell>
                  {/* <TableCell
                    align="right"
                    className="header blueColor"
                    sx={{ ...(getCursor('targetQty', totalProd.totalTagetQty) && { cursor: 'pointer' }) }}
                    onClick={() => {
                      if (getCursor('itemQty', totalProd.totalTagetQty)) {
                        showDetailViewProduction('', 'targetQty');
                      }
                    }}
                  >
                    {numberWithCommas(totalProd.totalTagetQty)}
                  </TableCell> */}
                  <TableCell
                    align="right"
                    className="header blueColor"
                    sx={{ ...(getCursor('actualQty', totalProd.totalActualQty) && { cursor: 'pointer' }) }}
                    // onClick={() => {
                    //   if (getCursor('itemQty', totalProd.totalActualQty)) {
                    //     showDetailViewProduction('', 'actualQty');
                    //   }
                    // }}
                  >
                    {numberWithCommas(totalProd.totalActualQty)}
                  </TableCell>

                  <TableCell
                    align="right"
                    className="header blueColor"
                    sx={{ ...(getCursor('gap', totalProd.totalGap) && { cursor: 'pointer' }) }}
                    // onClick={() => {
                    //   if (getCursor('itemQty', totalProd.totalActualQty)) {
                    //     showDetailViewProduction('', 'actualQty');
                    //   }
                    // }}
                  >
                    {numberWithCommas(totalProd.totalGap)}
                  </TableCell>
                  <HtmlTooltip title={tooltip?.diff || ''}>
                    <TableCell align="right" className={`header ${totalProd.totalDiffClass}`}>
                      {numberWithCommas(totalProd.totalDiff)}
                    </TableCell>
                  </HtmlTooltip>
                </TableRow>
              )}
            </TableHead>
            <TableBody>
              {console.log('rowDatas', rowDatas)}
              {rowDatas.map((row) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.line}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    const showDetail = getCursor(column.id, value);
                    const _line = row.linePk;
                    const lineTooltip = tooltip[column.id] ? tooltip[column.id] : value;
                    return (
                      <HtmlTooltip title={lineTooltip}>
                        <TableCell
                          key={column.id}
                          align={column.align}
                          className={`body 
                                                    ${column.id === 'line' && row.lineClass}
                                                    ${column.id === 'eff' && row.effClass}
                                                    ${column.id === 'diff' && row.diffClass}
                                                    ${
                                                      (column.id === 'targetQty' || column.id === 'actualQty') &&
                                                      isNumeric(value) &&
                                                      'blueColor'
                                                    }
                                                    `}
                          sx={{ ...(showDetail && { cursor: 'pointer' }) }}
                          // onClick={() => {
                          //   if (showDetail) {
                          //     showDetailViewProduction(_line, column.id);
                          //   }
                          // }}
                        >
                          {value}
                        </TableCell>
                      </HtmlTooltip>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <DialogDragable
          title="Production Status Detail"
          maxWidth="xl"
          open={isOpenActionModal}
          onClose={handleCloseModal}
        >
          <DetailProduction date={prodDate} line={line} columnId={columnId} factoryCode={factoryCode} />
        </DialogDragable>
      </Paper>
    </RootStyle>
  );
}
