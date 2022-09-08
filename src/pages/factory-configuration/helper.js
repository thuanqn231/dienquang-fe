import { stateParam } from '../../core/constants';

export const BASE_URL = '/v1/factory-configuration';

export const isRenderAllOrgChart = false;

export const pageCode = 'menu.system.systemConfiguration.parametter.commonCode.factoryConfiguration';

export const gridConfigs = {
    [pageCode]: {
        tableCode: 'factoryConfigurationList',
        searchUrl: `${BASE_URL}/search-v2`
    }
}

export const initSearchParams = {
    [pageCode]: [
        {
            type: 'textfield',
            id: 'code',
            label: 'Param Code',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'name',
            label: 'Param Name',
            defaultValue: ''
        },
        stateParam
    ]
}