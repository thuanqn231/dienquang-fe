import {
    Box, Card, CardHeader, LinearProgress, Table, TableBody, TableCell, TableContainer, TableRow, Typography
} from '@material-ui/core';
import PropTypes from 'prop-types';
import Scrollbar from '../../../components/Scrollbar';
// utils
import { fNumber, fPercent } from '../../../utils/formatNumber';
import useLocales from '../../../hooks/useLocales';

// ----------------------------------------------------------------------

const LinearProgressWithLabel = (props) => (
    <Box display="flex" alignItems="center" m={1}>
        <Box minWidth={150}>
            <Typography variant="h5" color="textSecondary">{props.label}</Typography>
        </Box>
        <Box width="100%" mr={1}>
            <LinearProgress sx={{ height: '30px' }} variant="determinate" {...props} />
        </Box>
        <Box minWidth={50}>
            <Typography variant="h5" color="textSecondary">{`${Math.round(
                props.value,
            )}%`}</Typography>
        </Box>
    </Box>
);

LinearProgressWithLabel.propTypes = {
    value: PropTypes.number,
    label: PropTypes.string
};

export default function ProductionStatus() {
    const { translate, currentLang } = useLocales();
    return (
        <Card sx={{ height: '100%' }}>
            <CardHeader title="Production Status" sx={{ backgroundColor: 'primary.dark', textAlign: 'center', p: 1, color: 'common.white' }} />
            <Scrollbar>
                <TableContainer>
                    <LinearProgressWithLabel value={28} label="RESULT" />
                    <LinearProgressWithLabel value={85} label="WORK EFF" />
                    <Table>
                        <TableBody>
                            <TableRow key={1}>
                                <TableCell sx={{ p: 0.2 }}><Typography variant="h5" color="textSecondary">{translate(`typo.plan`)}</Typography></TableCell>
                                <TableCell sx={{ p: 0.2, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{fNumber(173543)}</Typography></TableCell>
                            </TableRow>
                            <TableRow key={2}>
                                <TableCell sx={{ p: 0.2 }}><Typography variant="h5" color="textSecondary">{translate(`typo.target`)}</Typography></TableCell>
                                <TableCell sx={{ p: 0.2, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{fNumber(58023)}</Typography></TableCell>
                            </TableRow>
                            <TableRow key={3}>
                                <TableCell sx={{ p: 0.2 }}><Typography variant="h5" color="textSecondary">{translate(`typo.plan`)}</Typography></TableCell>
                                <TableCell sx={{ p: 0.2, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{fNumber(49356)}</Typography></TableCell>
                            </TableRow>
                            <TableRow key={4}>
                                <TableCell sx={{ p: 0.2 }}><Typography variant="h5" color="textSecondary">{translate(`typo.work_eff`)}</Typography></TableCell>
                                <TableCell sx={{ p: 0.2, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{fPercent(85.1)}</Typography></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Scrollbar>
        </Card>
    );
}
