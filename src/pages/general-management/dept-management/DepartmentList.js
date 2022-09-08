import closeFill from '@iconify/icons-eva/close-fill';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Icon } from '@iconify/react';
import { Button, Card, Stack, TextField, Typography } from '@material-ui/core';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import { useEffect, useState } from 'react';
import "react-checkbox-tree/lib/react-checkbox-tree.css";
import { MIconButton } from '../../../components/@material-extend';
import { DialogAnimate } from '../../../components/animate';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
import SearchPage from '../../../core/layout/SearchPage';
import { SelectField } from '../../../core/wrapper';
import { PATH_PAGES } from '../../../routes/paths';
import DepartmentForm from './DepartmentForm';
import useLocales from '../../../hooks/useLocales';

// ----------------------------------------------------------------------

const SearchConfig = () => (
    <>

        <TextField
            id="manuf"
            label='Manuf.'
            size="small"
            InputLabelProps={{
                shrink: true,
            }}
            sx={{ py: 1, width: '100%' }}
        />
        <TextField
            id="manuf2"
            label='Manuf.'
            size="small"
            InputLabelProps={{
                shrink: true,
            }}
            sx={{ py: 1, width: '100%' }}
        />
        <SelectField
            InputLabelProps={{
                shrink: true,
            }}
            inputWidth="100%"
            id="OWP_MBR.MBRPLANT"
            name="OWP_MBR.MBRPLANT"
            groupId="D019000"
            isMulti
            useAll
        />
    </>
);

function loadServerRows(page, data) {
    console.log("data", data);
    console.log("page", page);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(data.slice(page * 25, (page + 1) * 25));
        }, Math.random() * 500 + 100); // simulate network latency
    });
}

const data = [
    { id: 1, DEPT_NM: 'Marketing and business development', DEPT_CD: 'A000001', DEPT_LEADER: '오성호' },
    { id: 2, DEPT_NM: 'Design', DEPT_CD: 'A000002', DEPT_LEADER: '김현준' },
    { id: 3, DEPT_NM: 'Merchandising', DEPT_CD: 'A000003', DEPT_LEADER: '황근주' },
    { id: 4, DEPT_NM: 'Pattern Making, CAD', DEPT_CD: 'A000004', DEPT_LEADER: '최상락' },
    { id: 5, DEPT_NM: 'Sampling', DEPT_CD: 'A000005', DEPT_LEADER: '유용채' },
    { id: 6, DEPT_NM: 'Fabric Store and fabric sourcing', DEPT_CD: 'A000006', DEPT_LEADER: '김태윤' },
    { id: 7, DEPT_NM: 'Trims and Accessory Store', DEPT_CD: 'A000007', DEPT_LEADER: '이상구' },
    { id: 8, DEPT_NM: 'Fabric Testing Lab', DEPT_CD: 'A000008', DEPT_LEADER: '김상화' },
    { id: 9, DEPT_NM: 'Production Planning and Control', DEPT_CD: 'A000009', DEPT_LEADER: '황희준' },
    { id: 10, DEPT_NM: 'Cutting', DEPT_CD: 'A000010', DEPT_LEADER: '김춘영' },
    { id: 11, DEPT_NM: 'Sewing', DEPT_CD: 'A000011', DEPT_LEADER: '신재욱' },
    { id: 12, DEPT_NM: 'Quality Control', DEPT_CD: 'A000012', DEPT_LEADER: '유병용' },
    { id: 13, DEPT_NM: 'Machine Maintenance', DEPT_CD: 'A000013', DEPT_LEADER: '유계상' },
    { id: 14, DEPT_NM: 'Garment Washing', DEPT_CD: 'A000014', DEPT_LEADER: '도은주' },
    { id: 15, DEPT_NM: 'Finishing', DEPT_CD: 'A000015', DEPT_LEADER: '양순하' },
    { id: 16, DEPT_NM: 'Printing', DEPT_CD: 'A000016', DEPT_LEADER: '최인수' },
    { id: 17, DEPT_NM: 'Embroidery', DEPT_CD: 'A000017', DEPT_LEADER: '차명환' },
    { id: 18, DEPT_NM: 'Industrial Engineering', DEPT_CD: 'A000018', DEPT_LEADER: '함병재' },
    { id: 19, DEPT_NM: 'EDP / IT', DEPT_CD: 'A000019', DEPT_LEADER: '정상국' },
    { id: 20, DEPT_NM: 'Accounting', DEPT_CD: 'A000020', DEPT_LEADER: '김현영' },
    { id: 21, DEPT_NM: 'Human Resource and Administration', DEPT_CD: 'A000021', DEPT_LEADER: '황재광' },
    { id: 22, DEPT_NM: 'Shipping and documentation', DEPT_CD: 'A000022', DEPT_LEADER: '장지희' },
    { id: 23, DEPT_NM: 'Process R&D', DEPT_CD: 'A000023', DEPT_LEADER: '전수옥' },
    { id: 24, DEPT_NM: 'Maintenance', DEPT_CD: 'A000024', DEPT_LEADER: '이원종' },
    { id: 25, DEPT_NM: 'Corporate Support', DEPT_CD: 'A000025', DEPT_LEADER: '이경수' },
    { id: 26, DEPT_NM: 'Mgmt. Innovation', DEPT_CD: 'A000026', DEPT_LEADER: '고기호' },
    { id: 27, DEPT_NM: 'SCM', DEPT_CD: 'A000027', DEPT_LEADER: '이대연' },
    { id: 28, DEPT_NM: 'Purchasing', DEPT_CD: 'A000028', DEPT_LEADER: '신명현' },
    { id: 29, DEPT_NM: 'SHE', DEPT_CD: 'A000029', DEPT_LEADER: '정선희' },
    { id: 30, DEPT_NM: 'TFT', DEPT_CD: 'A000030', DEPT_LEADER: '정구영' },
    { id: 31, DEPT_NM: 'HR Training', DEPT_CD: 'A000031', DEPT_LEADER: '김종학' },
    { id: 32, DEPT_NM: 'WH Management', DEPT_CD: 'A000032', DEPT_LEADER: '김선미' },
    { id: 33, DEPT_NM: 'General Affair', DEPT_CD: 'A000033', DEPT_LEADER: '이정우' },
    { id: 34, DEPT_NM: 'Export', DEPT_CD: 'A000034', DEPT_LEADER: '최혜옥' },
    { id: 35, DEPT_NM: 'Import', DEPT_CD: 'A000035', DEPT_LEADER: '박은정' },
    { id: 36, DEPT_NM: 'Custom Clearance', DEPT_CD: 'A000036', DEPT_LEADER: '김미옥' },
    { id: 37, DEPT_NM: 'Customer Service', DEPT_CD: 'A000037', DEPT_LEADER: '김소영' },
    { id: 38, DEPT_NM: 'Pro-3M', DEPT_CD: 'A000038', DEPT_LEADER: '한진희' },
    { id: 39, DEPT_NM: 'EHS', DEPT_CD: 'A000039', DEPT_LEADER: '양승묵' },
    { id: 40, DEPT_NM: 'Security', DEPT_CD: 'A000040', DEPT_LEADER: '이선희' },
];

const DataConfig = () => {
    const [pageSize, setPageSize] = useState(25);
    const [page, setPage] = useState(0);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentDept, setCurrentDept] = useState({});
    const [isOpenModal, setIsOpenModal] = useState(false);
    const { translate } = useLocales()
    const handleCloseModal = () => {
        setIsOpenModal(false);
    };

    const handleOpenModal = () => {
        setIsOpenModal(true);
    };

    const columns = [
        // { field: 'id', headerName: 'id', hide: true },
        {
            field: 'DEPT_NM',
            headerName: 'Department Name',
            minWidth: 250,
            flex: 1,
            editable: true,
        },
        {
            field: 'DEPT_CD',
            headerName: 'Department Code',
            minWidth: 250,
            flex: 1,
            editable: true,
        },
        {
            field: 'DEPT_LEADER',
            headerName: 'Leader',
            minWidth: 250,
            flex: 1,
            editable: true,
        },
        {
            field: 'VIEW',
            headerName: 'View',
            renderCell: (params) => (
                <strong>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => viewDetailDepartment(params)}
                    >
                        {translate(`button.view`)}
                    </Button>
                </strong>
            ),
        }
    ];

    const viewDetailDepartment = (params) => {
        console.log("viewDetailDepartment", params?.row);
        setCurrentDept(params?.row)
        handleOpenModal();
    }

    useEffect(() => {
        let active = true;

        (async () => {
            setLoading(true);
            const newRows = await loadServerRows(page, data);

            if (!active) {
                return;
            }
            console.log("newRows", newRows);
            setRows(newRows);
            setLoading(false);
        })();

        return () => {
            active = false;
        };
    }, [page]);
    return (
        <>
            <Card sx={{ p: 1, borderRadius: '0px', height: '10%' }}>
                <HeaderBreadcrumbs
                    sx={{ mt: 1 }}
                    heading="Department Management"
                    links={[
                        { name: 'Dashboard', href: PATH_PAGES.root },
                        { name: 'User', href: PATH_PAGES.user.root },
                        { name: 'List' }
                    ]}
                    action={
                        <>
                            <Button
                                sx={{ marginRight: '5px' }}
                                variant="contained"
                                startIcon={<Icon icon={plusFill} width={20} height={20} />}
                            >
                                {translate(`button.add`)}
                            </Button>
                            <Button
                                sx={{ marginRight: '5px' }}
                                variant="contained"
                                startIcon={<Icon icon={plusFill} width={20} height={20} />}
                            >
                                {translate(`button.tabs`)}
                            </Button>
                        </>
                    }
                />
            </Card>
            <Card sx={{ p: 1, borderRadius: '0px', height: '90%', minHeight: { xs: `calc(80vh - 100px)` } }}>
                <DataGrid
                    pagination
                    pageSize={pageSize}
                    onPageSizeChange={(newPageSize) => typeof newPageSize === 'object' ? setPageSize(newPageSize.pageSize) : setPageSize(newPageSize)}
                    rowsPerPageOptions={[25, 50, 100]}
                    rows={rows}
                    columns={columns}
                    checkboxSelection
                    disableSelectionOnClick
                    density="compact"
                    components={{
                        Toolbar: GridToolbar,
                    }}
                    rowCount={40}
                    paginationMode="server"
                    onPageChange={(newPage) => typeof newPage === 'object' ? setPage(newPage.page) : setPage(newPage)}
                    loading={loading}
                />
            </Card>
            <DialogAnimate maxWidth="lg" open={isOpenModal} onClose={handleCloseModal}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 0, pr: 1, pl: 2.5 }}>
                    <Typography variant="subtitle1">{translate(`typo.view_detail`)}</Typography>
                    <MIconButton onClick={handleCloseModal}>
                        <Icon icon={closeFill} width={20} height={20} />
                    </MIconButton>
                </Stack>
                <DepartmentForm isEdit={false} currentDept={currentDept} onCancel={handleCloseModal} />
            </DialogAnimate>
        </>
    );
}

const onInquiry = () => {
    console.log("onInquiry");
}

export default function DepartmentList() {
    return (
        <>
            <SearchPage pageTitle="Department List" searchConfig={<SearchConfig />} dataConfig={<DataConfig />} onInquiry={() => onInquiry()} />
        </>
    );
}
