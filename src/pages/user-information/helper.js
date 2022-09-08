import { query } from '../../core/api';
import { stateParam } from '../../core/constants';

export const BASE_URL = '/v1/user';

export const pageCode = 'menu.system.authorizationManagement.userAuthorization.userAuthorization.userAuthorization';

export const widgets = ['userInfo', 'userAuthorization'];

export const isRenderAllOrgChart = false;

export const getWidgetCode = (widget) => `${pageCode}.${widget}`;

const getTableCode = (widget) => `${widget}List`;

const getGridConfigs = () => {
    const gridConfigs = {};
    widgets.forEach((widget) => {
        const widgetCode = getWidgetCode(widget);
        const tableCode = getTableCode(widget);
        gridConfigs[widgetCode] = {
            tableCode,
            searchUrl: '/v1/user/search-v2'
        }
    });
    return gridConfigs;
}

export const gridConfigs = getGridConfigs();

const defaultSearchParams = [
    {
        type: 'textfield',
        id: 'code',
        label: 'Employee ID',
        defaultValue: ''
    },
    {
        type: 'textfield',
        id: 'fullName',
        label: 'Employee Name',
        defaultValue: ''
    },
    {
        type: 'textfield',
        id: 'userName',
        label: 'User ID',
        defaultValue: ''
    },
    stateParam
];

export const initSearchParams = {
    [getWidgetCode('userInfo')]: [
        ...defaultSearchParams
    ],
    [getWidgetCode('userAuthorization')]: [
        ...defaultSearchParams
    ],
}