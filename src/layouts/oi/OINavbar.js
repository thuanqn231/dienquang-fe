import settings2Fill from '@iconify/icons-eva/settings-2-fill';
import { Icon } from '@iconify/react';
import { AppBar, Box, Container, IconButton, Stack, Toolbar, Tooltip, Typography, Link } from '@material-ui/core';
import { DatePicker } from '@material-ui/lab';
// material
import { useState } from 'react';
import { styled } from '@material-ui/core/styles';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Link as RedirectLink } from 'react-router-dom';
// components
import Timer from '../../components/Timer';
// hooks
import useOffSetTop from '../../hooks/useOffSetTop';
import ExternalLinkPopover from '../main/ExternalLinkPopover';
import useLocales from '../../hooks/useLocales';

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 60;
const APP_BAR_DESKTOP = 60;

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
    minHeight: APP_BAR_MOBILE,
    maxHeight: APP_BAR_MOBILE,
    backgroundImage: `linear-gradient(to right, #23365a, #192c3c, #192c3c, #192c3c, #23365a)`,
    color: theme.palette.common.white,
    border: `solid 1px ${theme.palette.grey[500_8]}`,
    paddingLeft: 0,
    paddingRight: 0,
    transition: theme.transitions.create(['height', 'background-color'], {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.shorter
    }),
    [theme.breakpoints.up('md')]: {
        minHeight: APP_BAR_DESKTOP,
        maxHeight: APP_BAR_DESKTOP,
    }
}));

const useStyles = makeStyles((theme) =>
    createStyles({
        notchedOutline: {
            borderWidth: "1px",
            borderColor: "yellow !important",
            color: 'white'
        },
        input: {
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem',
        }
    })
);

// ----------------------------------------------------------------------

export default function FmbNavbar() {
    const isOffset = useOffSetTop(60);
    const [value, setValue] = useState(new Date());
    const classes = useStyles();
    const { translate } = useLocales();

    return (
        <AppBar sx={{ boxShadow: 0, bgcolor: 'white' }}>
            <ToolbarStyle
                disableGutters
                sx={{
                    ...(isOffset && {
                        bgcolor: `background.default`
                    })
                }}
            >
                <Container
                    maxWidth={false}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <Typography variant="h3" sx={{ color: 'common.white', mx: 0.5 }} noWrap>
                        {`${translate(`typo.production_result`)}> ${translate(`typo.assembly_line_1`)}  > ${translate(`typo.final_xx60`)}`}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Stack direction="row" alignItems="center" spacing={0}>
                        <ExternalLinkPopover />
                        <Typography variant="h4" sx={{ color: 'common.white', mx: 0.5 }} noWrap>192.168.1.1</Typography>
                        <Tooltip title="Settings">
                            <IconButton sx={{ color: 'common.white' }}>
                                <Icon icon={settings2Fill} width={48} height={48} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Container>
            </ToolbarStyle>
        </AppBar>
    );
}
