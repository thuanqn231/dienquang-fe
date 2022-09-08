import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import FirstPage from '@material-ui/icons/FirstPage';
import { makeStyles } from '@material-ui/styles';
import LastPage from '@material-ui/icons/LastPage';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Container,
  DialogActions,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
  Tooltip,
  IconButton
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { useSnackbar } from 'notistack5';
import { useState, useEffect, useRef } from 'react';
import { isEmpty, isUndefined } from 'lodash-es';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogDragable } from '../../components/animate';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { Dropdown, DthButtonPermission } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
import { mutate, query } from '../../core/api';
// hooks
import useSettings from '../../hooks/useSettings';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import { useDispatch, useSelector } from '../../redux/store';
import { setSearchParams, getLossMasterDropdown, resetSearchParams } from '../../redux/slices/lossManagement';
import { setSelectedWidget } from '../../redux/slices/page';
// utils
import { getPageName, getGridConfig, parseOrgSearchFactory } from '../../utils/pageConfig';

// --------------------------------------------------
import UserNewForm from './EmployeeProfile';

const pageCode = 'menu.system.authorizationManagement.userAuthorization.employeeInfo.profile';


const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function EmployeeProfileList() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { selectedWidget } = useSelector((state) => state.page);
  const { userGridConfig, updateAgGridConfig, funcPermission, user } = useAuth();
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [columns, setColumns] = useState(null);
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [selectedLossMasterId, setselectedLossMasterId] = useState(null);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const pageSelectedWidget = selectedWidget[pageCode];


  useEffect(() => {
    const currentPage = funcPermission.filter((permission) => permission.code === pageCode);

    if (!isEmpty(currentPage) && !isEmpty(currentPage[0].widgets)) {
      const activeWidgets = currentPage[0].widgets.filter((widget) => widget.permissions.includes('READ'));
      setListOfWidgets(activeWidgets);
      if (!isEmpty(activeWidgets) && isUndefined(pageSelectedWidget)) {
        dispatch(
          setSelectedWidget(
            {
              ...selectedWidget,
              [pageCode]:
              {
                widgetCode: activeWidgets[0].code,
                widgetName: activeWidgets[0].name
              }
            }
          )
        );
      }
    }
  }, [funcPermission]);

  useEffect(() => {
    query({
      url: `v1/user/${user.id}`,
      featureCode: 'user.create'
    }).
      then(
        (res) => setCurrentUser(res.data)
      )
  }, [user])
  const onLoadData = () => {
    query({
      url: `v1/user/${user.id}`,
      featureCode: 'user.create'
    }).
      then(
        (res) => setCurrentUser(res.data)
      )
  }

  return (
    <Page title={getPageName(pageCode)}>
      <Container sx={{ px: `0px !important` }} maxWidth>
        <Grid container spacing={0} sx={{ px: 0, height: `100%` }}>

          <Grid item xs={12} md={12}>
            <Card sx={{ pr: 1, borderRadius: '0px', height: '60px' }}>
              <Stack direction="row-reverse" alignItems="center" justifyContent="space-between" sx={{ my: 0 }}>
                {/* <Tooltip title={`${actionTooltip} Filters`}>
                  <IconButton onClick={handleHideFilters}>{hideFilters ? <LastPage /> : <FirstPage />}</IconButton>
                </Tooltip> */}

                <HeaderBreadcrumbs
                  activeLast
                  pageCode={pageCode}

                />
              </Stack>
            </Card>

            <Card
              sx={{
                p: 1,
                borderRadius: '0px',
                display: 'row',
                height: 'calc(100% - 60px)',
                minHeight: { xl: `calc((78vh))` }
              }}
            >
              <UserNewForm currentUser={currentUser} onLoadData={onLoadData} />
            </Card>


          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}