import { Card, Divider, Link } from '@material-ui/core';
// material
import { styled } from '@material-ui/core/styles';
import { isUndefined } from 'lodash-es';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import EmptyContent from '../../components/EmptyContent';
import { AgGrid } from '../../core/wrapper';
import { toStringCaseCapitalize } from '../../utils/formatString';
import { fDateTime } from '../../utils/formatTime';
//
import { mutate } from '../../core/api';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import useSettings from '../../hooks/useSettings';
// redux
import { getApprovalById, getApprovals, getIncomeApprovals, selectApproval } from '../../redux/slices/approval';
import { useDispatch, useSelector } from '../../redux/store';
import { getGridConfig } from '../../utils/pageConfig';
import ApprovalToolbar from './ApprovalToolbar';
import { PriorityCellRenderer } from './PriorityCellRenderer';

// ----------------------------------------------------------------------

const RootStyle = styled('div')({
    flexGrow: 1,
    display: 'flex',
    overflow: 'hidden',
    flexDirection: 'column'
});

// ----------------------------------------------------------------------

ApprovalList.propTypes = {
    onOpenSidebar: PropTypes.func
};

const pageCode = 'menu.system.approvalManagement.approvalManagement.approval.approval';
const tableCode = 'approvalList';

export default function ApprovalList({ onOpenSidebar }) {
    const dispatch = useDispatch();
    const { translate, currentLang } = useLocales();
    const { approvals, selectedSidebarItem, sidebarMapParams, searchKeyword, selectedApprovalId } = useSelector((state) => state.approval);
    const { userGridConfig, user } = useAuth();
    const { themeAgGridClass } = useSettings();
    const [rowData, setRowData] = useState(null);
    const [columns, setColumns] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const isEmpty = approvals.allIds.length < 1;
    useEffect(() => {
        const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
        tableConfigs.forEach((column) => {
            column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
            if (column.field === 'priority') {
                column.cellRendererFramework = (params) => PriorityCellRenderer(params);
            }
        });
        setColumns(tableConfigs);
    }, [userGridConfig]);

    useEffect(() => {
        if (columns) {
            const tableConfigs = [...columns];
            tableConfigs.forEach((column) => {
                column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
            });
            setColumns(tableConfigs);
        }
    }, [currentLang]);

    useEffect(() => {
        handleGetApprovals();
    }, [dispatch]);

    useEffect(() => {
        if (gridApi) {
            // gridApi.sizeColumnsToFit();
            gridApi.forEachNode((node) => {
                node.setSelected(node.data.factoryPk === selectedApprovalId);
            });
        }
    }, [rowData]);

    useEffect(() => {
        let data = [];
        if (approvals) {
            data = approvals.allIds.map((approvalId) => {
                const approval = approvals.byId[approvalId];
                let isRead = true;
                let documentApprovalStates = null;
                const approver = approval.documentApprovalStates.find((approver) => `${approver.userPk.factoryCode}-${approver.userPk.id}` === user.id);
                if (approver?.state) {
                    isRead = approver?.state !== 'NOTIFIED';
                    documentApprovalStates = approver?.pk;
                }
                return {
                    factoryPk: approval.factoryPk,
                    isAttached: !isUndefined(approval.attachedFiles) && approval.attachedFiles.length > 0,
                    requester: approval.userRequest.fullName,
                    title: approval.title,
                    priority: approval.priority.name,
                    status: toStringCaseCapitalize(approval.state, "_"),
                    requestedTime: fDateTime(approval.requestTime),
                    approvedTime: fDateTime(approval.approvedTime),
                    isRead,
                    documentApprovalStates
                };
            })
        }
        updateData(data);
    }, [approvals]);

    useEffect(() => {
        handleGetApprovals();
    }, [searchKeyword]);


    const handleGetApprovals = () => {
        const approvalParams = {
            ...sidebarMapParams[selectedSidebarItem],
            searchKeyword
        };
        if (['submission', 'postponed'].indexOf(selectedSidebarItem) !== -1) {
            dispatch(getApprovals(approvalParams));
        } else {
            dispatch(getIncomeApprovals(approvalParams));
        }
    }

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        setGridApi(params.api);
    };

    const updateData = (data) => {
        setRowData(data);
    };

    const handleSelectApproval = async (approvalId) => {
        await dispatch(selectApproval(approvalId));
        await dispatch(getApprovalById(approvalId));
    }

    const updateToRead = async (approverState) => {
        if (approverState) {
            await mutate({
                url: '/document-request/approval-state/update-to-read',
                data: {
                    pk: {
                        factoryCode: approverState.factoryCode,
                        id: approverState.id
                    }
                },
                method: 'post',
                featureCode: 'user.create'
            })
        }
    }

    const onSelectionChanged = (event) => {
        const rowCount = event.api.getSelectedNodes().length;
        if (rowCount === 0) {
            dispatch(selectApproval(null));
        }
        if (rowCount === 1) {
            const { documentApprovalStates, factoryPk } = event.api.getSelectedNodes()[0].data;
            handleSelectApproval(factoryPk);
            updateToRead(documentApprovalStates);
        }
        if (gridApi) {
            gridApi.sizeColumnsToFit();
        }
    }

    const rowClassRules = useMemo(() => ({
        'unread-approval': (params) => {
            const { isRead } = params.data;
            return !isRead;
        }
    }), []);

    return (
        <RootStyle>
            <ApprovalToolbar
                approvals={approvals.allIds.length}
                onOpenSidebar={onOpenSidebar}
                onRefresh={handleGetApprovals}
            />

            <Divider />

            {!isEmpty ? (

                <Card
                    sx={{
                        p: 1,
                        borderRadius: '0px',
                        display: 'row',
                        height: 'calc(82vh - 60px)',
                        minHeight: { xs: `calc((82vh - 100px))` }
                    }}
                >
                    <AgGrid
                        columns={columns}
                        rowData={rowData}
                        className={themeAgGridClass}
                        onGridReady={onGridReady}
                        onSelectionChanged={onSelectionChanged}
                        rowSelection="single"
                        width="100%"
                        height="100%"
                        rowClassRules={rowClassRules}
                    />
                </Card>
            ) : (
                <EmptyContent
                    title={translate(`typo.noApproval`)}
                    img="/static/illustrations/illustration_empty_mail.svg"
                    sx={{ flexGrow: 1, height: 'auto' }}
                />
            )}
        </RootStyle>
    );
}
