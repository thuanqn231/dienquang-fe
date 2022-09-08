import {
    Card, CardHeader, Table, TableBody, TableCell, TableContainer, TableRow, Typography
} from '@material-ui/core';
// material
import { useTheme } from '@material-ui/core/styles';
import Scrollbar from '../../../components/Scrollbar';
// utils
import { fNumber } from '../../../utils/formatNumber';
import useLocales from '../../../hooks/useLocales';

// ----------------------------------------------------------------------

export default function InventoryStatus() {
    const theme = useTheme();
    const { translate, currentLang } = useLocales();
    return (
        <Card sx={{ height: '100%' }}>
            <CardHeader title="Inventory Status" sx={{ backgroundColor: 'primary.dark', textAlign: 'center', p: 1, color: 'common.white' }} />
            <Scrollbar>
                <TableContainer>
                    <Table>
                        <TableBody>
                            <TableRow key={1}>
                                <TableCell sx={{ p: 1, backgroundColor: theme.palette.info.main }} ><Typography variant="h5" color="textSecondary">{translate(`typo.total`)}</Typography></TableCell>
                                <TableCell sx={{ p: 1, backgroundColor: theme.palette.success.main }}><Typography variant="h5" color="textSecondary">0~3 {translate(`typo.days`)}</Typography></TableCell>
                                <TableCell sx={{ p: 1, backgroundColor: theme.palette.warning.main }}><Typography variant="h5" color="textSecondary">4~9 {translate(`typo.days`)}</Typography></TableCell>
                                <TableCell sx={{ p: 1, backgroundColor: theme.palette.error.main }}><Typography variant="h5" color="textSecondary">10 {translate(`typo.days`)} ~</Typography></TableCell>
                            </TableRow>
                            <TableRow key={2}>
                                <TableCell sx={{ p: 1 }}><Typography variant="h5" color="textSecondary">{translate(`typo.ref`)}</Typography></TableCell>
                                <TableCell sx={{ p: 1, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{fNumber(78673)}</Typography></TableCell>
                                <TableCell sx={{ p: 1, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{fNumber(0)}</Typography></TableCell>
                                <TableCell sx={{ p: 1, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{fNumber(2340)}</Typography></TableCell>
                            </TableRow>
                            <TableRow key={3}>
                                <TableCell sx={{ p: 1 }}><Typography variant="h5" color="textSecondary">{translate(`typo.vc`)}</Typography></TableCell>
                                <TableCell sx={{ p: 1, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{fNumber(1654)}</Typography></TableCell>
                                <TableCell sx={{ p: 1, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{fNumber(0)}</Typography></TableCell>
                                <TableCell sx={{ p: 1, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{fNumber(0)}</Typography></TableCell>
                            </TableRow>
                            <TableRow key={4}>
                                <TableCell sx={{ p: 1 }}><Typography variant="h5" color="textSecondary">{translate(`typo.vd`)}</Typography></TableCell>
                                <TableCell sx={{ p: 1, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{fNumber(4431)}</Typography></TableCell>
                                <TableCell sx={{ p: 1, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{fNumber(0)}</Typography></TableCell>
                                <TableCell sx={{ p: 1, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{fNumber(752)}</Typography></TableCell>
                            </TableRow>
                            <TableRow key={5}>
                                <TableCell sx={{ p: 1 }}><Typography variant="h5" color="textSecondary">{translate(`typo.wm`)}</Typography></TableCell>
                                <TableCell sx={{ p: 1, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{fNumber(223669)}</Typography></TableCell>
                                <TableCell sx={{ p: 1, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{fNumber(25953)}</Typography></TableCell>
                                <TableCell sx={{ p: 1, textAlign: 'right' }}><Typography variant="h5" color="textSecondary">{fNumber(14359)}</Typography></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Scrollbar>
        </Card>
    );
}
