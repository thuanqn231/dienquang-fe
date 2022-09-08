// material
import { Card, Container, Divider } from '@material-ui/core';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// components
import Page from '../../components/Page';
import { DialogDragable } from '../../components/animate';
import { getPageName } from '../../utils/pageConfig';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { getUnreadApproval, getApprovalById, setSelectedSidebarItem, openApprovalDetailModal, closeApprovalDetailModal } from '../../redux/slices/approval';
import ApprovalCreate from './ApprovalCreate';
import ApprovalDetails from './ApprovalDetails';
import ApprovalList from './ApprovalList';
import ApprovalSidebar from './ApprovalSidebar';

// ----------------------------------------------------------------------
const pageCode = 'menu.system.approvalManagement.approvalManagement.approval.approval';
export default function Approval() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { approvalId } = useParams();
    const { selectedApprovalId, hideApprovalList, hideApprovalSidebar, isOpenApprovalDetail } = useSelector((state) => state.approval);
    const [openSidebar, setOpenSidebar] = useState(false);
    const [openCompose, setOpenCompose] = useState(false);
    const minusWidth = hideApprovalSidebar ? 0 : 200;
    const contentWidth = (!selectedApprovalId || hideApprovalList) ? `calc(100vw - ${minusWidth}px)` : `calc((100vw - ${minusWidth}px)/2)`;

    useEffect(() => {
        dispatch(getUnreadApproval());
    }, [dispatch]);

    useEffect(async () => {
        if(approvalId) {
            await dispatch(getApprovalById(approvalId));
            dispatch(setSelectedSidebarItem('pending'));
            dispatch(openApprovalDetailModal());
        }
    }, [approvalId]);

    const handleCloseApprovalDetailModal = () => {
        navigate('/pages/SM02010102');
        dispatch(closeApprovalDetailModal());
    }

    return (
        <Page title={getPageName(pageCode)} >
            <Container sx={{ px: `0px !important` }} maxWidth={false}>
                <Card sx={{ height: { md: `calc(100vh - 155px)` }, display: { md: 'flex' }, py: 1, px: 1 }}>
                    {!hideApprovalSidebar &&
                        <>
                            <Card sx={{ width: 200 }}>
                                <ApprovalSidebar
                                    isOpenSidebar={openSidebar}
                                    onCloseSidebar={() => setOpenSidebar(false)}
                                    onOpenCompose={() => setOpenCompose(true)}
                                /></Card>
                            <Divider orientation="vertical" flexItem />
                        </>
                    }
                    {!hideApprovalList && <Card sx={{ width: contentWidth }}>
                        <ApprovalList onOpenSidebar={() => setOpenSidebar(true)} />
                    </Card>
                    }
                    {selectedApprovalId &&
                        <>
                            <Divider orientation="vertical" flexItem />
                            <Card sx={{ width: contentWidth, height: '100%' }}>
                                <ApprovalDetails />
                            </Card>
                        </>
                    }
                    <ApprovalCreate isOpenCompose={openCompose} onCloseCompose={() => setOpenCompose(false)} />
                </Card>
            </Container>
            {
                approvalId && 
                <DialogDragable
                  title='Approval'
                  maxWidth="xl"
                  open={isOpenApprovalDetail}
                  onClose={handleCloseApprovalDetailModal}
                >
                  <ApprovalDetails />
                </DialogDragable>
            }
        </Page>
    );
}
//