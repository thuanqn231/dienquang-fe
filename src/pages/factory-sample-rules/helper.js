import { stateParam } from '../../core/constants';

export const BASE_URL = '/v1/factory-sample_rule';

export const isRenderAllOrgChart = false;

export const pageCode = 'menu.masterData.production.qualityMasterData.inspectionItems.factorySampleRule';

export const gridConfigs = {
    [pageCode]: {
        tableCode: 'factorySampleRuleList',
        searchUrl: `${BASE_URL}/search-v2`
    }
}

export const initSearchParams = {
    [pageCode]: [
        {
            type: 'dropdown',
            id: 'productGroup',
            label: 'Product Group',
            groupId: 'D015000',
            defaultValue: ''
        },
        {
            type: 'dropdown',
            id: 'inspectionType',
            label: 'Inspection Type',
            groupId: 'D065000',
            defaultValue: ''
        },
        {
            type: 'dropdown',
            id: 'qualityControlSize',
            label: 'Quality Control Size',
            groupId: 'D064000',
            defaultValue: ''
        },
        stateParam
    ]
}