import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
// material
import { Paper, Table, TableBody, TableContainer, TableHead, TableRow, Tooltip } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import MuiTableCell from '@material-ui/core/TableCell';
import { withStyles } from '@material-ui/styles';
import { isEmpty, isUndefined } from 'lodash';
import useLocales from '../../hooks/useLocales';
import FmbNavbar2 from '../../layouts/fmb/FmbNavbar2';
import { useSelector } from '../../redux/store';
// components
import { DialogDragable } from '../../components/animate';
import Page from '../../components/Page';
import {
  columnsMachineOperationStatus as columns,
  generateBalanceIncStock,
  generateBalanceIncStockClass,
  generateData,
  generateModelCodeClass,
  generateRemainQty,
  generateStockRate,
  getCursor,
  getMachineOperationStatus,
  numberWithCommas
} from './helper';
import ComprehensiveStatus from './comprehensive-status/ComprehensiveStatus';
// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  minHeight: '100%'
}));
// ----------------------------------------------------------------------

export default function MachineOperationStatus() {
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
    }, 60000);

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
    const response = await getMachineOperationStatus(factoryCode);

    if (response?.data && !isEmpty(response?.data)) {
      const { data } = response;
    }
    setRowDatas(data);
  };

  const showDetailViewStuffing = (modelCode, column) => {
    setModelCode(modelCode);
    setColumnId(column);
  };

  const data = [
    {
      title: 'SMD-3234-001',
      material: 'T342232C',
      line: 'MOTOR 1',
      status: 'RUNNING'
    },
    {
      title: 'SMD-3234-002',
      material: 'T342232C',
      line: 'MOTOR 2',
      status: 'RUNNING'
    },
    {
      title: 'SMD-3234-003',
      material: 'T342232C',
      line: 'MOTOR 3',
      status: 'RUNNING'
    },
    {
      title: 'SMD-3234-004',
      material: 'T342232C',
      line: 'MOTOR 4',
      status: 'RUNNING'
    },
    {
      title: 'SMD-3234-005',
      material: 'T342232C',
      line: 'MOTOR 5',
      status: 'STOP'
    }
  ];

  return (
    <RootStyle title="Machine Operation Eficiency | Điện Quang">
      <FmbNavbar2 page="stuffingStatus" title={translate(`fmb.machine_operation`)} />
      <Paper sx={{ width: '100%', height: `calc(100vh - 70px - ${hideMenu ? 0 : 36}px)` }}>
        <TableContainer sx={{ height: '100%' }}>
          <ComprehensiveStatus currentData={data} />
        </TableContainer>
      </Paper>
    </RootStyle>
  );
}
