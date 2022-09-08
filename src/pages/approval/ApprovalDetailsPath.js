import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import { Icon } from '@iconify/react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@material-ui/core';
// material
import { styled } from '@material-ui/core/styles';
import { DataGrid } from '@material-ui/data-grid';
import PropTypes from 'prop-types';
import { toStringCaseCapitalize } from '../../utils/formatString';
import { fDateTime } from '../../utils/formatTime';
import useLocales from '../../hooks/useLocales';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(() => ({
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    padding: 0,
    justifyContent: 'space-between',

}));

// ----------------------------------------------------------------------

ApprovalDetailsPath.propTypes = {
    approval: PropTypes.object
};
const columns = [
    // { field: 'id', headerName: 'id', hide: true },
    {
        field: 'rank',
        headerName: 'No.',
        width: 80,
        sortable: false,
        align: 'right',
        valueFormatter: (params) => params.value + 1,
    },
    {
        field: 'type',
        headerName: 'Type',
        width: 180,
        sortable: false,
        valueFormatter: (params) => toStringCaseCapitalize(params.value, "_"),
    },
    {
        field: 'name',
        headerName: 'Name',
        sortable: false,
        minWidth: 250,
        flex: 1.5,
    },
    {
        field: 'processedTime',
        headerName: 'Processing Date',
        minWidth: 250,
        flex: 1,
        sortable: false
    },
    {
        field: 'department',
        headerName: 'Team Name',
        minWidth: 250,
        flex: 1,
        sortable: false
    }
];

const processedStatus = {
    'APPROVER': 'APPROVED',
    'PARALLEL APPROVER': 'PARALLEL APPROVED',
    'CONSENT': 'CONSENT',
    'PARALLEL CONSENT': 'PARALLEL CONSENT',
    'NOTIFICATION': 'NOTIFICATION'
}

const finalStatus = {
    'APPROVER': 'Undecided/Pending',
    'CONSENT': 'Undecided/Pending',
    'NOTIFICATION': 'Not Delivered'
}

export default function ApprovalDetailsPath({ approval, ...other }) {
    const { translate } = useLocales();
    const approvalPath = [{
        id: approval.userRequest.factoryPk,
        rank: -1,
        type: 'DRAFT',
        name: `${approval.userRequest.firstName} ${approval.userRequest.lastName}`,
        processedTime: fDateTime(approval.requestTime),
        department: approval.userRequest.department.name,
        remark: approval.remark
    }];
    approval.documentApprovalStates.forEach((state) => {
        const tmpState = {
            id: state.approver.factoryPk,
            rank: state.rank,
            name: `${state.approver.firstName} ${state.approver.lastName}`,
            department: state.approver.department.name,
            remark: state.remark
        }
        if (state.approvedTime) {
            tmpState.processedTime = fDateTime(state.approvedTime);
            tmpState.type = state.parallel ? processedStatus[`PARALLEL ${state.type}`] : processedStatus[state.type];
        } else {
            tmpState.processedTime = finalStatus[state.type];
            tmpState.type = state.parallel ? `PARALLEL ${state.type}` : state.type;
        }
        approvalPath.push(tmpState);
    });

    approvalPath.sort((a, b) => {
        if (a.rank === b.rank) {
            return b.id - a.id;
        }
        return a.rank > b.rank ? 1 : -1;
    });

    return (
        <RootStyle {...other}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ width: '100%' }}>
                    <Accordion key="approval_path" defaultExpanded>
                        <AccordionSummary expandIcon={<Icon icon={arrowIosDownwardFill} width={20} height={20} />}>
                            <Typography variant="subtitle1">{translate(`typo.approval_path`)}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                            <div style={{ height: 250, width: '100%' }}>
                                <DataGrid
                                    rows={approvalPath}
                                    columns={columns}
                                    disableSelectionOnClick
                                    disableColumnMenu
                                    density="compact"
                                    hideFooterPagination
                                />
                            </div>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Box>
        </RootStyle>
    );
}
