import { stateParam } from '../../core/constants';

export const BASE_URL = '/v1/unit-id';

export const isRenderAllOrgChart = false;

export const pageCode = 'menu.masterData.production.productionMasterData.verification.unitID';

export const gridConfigs = {
    [pageCode]: {
        tableCode: 'unitIDList',
        searchUrl: `${BASE_URL}/search-v2`
    }
}

export const initSearchParams = {
    [pageCode]: [
        {
            type: 'textfield',
            id: 'code',
            label: 'Unit ID',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'name',
            label: 'Unit Name',
            defaultValue: ''
        },
        stateParam
    ]
}