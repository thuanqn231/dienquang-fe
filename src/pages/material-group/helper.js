import { stateParam } from '../../core/constants';

export const BASE_URL = '/v1/material-group';

export const isRenderAllOrgChart = false;

export const pageCode = 'menu.masterData.production.productionMasterData.materialMaster.materialGroup';

export const gridConfigs = {
    [pageCode]: {
        tableCode: 'materialGroupList',
        searchUrl: `${BASE_URL}/search-v2`
    }
}

export const initSearchParams = {
    [pageCode]: [
        {
            type: 'textfield',
            id: 'code',
            label: 'Material Group Code',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'name',
            label: 'Material Group Name',
            defaultValue: ''
        },
        stateParam
    ]
}

