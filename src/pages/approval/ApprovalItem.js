import linkFill from '@iconify/icons-eva/link-fill';
import roundLabelImportant from '@iconify/icons-ic/round-label-important';
import { Icon } from '@iconify/react';
import { Box, Checkbox, Link, Stack, Tooltip, Typography } from '@material-ui/core';
// material
import { styled } from '@material-ui/core/styles';
import { isUndefined } from 'lodash';
import PropTypes from 'prop-types';
import { selectApproval, getApprovalById } from '../../redux/slices/approval';
// redux
import { useDispatch } from '../../redux/store';
import { toStringCaseCapitalize } from '../../utils/formatString';
// utils
import { fDateTime } from '../../utils/formatTime';
import ApprovalItemAction from './ApprovalItemAction';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
    position: 'relative',
    padding: theme.spacing(0, 2),
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.neutral,
    borderBottom: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.up('md')]: {
        display: 'flex',
        alignItems: 'center'
    },
    '&:hover': {
        zIndex: 999,
        position: 'relative',
        boxShadow: theme.customShadows.z24,
        '& .showActions': { opacity: 1 }
    }
}));

const WrapStyle = styled(Link)(({ theme }) => ({
    minWidth: 0,
    display: 'flex',
    padding: theme.spacing(2, 0),
    transition: theme.transitions.create('padding'),
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer'
}));

// ----------------------------------------------------------------------

ApprovalItem.propTypes = {
    approval: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired
};

export default function ApprovalItem({ approval, isSelected, ...other }) {
    const dispatch = useDispatch();
    const isAttached = !isUndefined(approval.files) && approval.files.length > 0;
    const handleSelectApproval = async (approvalId) => {
        await dispatch(selectApproval(approvalId));
        await dispatch(getApprovalById(approvalId));
    }

    return (
        <RootStyle
            sx={{
                ...(!approval.isUnread && {
                    color: 'text.primary',
                    backgroundColor: 'background.paper'
                }),
                ...(isSelected && { bgcolor: 'action.selected' })
            }}
            {...other}
        >
            <Stack direction="row" sx={{ mr: 2 }}>
                <Tooltip title="Important">
                    <Checkbox
                        color="warning"
                        defaultChecked={approval.isImportant}
                        checkedIcon={<Icon icon={roundLabelImportant} />}
                        icon={<Icon icon={roundLabelImportant} />}
                    />
                </Tooltip>
            </Stack>

            <WrapStyle
                color="inherit"
                underline="none"
                onClick={() => handleSelectApproval(approval.factoryPk)}
                sx={{ display: 'flex', py: 0 }}
            >
                <Box
                    sx={{
                        ml: 2,
                        minWidth: 0,
                        alignItems: 'center',
                        display: { md: 'flex' }
                    }}
                >
                    <Typography
                        variant="body2"
                        noWrap
                        sx={{
                            pr: 2,
                            minWidth: 180,
                            ...(!approval.isUnread && { fontWeight: 'fontWeightBold' })
                        }}
                    >
                        {`${approval.userRequest.firstName} ${approval.userRequest.lastName}`}
                    </Typography>

                    <Typography
                        noWrap
                        variant="body2"
                        sx={{
                            pr: 2
                        }}
                    >
                        <Box component="span" sx={{ ...(!approval.isUnread && { fontWeight: 'fontWeightBold' }) }}>
                            {approval.title}
                        </Box>
                    </Typography>
                </Box>
            </WrapStyle>

            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>

                <Typography
                    variant="caption"
                    sx={{
                        flexShrink: 0,
                        minWidth: 120,
                        textAlign: 'right',
                        ...(!approval.isUnread && { fontWeight: 'fontWeightBold' })
                    }}
                >
                    {toStringCaseCapitalize(approval.state, "_")}
                </Typography>
                {isAttached && (
                    <Box
                        component={Icon}
                        icon={linkFill}
                        sx={{
                            mx: 2,
                            width: 20,
                            height: 20,
                            flexShrink: 0
                        }}
                    />
                )}
                <Typography
                    variant="caption"
                    sx={{
                        flexShrink: 0,
                        minWidth: 120,
                        textAlign: 'right',
                        ...(!approval.isUnread && { fontWeight: 'fontWeightBold' })
                    }}
                >
                    {fDateTime(approval.requestTime)}
                </Typography>
            </Stack>

            {/* <ApprovalItemAction className="showActions" /> */}
        </RootStyle>
    );
}
