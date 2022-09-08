import closeFill from '@iconify/icons-eva/close-fill';
import plusFill from '@iconify/icons-eva/plus-fill';
import refreshFill from '@iconify/icons-eva/refresh-fill';
import searchFill from '@iconify/icons-eva/search-fill';
import { Icon } from '@iconify/react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography
} from '@material-ui/core';
// material
import { useTheme } from '@material-ui/core/styles';
import FavoriteIcon from '@material-ui/icons/Favorite';
import PersonPinIcon from '@material-ui/icons/PersonPin';
import PhoneIcon from '@material-ui/icons/Phone';
import { DateRangePicker } from '@material-ui/lab';
import { createStyles, makeStyles } from '@material-ui/styles';
import { sentenceCase } from 'change-case';
import { useEffect, useState } from 'react';
import { MIconButton } from '../../../components/@material-extend';
import { DialogAnimate } from '../../../components/animate';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
import Label from '../../../components/Label';
// components
import Page from '../../../components/Page';
import Scrollbar from '../../../components/Scrollbar';
import SearchNotFound from '../../../components/SearchNotFound';
import useLocales from '../../../hooks/useLocales';
// hooks
import useSettings from '../../../hooks/useSettings';
import { closeModal, deleteUser, getUserList, openModal } from '../../../redux/slices/user';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import AccountChangePassword from './AccountChangePassword';
import AccountGeneral from './AccountGeneral';
import AccountTabsChild from './AccountTabsChild';
import UserCreate from './UserCreate';
import UserListHead from './UserListHead';
import UserMoreMenu from './UserMoreMenu';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

const useStyles = makeStyles((theme) =>
  createStyles({
    table: {
      '& .MuiTableCell-root': {
        border: `solid 1px ${theme.palette.divider}`
      },
      '&:last-child th, &:last-child td': {
        borderRightWidth: 0
      },
      '&:first-child th, &:first-child td': {
        borderLeftWidth: 0
      }
    }
  })
);

const SCROLLABLE_TAB = [
  { value: '1', icon: <PhoneIcon />, label: 'Item 1', component: <AccountGeneral /> },
  { value: '2', icon: <FavoriteIcon />, label: 'Item 2', component: <AccountGeneral /> },
  { value: '3', icon: <PersonPinIcon />, label: 'Item 3', component: <AccountGeneral /> },
  { value: '4', icon: <PersonPinIcon />, label: 'Item 4', component: <AccountChangePassword /> },
  { value: '5', icon: <PersonPinIcon />, label: 'Item 5', component: <AccountChangePassword /> },
  { value: '6', icon: <PersonPinIcon />, label: 'Item 6', component: <AccountTabsChild /> },
  { value: '7', icon: <PersonPinIcon />, label: 'Item 7' },
  { value: '8', icon: <PhoneIcon />, label: 'Item 8' },
  { value: '9', icon: <FavoriteIcon />, label: 'Item 9' },
  { value: '10', icon: <PersonPinIcon />, label: 'Item 10' },
  { value: '11', icon: <PersonPinIcon />, label: 'Item 11' },
  { value: '12', icon: <PersonPinIcon />, label: 'Item 12' },
  { value: '13', icon: <PersonPinIcon />, label: 'Item 13' },
  { value: '14', icon: <PersonPinIcon />, label: 'Item 14' }
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export default function UserList() {
  const { themeStretch } = useSettings();
  const theme = useTheme();
  const dispatch = useDispatch();
  const classes = useStyles();
  const { userList, isOpenModal } = useSelector((state) => state.user);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const filterName = '';
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { translate } = useLocales();
  const [value, setValue] = useState([null, null]);
  const [isOpenModalTabs, setIsOpenModalTabs] = useState(false);
  const [valueScrollable, setValueScrollable] = useState('1');

  const TABLE_HEAD = [
    { id: 'name', label: translate(`table_header.name`), alignRight: false },
    { id: 'company', label: translate(`table_header.company`), alignRight: false },
    { id: 'role', label: translate(`table_header.role`), alignRight: false },
    { id: 'isVerified', label: translate(`table_header.verified`), alignRight: false },
    { id: 'status', label: translate(`table_header.status`), alignRight: false },
    { id: '' }
  ];

  const handleChangeScrollable = (event, newValue) => {
    setValueScrollable(newValue);
  };

  useEffect(() => {
    dispatch(getUserList());
  }, [dispatch]);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const handleOpenModal = () => {
    dispatch(openModal());
  };

  const handleCloseModalTabs = () => {
    setIsOpenModalTabs(false);
  };

  const handleOpenModalTabs = () => {
    setIsOpenModalTabs(true);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = userList.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteUser = (userId) => {
    dispatch(deleteUser(userId));
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - userList.length) : 0;

  const filteredUsers = applySortFilter(userList, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  return (
    <Page title="User: List | Điện Quang">
      <Box
        sx={{
          pt: 1,
          pb: 15,
          bgcolor: (theme) => (theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'),

          borderRadius: 1.5
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={10}>
            <Box sx={{ p: 3 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                <TextField fullWidth required label="Full Name" variant="standard" size="small" />
                <TextField fullWidth label="Email Address" variant="standard" size="small" />
                <Autocomplete
                  fullWidth
                  options={[
                    { title: 'The Shawshank Redemption', value: 1994 },
                    { title: 'The Godfather', value: 1972 },
                    { title: 'The Godfather: Part II', value: 1974 },
                    { title: 'The Dark Knight', value: 2008 },
                    { title: '12 Angry Men', value: 1957 },
                    { title: "Schindler's List", value: 1993 }
                  ]}
                  getOptionLabel={(option) => option.title}
                  renderInput={(params) => (
                    <TextField {...params} label="Department" margin="none" variant="standard" size="small" />
                  )}
                />
                <TextField fullWidth label="Phone Number" variant="standard" size="small" />
                <TextField fullWidth label="Phone Number" variant="standard" size="small" />
                <TextField fullWidth label="Phone Number" variant="standard" size="small" />
                <TextField fullWidth label="Full Name" variant="standard" size="small" />
                <DateRangePicker
                  startText="From"
                  endText="To"
                  value={value}
                  onChange={(newValue) => {
                    setValue(newValue);
                  }}
                  inputFormat="yyyy/MM/dd"
                  okText="OK"
                  renderInput={(startProps, endProps) => (
                    <>
                      <TextField
                        variant="standard"
                        size="small"
                        fullWidth
                        sx={{
                          width: 180
                        }}
                        {...startProps}
                      />
                      <Box sx={{ mx: 2 }}> to </Box>
                      <TextField
                        variant="standard"
                        sx={{
                          width: 180
                        }}
                        size="small"
                        fullWidth
                        {...endProps}
                      />
                    </>
                  )}
                />
                <FormControlLabel label="Ignore" control={<Checkbox defaultChecked />} />
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} md={2}>
            <Stack direction="row" alignItems="center" flexDirection="row-reverse">
              <Button
                sx={{ marginRight: '5px', mt: 3, bgcolor: 'text.disabled' }}
                variant="contained"
                startIcon={<Icon icon={refreshFill} width={20} height={20} />}
                onClick={handleOpenModal}
              >
                {translate(`button.reset`)}
              </Button>
              <Button
                sx={{ marginRight: '5px', mt: 3 }}
                variant="contained"
                startIcon={<Icon icon={searchFill} width={20} height={20} />}
                onClick={handleOpenModal}
              >
                {translate(`button.search`)}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ mt: -15 }}>
        <Card>
          {/* <HeaderBreadcrumbs
                        sx={{ mt: 1 }}
                        heading={translate('sidebar.user_mgt')}
                        action={
                            <>
                                <Button
                                    sx={{ marginRight: '5px' }}
                                    variant="contained"
                                    startIcon={<Icon icon={plusFill} width={20} height={20} />}
                                    onClick={handleOpenModal}
                                >
                                    {translate('button.new_user')}
                                </Button>
                                <Button
                                    sx={{ marginRight: '5px' }}
                                    variant="contained"
                                    startIcon={<Icon icon={plusFill} width={20} height={20} />}
                                    onClick={handleOpenModalTabs}
                                >
                                    Tabs
                                </Button>
                            </>
                        }
                    /> */}
          <Divider />
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, mt: 1, maxHeight: '65vh' }}>
              <Table stickyHeader>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={userList.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody className={classes.table}>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    // const { id, name, role, status, company, avatarUrl, isVerified } = row;
                    const id = row['IPX_USER.USERSEQ'];
                    const name = row['IPX_USER.USERNAME'];
                    const role = row.PERMISSIONID_CODENM;
                    const status = row['IPX_USER.FLAG'];
                    const company = row.DEPTID_CODENM;
                    const isVerified = 'Y';
                    const isItemSelected = selected.indexOf(name) !== -1;

                    return (
                      <TableRow
                        hover
                        key={id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={isItemSelected}
                        aria-checked={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, name)} />
                        </TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{company}</TableCell>
                        <TableCell align="left">{role}</TableCell>
                        <TableCell align="left">{isVerified ? 'Yes' : 'No'}</TableCell>
                        <TableCell align="left">
                          <Label
                            variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                            color={(status === 'banned' && 'error') || 'success'}
                          >
                            {sentenceCase(status)}
                          </Label>
                        </TableCell>

                        <TableCell align="right">
                          <UserMoreMenu onDelete={() => handleDeleteUser(id)} userName={name} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {isUserNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={userList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
      <DialogAnimate maxWidth="lg" open={isOpenModal} onClose={handleCloseModal}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2, pr: 1, pl: 2.5 }}>
          <Typography variant="subtitle1">{translate('button.new_user')}</Typography>
          <MIconButton onClick={handleCloseModal}>
            <Icon icon={closeFill} width={20} height={20} />
          </MIconButton>
        </Stack>
        <UserCreate isEdit={false} currentUser={{}} onCancel={handleCloseModal} />
        {/* <CalendarForm event={selectedEvent} range={selectedRange} onCancel={handleCloseModal} /> */}
      </DialogAnimate>
      <DialogAnimate maxWidth="lg" height="85vh" open={isOpenModalTabs} onClose={handleCloseModalTabs}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2, pr: 1, pl: 2.5 }}>
          <Typography variant="subtitle1">{translate(`typo.tabs`)}</Typography>
          <MIconButton onClick={handleCloseModalTabs}>
            <Icon icon={closeFill} width={20} height={20} />
          </MIconButton>
        </Stack>
        <Stack spacing={3} direction={{ xs: 'column', md: 'row' }}>
          <Box
            sx={{
              flexGrow: 1,
              width: '100%',
              maxWidth: 'lg',
              px: 3
            }}
          >
            <Tabs
              allowScrollButtonsMobile
              value={valueScrollable}
              variant="scrollable"
              scrollButtons="auto"
              onChange={handleChangeScrollable}
            >
              {SCROLLABLE_TAB.map((tab) => (
                <Tab key={tab.value} label={tab.label} value={tab.value} icon={tab.icon} />
              ))}
            </Tabs>
            {SCROLLABLE_TAB.map((tab) => {
              const isMatched = tab.value === valueScrollable;
              return (
                isMatched && (
                  <Box sx={{ py: 2, px: 1 }} key={tab.value}>
                    {tab.component}
                    <Divider sx={{ mt: 1 }} />
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button sx={{ mx: 1 }} variant="contained">
                        {translate(`button.save`)}
                      </Button>
                      <Button sx={{ ml: 1 }} variant="outlined" onClick={handleCloseModalTabs}>
                        {translate(`button.cancel`)}
                      </Button>
                    </Box>
                  </Box>
                )
              );
            })}
          </Box>
        </Stack>
      </DialogAnimate>
    </Page>
  );
}
