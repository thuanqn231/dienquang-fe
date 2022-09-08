import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
// material
import { Paper, Table, TableBody, TableContainer, TableHead, TableRow, Tooltip } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import MuiTableCell from '@material-ui/core/TableCell';
import { withStyles } from '@material-ui/styles';
import { isEmpty, isUndefined } from 'lodash';
import useLocales from '../../hooks/useLocales';
import FmbNavbar from '../../layouts/fmb/FmbNavbar';
import { useSelector } from '../../redux/store';
// components
import { DialogDragable } from '../../components/animate';
import Page from '../../components/Page';
import DetailStuffing from './DetailStuffing';
import {
  columnsStuffingStatus as columns,
  generateBalanceIncStock,
  generateBalanceIncStockClass,
  generateData,
  generateModelCodeClass,
  generateRemainQty,
  generateStockRate,
  getCursor,
  getStuffingStatus,
  numberWithCommas
} from './helper';
// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  minHeight: '100%'
}));
// ----------------------------------------------------------------------

export default function StuffingStatus() {
  const {
    fmb: { hideMenu }
  } = useSelector((state) => state.page);
  const {
    stuffingStatus: { prodDate }
  } = useSelector((state) => state.fmb);
  const { translate } = useLocales();
  const [rowDatas, setRowDatas] = useState([]);
  const [totalProd, setTotalProd] = useState();
  const [isEmptyData, setEmptyData] = useState(false);
  const [modelCode, setModelCode] = useState();
  const [columnId, setColumnId] = useState();
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const { factoryCode } = useParams();
  const currentIntervalID = useRef(null);

  const TableCell = withStyles((theme) => ({
    root: {
      height: `calc((100vh - 70px - ${hideMenu ? 0 : 36}px)/${rowDatas.length + (isEmptyData ? 1 : 2)})`,
      backgroundImage: 'none',
      padding: theme.spacing(1),
      border: `1px solid rgba(224, 224, 224, 1)`,
      borderCollapse: 'collapse',
      borderSpacing: 0,
      '&.header': {
        backgroundColor: '#565656',
        color: theme.palette.common.white,
        fontSize: '1.7rem',
        lineHeight: 1.4
      },
      '&.body': {
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
      '&.greyBg': {
        backgroundColor: '#767676'
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
      '&.greyColor': {
        color: '#565656'
      }
    }
  }))(MuiTableCell);

  useEffect(() => {
    onLoadData();
    clearInterval(currentIntervalID.current);
    currentIntervalID.current = setInterval(() => {
      onLoadData();
    }, 300000);

    return () => {
      clearInterval(currentIntervalID.current);
    };
  }, [prodDate]);

  useEffect(() => {
    if (modelCode && columnId) {
      handleOpenModal();
    }
  }, [modelCode, columnId]);

  const handleCloseModal = () => {
    setOpenActionModal(false);
  };

  const handleOpenModal = () => {
    setOpenActionModal(true);
  };

  const onLoadData = async () => {
    const response = await getStuffingStatus(prodDate, factoryCode);
    let rows = [];
    let cloneArr = [];
    let totalPlanQty = 0;
    let totalActualQty = 0;
    let totalStock = 0;
    if (response?.data && !isEmpty(response?.data)) {
      const { data } = response;
      rows = data.map((row) => {
        const planQty = generateData(row.planQty);
        const resultQty = generateData(row.actualQty);
        const remainQty = generateRemainQty(planQty, resultQty);
        const stockQty = generateData(row.stockQty);
        const stockRate = generateStockRate(stockQty, resultQty, planQty);
        const balanceIncStock = generateBalanceIncStock(remainQty, stockQty);
        totalPlanQty += planQty !== '-' ? planQty : 0;
        totalActualQty += resultQty !== '-' ? resultQty : 0;
        totalStock += stockQty !== '-' ? stockQty : 0;
        return {
          modelCode: generateData(row.modelCode),
          modelCodeClass: generateModelCodeClass(remainQty),
          planQty: numberWithCommas(planQty),
          resultQty: numberWithCommas(resultQty),
          remainQty: numberWithCommas(remainQty),
          stock: numberWithCommas(stockQty),
          stockRate,
          balanceIncStock: numberWithCommas(balanceIncStock),
          balanceIncStockClass: generateBalanceIncStockClass(remainQty, stockQty)
        };
      });
      const totalRemainQty = generateRemainQty(totalPlanQty, totalActualQty);
      const totalStockRate = generateStockRate(totalStock, totalActualQty, totalPlanQty);
      const totalBalanceIncStock = generateBalanceIncStock(totalPlanQty, totalActualQty, totalStock);
      setTotalProd({
        totalPlanQty,
        totalActualQty,
        totalRemainQty,
        totalStock,
        totalStockRate,
        totalBalanceIncStock,
        totalbalanceIncStockClass: generateBalanceIncStockClass(totalRemainQty, totalStock)
      });
      setEmptyData(false);
    } else {
      setTotalProd({});
      setEmptyData(true);
    }
    if (rows.length < 5) {
      cloneArr = [...Array(5 - (rows.length === 0 ? 0 : rows.length + 1)).keys()].map(() => ({
        modelCode: '-',
        modelCodeClass: '',
        planQty: '-',
        resultQty: '-',
        remainQty: '-',
        stock: '-',
        stockRate: '-',
        balanceIncStock: '-',
        balanceIncStockClass: ''
      }));
    }
    setRowDatas([...rows, ...cloneArr]);
  };

  const showDetailViewStuffing = (modelCode, column) => {
    setModelCode(modelCode);
    setColumnId(column);
  };

  return (
    <RootStyle title="Stuffing Status | Điện Quang">
      <FmbNavbar page="stuffingStatus" title={translate(`fmb.stuffing_status`)} />
      <Paper sx={{ width: '100%', height: `calc(100vh - 70px - ${hideMenu ? 0 : 36}px)` }}>
        <TableContainer sx={{ height: '100%' }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell align="center" key="modelCode" className="header">
                  {translate(`fmb.model_code`)}
                </TableCell>
                <TableCell align="center" width="13%" key="planQty" className="header">
                  {translate(`fmb.shipping_plan_qty`)}
                </TableCell>
                <TableCell align="center" width="13%" key="resultQty" className="header">
                  {translate(`fmb.result_qty`)}
                </TableCell>
                <TableCell align="center" width="13%" key="remainQty" className="header">
                  {translate(`fmb.remain_qty`)}
                </TableCell>
                <TableCell align="center" width="13%" key="stock" className="header">
                  {translate(`fmb.stock`)}
                </TableCell>
                <TableCell align="center" width="13%" key="stockRate" className="header">
                  {translate(`fmb.stock_rate`)}
                </TableCell>
                <TableCell align="center" width="13%" key="balanceIncStock" className="header">
                  {translate(`fmb.balance_inc_stock`)}
                </TableCell>
              </TableRow>
              {!isEmpty(totalProd) && !isUndefined(totalProd) && (
                <TableRow>
                  <TableCell align="center" key="modelCodeTotal" className="header greyBg">
                    {translate(`fmb.total`)}
                  </TableCell>
                  <TableCell align="right" key="planQtyTotal" className="header greyBg">
                    {numberWithCommas(generateData(totalProd.totalPlanQty))}
                  </TableCell>
                  <TableCell align="right" key="resultQtyTotal" className="header greyBg">
                    {numberWithCommas(generateData(totalProd.totalActualQty))}
                  </TableCell>
                  <TableCell align="right" key="remainQtyTotal" className="header greyBg">
                    {numberWithCommas(generateData(totalProd.totalRemainQty))}
                  </TableCell>
                  <TableCell align="right" key="stockTotal" className="header greyBg">
                    {numberWithCommas(generateData(totalProd.totalStock))}
                  </TableCell>
                  <TableCell align="right" key="stockRateTotal" className="header greyBg">
                    {totalProd.totalStockRate}
                  </TableCell>
                  <TableCell
                    align="right"
                    key="balanceIncStockTotal"
                    className={`header greyBg ${totalProd.totalbalanceIncStockClass}`}
                  >
                    {totalProd.totalBalanceIncStock}
                  </TableCell>
                </TableRow>
              )}
            </TableHead>
            <TableBody>
              {rowDatas.map((row) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.model}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    const _modelCode = row.modelCode;
                    const showDetail = getCursor(column.id, value);
                    return (
                      <Tooltip title={value} key={column.id}>
                        <TableCell
                          align={column.align}
                          className={`body 
                                                ${column.id === 'modelCode' && row.modelCodeClass}
                                                ${column.id === 'planQty' && 'greenColor'}
                                                ${column.id === 'balanceIncStock' && row.balanceIncStockClass}
                                                `}
                          sx={{ ...(showDetail && { cursor: 'pointer' }) }}
                          // onClick={() => {
                          //     if (showDetail) {
                          //         showDetailViewStuffing(_modelCode, column.id);
                          //     }
                          // }}
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
        <DialogDragable
          title="Stuffing Status Detail"
          maxWidth="xl"
          open={isOpenActionModal}
          onClose={handleCloseModal}
        >
          <DetailStuffing date={prodDate} modelCode={modelCode} columnId={columnId} />
        </DialogDragable>
      </Paper>
    </RootStyle>
  );
}
