import { query } from '../../core/api';
import { stateParam } from '../../core/constants';

export const BASE_URL = '/v1/operation';

export const pageCode = 'menu.masterData.production.planningMasterData.operationHierarchy.organization';

export const widgets = ['factory', 'plant', 'team', 'group', 'part', 'line', 'process', 'workStation'];

export const isRenderAllOrgChart = true;

const getSearchUrl = (widget) => `/v1/operation/${widget.toLowerCase()}/search-v2`;

export const getWidgetCode = (widget) => `${pageCode}.${widget}`;

const getTableCode = (widget) => `${widget}List`;

const getGridConfigs = () => {
    const gridConfigs = {};
    widgets.forEach((widget) => {
        const widgetCode = getWidgetCode(widget);
        const tableCode = getTableCode(widget);
        const searchUrl = getSearchUrl(widget);
        gridConfigs[widgetCode] = {
            tableCode,
            searchUrl
        }
    });
    return gridConfigs;
}

export const gridConfigs = getGridConfigs();

const defaultStateSearchParams = [
    {
        type: 'textfield',
        id: 'rank',
        label: 'Sort Order',
        defaultValue: ''
    },
    stateParam
];

export const initSearchParams = {
    [getWidgetCode('factory')]: [
        {
            type: 'textfield',
            id: 'code',
            label: 'Factory Code',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'name',
            label: 'Factory Name',
            defaultValue: ''
        },
        ...defaultStateSearchParams
    ],
    [getWidgetCode('plant')]: [
        {
            type: 'textfield',
            id: 'code',
            label: 'Plant Code',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'name',
            label: 'Plant Name',
            defaultValue: ''
        },
        ...defaultStateSearchParams
    ],
    [getWidgetCode('team')]: [
        {
            type: 'textfield',
            id: 'code',
            label: 'Team Code',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'name',
            label: 'Team Name',
            defaultValue: ''
        },
        ...defaultStateSearchParams
    ],
    [getWidgetCode('group')]: [
        {
            type: 'textfield',
            id: 'code',
            label: 'Group Code',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'name',
            label: 'Group Name',
            defaultValue: ''
        },
        ...defaultStateSearchParams
    ],
    [getWidgetCode('part')]: [
        {
            type: 'textfield',
            id: 'code',
            label: 'Part Code',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'name',
            label: 'Part Name',
            defaultValue: ''
        },
        ...defaultStateSearchParams
    ],
    [getWidgetCode('line')]: [
        {
            type: 'textfield',
            id: 'code',
            label: 'Line Code',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'name',
            label: 'Line Name',
            defaultValue: ''
        },
        {
            type: 'dropdown',
            id: 'processType',
            label: 'Process Type',
            groupId: 'D014000',
            defaultValue: ''
        },
        {
            type: 'dropdown',
            id: 'productGroup',
            label: 'Product Group',
            groupId: 'D015000',
            defaultValue: ''
        },
        ...defaultStateSearchParams
    ],
    [getWidgetCode('process')]: [
        {
            type: 'textfield',
            id: 'code',
            label: 'Process Code',
            defaultValue: ''
        },
        {
            type: 'dropdown',
            id: 'name',
            label: 'Process Name',
            groupId: 'D016000',
            defaultValue: ''
        },
        ...defaultStateSearchParams
    ],
    [getWidgetCode('workStation')]: [
        {
            type: 'textfield',
            id: 'code',
            label: 'Work Station Code',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'name',
            label: 'Work Station Name',
            defaultValue: ''
        },
        ...defaultStateSearchParams
    ]
}

export const getProcessTypeByLine = async (param) => {
    const response = await query({
        url: `${BASE_URL}/line/${param}`,
        featureCode: 'user.create'
    })
        .catch((error) => {
            console.error(error);
        });
    const { data } = response;
    return data;
}