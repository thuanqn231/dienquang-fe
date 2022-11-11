import {
  Box,
  Card,
  CardHeader,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography
} from '@material-ui/core';
import MuiTableCell from '@material-ui/core/TableCell';
import { isEmpty } from 'lodash-es';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles, makeStyles } from '@material-ui/styles';
import Scrollbar from '../../../components/Scrollbar';

// utils
import { fNumber, fPercent } from '../../../utils/formatNumber';
import useLocales from '../../../hooks/useLocales';

// ----------------------------------------------------------------------

const LinearProgressWithLabel = (props) => (
  <Box display="flex" alignItems="center" m={1}>
    <Box minWidth={150}>
      <Typography variant="h6" color="textSecondary">
        {props.label}
      </Typography>
    </Box>
    <Box width="100%" mr={1}>
      <LinearProgress sx={{ height: '30px' }} variant="determinate" {...props} />
    </Box>
    <Box minWidth={50}>
      <Typography variant="h6" color="textSecondary">{`${Math.round(props.value)}%`}</Typography>
    </Box>
  </Box>
);

LinearProgressWithLabel.propTypes = {
  value: PropTypes.number,
  label: PropTypes.string
};
MachineStatus.propTypes = {
  currentData: PropTypes.object
};
export default function MachineStatus(currentData) {
  const [currentValue, setCurrentValue] = useState({
    title: '',
    material: '',
    line: '',
    status: ''
  });

  useEffect(() => {
    if (!isEmpty(currentData.currentData)) {
      console.log('data', currentData.currentData);
      setCurrentValue(currentData.currentData);
      //   setCurrentValue({
      //     title: 'SMD-3234-005',
      //     material: 'T342232C',
      //     line: 'MOTOR 5',
      //     status: 'RUNNING'
      //   });
    } else {
      setCurrentValue({
        title: 'No Machine',
        material: '',
        line: '',
        status: ''
      });
    }
  }, [currentData]);
  const { translate, currentLang } = useLocales();
  const useStyles = makeStyles(() => ({
    titleRunning: {
      color: 'white',
      backgroundColor: '#00af50'
      //   #4dc885
      //   #fe0000
      // #ff4d4d
      // #a6a6a6
      // #c1c1c1
    },
    titleStop: {
      color: 'white',
      backgroundColor: '#fe0000',
      fontSize: '2.7rem'
    },
    titleNotYetDefine: {
      color: 'white',
      backgroundColor: '#a6a6a6'
    },
    bodyRunning: {
      color: 'white',
      backgroundColor: '#4dc885'
      //   #4dc885
      //   #fe0000
      // #ff4d4d
      // #a6a6a6
      // #c1c1c1
    },
    bodyStop: {
      color: 'white',
      backgroundColor: '#ff4d4d'
    },
    bodyNotYetDefine: {
      color: 'white',
      backgroundColor: '#c1c1c1'
    }
  }));
  const classes = useStyles();

  const changeColorTitle = () => {
    if (currentValue.status === '') {
      return classes.titleNotYetDefine;
    }
    if (currentValue.status === 'RUNNING') {
      return classes.titleRunning;
    }
    return classes.titleStop;
  };

  const changeColorBody = () => {
    if (currentValue.status === '') {
      return classes.bodyNotYetDefine;
    }
    if (currentValue.status === 'RUNNING') {
      return classes.bodyRunning;
    }
    return classes.bodyStop;
  };

  const TableCell = withStyles((theme) => ({
    root: {
      color: theme.palette.common.white,
      padding: theme.spacing(1),
      border: `0px solid rgba(224, 224, 224, 1)`,
      borderCollapse: 'collapse',
      borderSpacing: 0
    },
    '&.blueColor': {
      color: '#4eadff'
    }
  }))(MuiTableCell);

  return (
    <Card className={changeColorBody()} sx={{ height: '100%' }}>
      <CardHeader
        titleTypographyProps={{ variant: 'h4' }}
        title={currentValue.title}
        className={changeColorTitle()}
        sx={{ backgroundColor: 'primary.dark', textAlign: 'center', p: 1, color: 'common.white', fontSize: 'large' }}
      />
      <Scrollbar>
        <TableContainer>
          <Table>
            {currentValue.status !== '' && (
              <TableBody>
                <TableRow key={1}>
                  <TableCell sx={{ p: 0.2, textAlign: 'right' }}>
                    <Typography variant="h6">{translate(`typo.material`)}</Typography>
                  </TableCell>
                  <TableCell sx={{ p: 0.2, textAlign: 'left' }}>
                    <Typography variant="h6">{currentValue.material}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow key={2}>
                  <TableCell sx={{ p: 0.2, textAlign: 'right' }}>
                    <Typography variant="h6">{translate(`typo.line`)}</Typography>
                  </TableCell>
                  <TableCell sx={{ p: 0.2, textAlign: 'left' }}>
                    <Typography variant="h6">{currentValue.line}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow key={3}>
                  <TableCell sx={{ p: 0.2, textAlign: 'right' }}>
                    <Typography variant="h6">{translate(`typo.status`)}</Typography>
                  </TableCell>
                  <TableCell sx={{ p: 0.2, textAlign: 'left' }}>
                    <Typography variant="h6">{currentValue.status}</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Scrollbar>
    </Card>
  );
}
