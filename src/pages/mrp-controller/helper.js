import { stateParam } from '../../core/constants';

export const BASE_URL = '/v1/mrp';

export const isRenderAllOrgChart = false;

export const pageCode = 'menu.masterData.production.productionMasterData.basicMaster.mrpController';

export const gridConfigs = {
    [pageCode]: {
        tableCode: 'mrpControllerList',
        searchUrl: `${BASE_URL}/search-v2`
    }
}

export const initSearchParams = {
    [pageCode]: [
        {
            type: 'textfield',
            id: 'code',
            label: 'MRP Code',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'name',
            label: 'MRP Name',
            defaultValue: ''
        },
        stateParam
    ]
}