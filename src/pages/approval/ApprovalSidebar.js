import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import plusFill from '@iconify/icons-eva/plus-fill';
import roundLabelImportant from '@iconify/icons-ic/round-label-important';
import { Icon } from '@iconify/react';
// material
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Divider, Drawer, List, Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { MHidden } from '../../components/@material-extend';
//
import Scrollbar from '../../components/Scrollbar';
import ApprovalSidebarItem from './ApprovalSidebarItem';
import useLocales from '../../hooks/useLocales';
import { useSelector } from '../../redux/store';

// ----------------------------------------------------------------------

ApprovalSidebar.propTypes = {
    isOpenSidebar: PropTypes.bool,
    onOpenCompose: PropTypes.func,
    onCloseSidebar: PropTypes.func
};

export default function ApprovalSidebar({ isOpenSidebar, onOpenCompose, onCloseSidebar }) {
    const { translate } = useLocales();
    const { unreadApproval } = useSelector((state) => state.approval);
    useEffect(() => {
        if (isOpenSidebar) {
            onCloseSidebar();
        }
    }, [isOpenSidebar, onCloseSidebar]);

    const handleOpenCompose = () => {
        onCloseSidebar();
        onOpenCompose();
    };

    // @TODO: need to manage on DB
    const labels = [
        { id: 'submission', type: 'system', name: 'submission', unreadCount: 0 },
        { id: 'postponed', type: 'system', name: 'postponed', unreadCount: 0 },
        { id: 'pending', type: 'system', name: 'pending', unreadCount: unreadApproval?.pending || 0 },
        { id: 'approved', type: 'system', name: 'approved', unreadCount: 0 },
        { id: 'notification', type: 'system', name: 'notification', unreadCount: unreadApproval?.notification || 0 },
        {
            id: 'important',
            type: 'custom',
            name: 'important',
            unreadCount: 2,
            icon: roundLabelImportant,
            color: '#1890FF'
        },
        {
            id: 'customize_filter',
            type: 'custom',
            name: 'customize filter',
            unreadCount: 1,
            icon: roundLabelImportant,
            color: '#FFC107'
        }
    ];

    const ACCORDIONS =
        [
            {
                value: `approval_folder`,
                heading: `Approval Folder`,
                defaultExpanded: true,
                detail:
                    <List disablePadding>
                        {labels.filter(label => label.type === 'system').map((label) => (
                            <ApprovalSidebarItem key={label.id} label={label} />
                        ))}
                    </List>
            },
            // {
            //     value: `filter`,
            //     heading: `Filter`,
            //     defaultExpanded: true,
            //     detail:
            //         <List disablePadding>
            //             {labels.filter(label => label.type === 'custom').map((label) => (
            //                 <ApprovalSidebarItem key={label.id} label={label} />
            //             ))}
            //         </List>
            // }
        ];

    const renderContent = (
        <Scrollbar>
            <Box sx={{ p: 1 }}>
                <Button fullWidth variant="contained" startIcon={<Icon icon={plusFill} />} onClick={handleOpenCompose}>
                    {translate(`button.create_approval`)}
                </Button>
            </Box>

            <Divider />
            {
                ACCORDIONS.map((accordion, index) => (
                    <Accordion key={accordion.value} disabled={index === 3} defaultExpanded={accordion.defaultExpanded}>
                        <AccordionSummary expandIcon={<Icon icon={arrowIosDownwardFill} width={20} height={20} />}>
                            <Typography variant="subtitle1">{accordion.heading}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                            {accordion.detail}
                        </AccordionDetails>
                    </Accordion>
                ))
            }
        </Scrollbar>
    );

    return (
        <>
            <MHidden width="mdUp">
                <Drawer
                    open={isOpenSidebar}
                    onClose={onCloseSidebar}
                    ModalProps={{ keepMounted: true }}
                    PaperProps={{ sx: { width: 200 } }}
                >
                    {renderContent}
                </Drawer>
            </MHidden>

            <MHidden width="mdDown">
                <Drawer variant="permanent" PaperProps={{ sx: { width: 200, position: 'relative' } }}>
                    {renderContent}
                </Drawer>
            </MHidden>
        </>
    );
}
