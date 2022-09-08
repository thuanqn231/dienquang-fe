import { stateParam } from '../../core/constants';

export const BASE_URL = '/v1/time-period';

export const isRenderAllOrgChart = false;

export const pageCode = 'menu.system.systemConfiguration.parametter.commonCode.timePeriod';

const getMonthArr = () => {
    const monthArr = [];
    for (let i = 1; i <= 12; i += 1) {
      monthArr.push({
        value: `${i}`,
        label: `${i}`
      });
    }
    return monthArr;
}

const getWeekArr = () => {
    const weekArr = [];
    for (let i = 1; i <= 52; i += 1) {
      weekArr.push({
        value: `${i}`,
        label: `${i}`
      });
    }
    return weekArr;
}

export const monthArr = getMonthArr();

export const weekArr = getWeekArr();

export const gridConfigs = {
    [pageCode]: {
        tableCode: 'timePeriodList',
        searchUrl: `${BASE_URL}/search-v2`
    }
}

export const initSearchParams = {
    [pageCode]: [
        {
            type: 'dropdown',
            id: 'year',
            label: 'Year',
            groupId: 'D006000',
            defaultValue: ''
        },
        {
            type: 'dropdown',
            id: 'month',
            label: 'Month',
            options: monthArr,
            defaultValue: ''
        },
        {
            type: 'dropdown',
            id: 'week',
            label: 'Week',
            options: monthArr,
            defaultValue: ''
        },
        stateParam
    ]
}