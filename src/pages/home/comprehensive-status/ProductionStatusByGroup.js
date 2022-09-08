import {
    Box, Card, CardHeader, LinearProgress, Table, TableBody, TableCell, TableContainer, TableRow, Typography
} from '@material-ui/core';
import PropTypes from 'prop-types';
import Scrollbar from '../../../components/Scrollbar';
// utils
import { fNumber } from '../../../utils/formatNumber';
import useLocales from '../../../hooks/useLocales';

// ----------------------------------------------------------------------

const LinearProgressWithLabel = (props) => (
    <Box display="flex" alignItems="center" m={1}>
        {
            props.label && <Box minWidth={100}>
                <Typography variant="h5" color="textSecondary">{props.label}</Typography>
            </Box>
        }
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

export default function ProductionStatusByGroup() {
    const { translate, currentLang } = useLocales();
    return (
        <Card sx={{ height: '100%' }}>
            <CardHeader title="Production Status By Item Group" sx={{ backgroundColor: 'primary.dark', textAlign: 'center', p: 1, color: 'common.white' }} />
            <Scrollbar>
                <TableContainer>
                    <Table>
                        <TableBody>
                            <TableRow key={1}>
                                <TableCell sx={{ p: 0.1, width: '60%' }}><LinearProgressWithLabel value={47.4} /></TableCell>
                                <TableCell sx={{ p: 0.1 }}><Typography variant="h5" color="textSecondary">{`(${fNumber(23405)})`}</Typography></TableCell>
                                <TableCell sx={{ p: 0.1, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{translate(`typo.wm`)}</Typography></TableCell>
                            </TableRow>
                            <TableRow key={2}>
                                <TableCell sx={{ p: 0.1 }}><LinearProgressWithLabel value={40.5} /></TableCell>
                                <TableCell sx={{ p: 0.1 }}><Typography variant="h5" color="textSecondary">{`(${fNumber(20002)})`}</Typography></TableCell>
                                <TableCell sx={{ p: 0.1, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{translate(`typo.vd`)}</Typography></TableCell>
                            </TableRow>
                            <TableRow key={3}>
                                <TableCell sx={{ p: 0.1 }}><LinearProgressWithLabel value={12.1} /></TableCell>
                                <TableCell sx={{ p: 0.1 }}><Typography variant="h5" color="textSecondary">{`(${fNumber(5949)})`}</Typography></TableCell>
                                <TableCell sx={{ p: 0.1, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{translate(`typo.ref`)}</Typography></TableCell>
                            </TableRow>
                            <TableRow key={4}>
                                <TableCell sx={{ p: 0.1 }}><LinearProgressWithLabel value={0} /></TableCell>
                                <TableCell sx={{ p: 0.1 }}><Typography variant="h5" color="textSecondary">{`(${fNumber(0)})`}</Typography></TableCell>
                                <TableCell sx={{ p: 0.1, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{translate(`typo.vc`)}</Typography></TableCell>
                            </TableRow>
                            <TableRow key={5}>
                                <TableCell sx={{ p: 0.1 }}><LinearProgressWithLabel value={0} /></TableCell>
                                <TableCell sx={{ p: 0.1 }}><Typography variant="h5" color="textSecondary">{`(${fNumber(0)})`}</Typography></TableCell>
                                <TableCell sx={{ p: 0.1, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{translate(`typo.etc`)}</Typography></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Scrollbar>
        </Card>
    );
}
