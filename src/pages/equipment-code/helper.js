import { stateParam } from '../../core/constants';

export const BASE_URL = '/v1/equipment-code';

export const isRenderAllOrgChart = false;

export const pageCode = 'menu.masterData.production.resourceMasterData.equipmentInfo.equipmentCode';

export const gridConfigs = {
    [pageCode]: {
        tableCode: 'equipmentCodeList',
        searchUrl: `${BASE_URL}/search-v2`
    }
}

export const initSearchParams = {
    [pageCode]: [
        {
            type: 'textfield',
            id: 'code',
            label: 'Equip. Code',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'name',
            label: 'Equip. Name',
            defaultValue: ''
        },
        {
            type: 'dropdown',
            id: 'equipmentType',
            label: 'Equip. Type',
            groupId: 'D033000',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'vendor',
            label: 'Vendor',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'maker',
            label: 'Maker',
            defaultValue: ''
        },
        stateParam
    ]
}