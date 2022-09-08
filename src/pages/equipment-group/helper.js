import { stateParam } from '../../core/constants';

export const BASE_URL = '/v1/equipment-group';

export const isRenderAllOrgChart = false;

export const pageCode = 'menu.masterData.production.resourceMasterData.equipmentInfo.equipmentGroup';

export const gridConfigs = {
    [pageCode]: {
        tableCode: 'equipmentGroupList',
        searchUrl: `${BASE_URL}/search-v2`
    }
}

export const initSearchParams = {
    [pageCode]: [
        {
            type: 'textfield',
            id: 'code',
            label: 'Equip. Group Code',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'name',
            label: 'Equip. Group Name',
            defaultValue: ''
        },
        stateParam
    ]
}