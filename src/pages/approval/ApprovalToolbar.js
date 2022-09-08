import arrowIosBackFill from '@iconify/icons-eva/arrow-ios-back-fill';
import arrowIosForwardFill from '@iconify/icons-eva/arrow-ios-forward-fill';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import menuFill from '@iconify/icons-eva/menu-fill';
import refreshFill from '@iconify/icons-eva/refresh-fill';
import searchFill from '@iconify/icons-eva/search-fill';
import skipBackOutline from '@iconify/icons-eva/skip-back-outline';
import skipForwardOutline from '@iconify/icons-eva/skip-forward-outline';
import { Icon } from '@iconify/react';
import {
    Box, FormControl, IconButton, InputAdornment, OutlinedInput, Tooltip, Typography
} from '@material-ui/core';
// material
import { styled } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import React, { useState } from "react";
import { MHidden } from '../../components/@material-extend';
import useLocales from '../../hooks/useLocales';
// redux
import { setHideApprovalSidebar, setSearchKeyword } from '../../redux/slices/approval';
import { useDispatch, useSelector } from '../../redux/store';


// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
    height: 36,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 2)
}));

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
    height: 32,
    transition: theme.transitions.create(['box-shadow', 'width'], {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.shorter
    }),
    '&.Mui-focused': { boxShadow: theme.customShadows.z8 },
    '& fieldset': {
        borderWidth: `1px !important`,
        borderColor: `${theme.palette.grey[500_32]} !important`
    },
    [theme.breakpoints.up('md')]: {
        width: 240,
        flexDirection: 'row',
        '&.Mui-focused': { width: 280 }
    }
}));

// ----------------------------------------------------------------------

ApprovalToolbar.propTypes = {
    approvals: PropTypes.number.isRequired,
    onOpenSidebar: PropTypes.func,
    onRefresh: PropTypes.func
};

export default function ApprovalToolbar({
    approvals,
    onOpenSidebar,
    onRefresh,
    ...other
}) {
    const { translate } = useLocales();
    const dispatch = useDispatch();
    const { hideApprovalSidebar } = useSelector((state) => state.approval);
    const [keyword, setKeyword] = useState('')

    const handleHideApprovalSidebar = () => {
        dispatch(setHideApprovalSidebar(!hideApprovalSidebar));
    };
    const actionTooltip = hideApprovalSidebar ? 'Show' : 'Hide';

    const handleChangeKeyword = (keyword) => {
        setKeyword(keyword);
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            dispatch(setSearchKeyword(keyword));
        }
    }

    return (
        <RootStyle {...other}>
            <MHidden width="mdUp">
                <IconButton onClick={onOpenSidebar}>
                    <Icon icon={menuFill} />
                </IconButton>
            </MHidden>

            <MHidden width="smDown">
                <Tooltip title={`${actionTooltip} Approval Sidebar`}>
                    <IconButton onClick={handleHideApprovalSidebar}>
                        {hideApprovalSidebar ? <LastPage /> : <FirstPage />}
                    </IconButton>
                </Tooltip>
                <Tooltip title="Refresh">
                    <IconButton onClick={onRefresh}>
                        <Icon icon={refreshFill} width={20} height={20} />
                    </IconButton>
                </Tooltip>
                {/* <Tooltip title="More">
                    <IconButton>
                        <Icon icon={moreVerticalFill} width={20} height={20} />
                    </IconButton>
                </Tooltip> */}
            </MHidden>

            <Box sx={{ flexGrow: 1 }} />

            <FormControl size="small">
                <SearchStyle
                    onKeyPress={handleKeyPress}
                    placeholder="Search Approval…"
                    onChange={(e) => handleChangeKeyword(e.target.value)}
                    startAdornment={
                        <InputAdornment position="start">
                            <Box component={Icon} icon={searchFill} sx={{ color: 'text.disabled' }} size='small' />
                        </InputAdornment>
                    }
                />
            </FormControl>

            <MHidden width="smDown">
                <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <Typography variant="body2" sx={{ mx: 2, color: 'text.secondary' }}>
                        1 - {approvals} {translate(`typo.of`)} {approvals}
                    </Typography>
                    <Tooltip title="Next page">
                        <IconButton>
                            <Icon icon={arrowIosBackFill} width={20} height={20} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Previous page">
                        <IconButton>
                            <Icon icon={arrowIosForwardFill} width={20} height={20} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </MHidden>
        </RootStyle>
    );
}
