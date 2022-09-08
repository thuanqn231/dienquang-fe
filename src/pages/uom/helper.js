import { stateParam } from '../../core/constants';

export const BASE_URL = '/v1/uom';

export const isRenderAllOrgChart = false;

export const pageCode = 'menu.masterData.production.productionMasterData.basicMaster.uom';

export const gridConfigs = {
    [pageCode]: {
        tableCode: 'uomList',
        searchUrl: `${BASE_URL}/search-v2`
    }
}

export const initSearchParams = {
    [pageCode]: [
        {
            type: 'textfield',
            id: 'code',
            label: 'Unit Code',
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