import homeOutlined from '@iconify/icons-ant-design/home-outlined';
import { Icon } from '@iconify/react';
import { isEmpty, isUndefined } from 'lodash-es';
import { PATH_PAGES } from '../routes/paths';
import { emptyStringToSharp, toStringCaseCapitalize } from './formatString';
import { userGridConfig as defaultGridConfig } from '../core/constants/grid';
import { fDateTime, fDate } from './formatTime';
import { fShortNumber } from './formatNumber';

// redux

const getUserPermission = () => {
  const userPermission = localStorage.getItem('userPermission');
  return JSON.parse(userPermission);
};

const fDateTimeColumns = [
  'dteLogU',
  'dteLogI',
  'validFrom',
  'validTo',
  'startDate',
  'endDate',
  'startTime',
  'endTime',
  'actualStartTime',
  'actualEndTime',
  'productionOrder.startTime',
  'productionOrder.endTime',
  'generateTime',
  'lastPrintTime',
  'grDate',
  'lastGIDate',
  'inputTime',
  'processTime',
  'approval.approvedTime',
  'stockMovementHistoryTime'
];
const fDateColumns = [
  'productionOrder.planDate',
  'purchaseGRPlan.planDate',
  'planDate',
  'validFrom',
  'validTo',
  'startDate',
  'endDate',
  'lossDate',
  'applyStartDate',
  'applyEndDate'
];
const fStateColumns = ['state'];
const fPrintStatusColumns = ['printStatus'];
const fNumberColumns = ['operationTime', 'lossTime', 'totalTime', 'tactTime', 'spanTime', 'balQty'];
const fLevelTables = ['bomInfoList', 'ecnInfoList'];
const fPrintTables = ['purchaseLabelDetailList', 'productionLabelDetailList'];
const fPrintColumns = ['usrLogU'];
const fLevelColumns = ['level'];
const fReflectColumns = ['reflect'];
const fBalQtyColumns = ['balQty'];
const fUnitIdColumns = ['sum', 'fp'];

export function getHeaderBreadcrumbs(pageCode) {
  const breadcrumbs = [{ name: '', href: PATH_PAGES, icon: <Icon icon={homeOutlined} width={30} height={30} /> }];
  const userPermission = getUserPermission();
  const pageTree = userPermission.filter((lv1) =>
    lv1.subFeatures.some((lv2) =>
      lv2.subFeatures.some((lv3) => lv3.subFeatures.some((lv4) => lv4.subFeatures.some((lv5) => lv5.code === pageCode)))
    )
  );
  pageTree.forEach((lv1) => {
    breadcrumbs.push({
      name: toStringCaseCapitalize(lv1.name, ' '),
      href: emptyStringToSharp()
    });
    const pageTreeLv2 = lv1.subFeatures.filter((lv2) =>
      lv2.subFeatures.some((lv3) => lv3.subFeatures.some((lv4) => lv4.subFeatures.some((lv5) => lv5.code === pageCode)))
    );
    pageTreeLv2.forEach((lv2) => {
      breadcrumbs.push({
        name: toStringCaseCapitalize(lv2.name, ' '),
        href: emptyStringToSharp()
      });
      const pageTreeLv3 = lv2.subFeatures.filter((lv3) =>
        lv3.subFeatures.some((lv4) => lv4.subFeatures.some((lv5) => lv5.code === pageCode))
      );
      pageTreeLv3.forEach((lv3) => {
        breadcrumbs.push({
          name: toStringCaseCapitalize(lv3.name, ' '),
          href: emptyStringToSharp()
        });
        const pageTreeLv4 = lv3.subFeatures.filter((lv4) => lv4.subFeatures.some((lv5) => lv5.code === pageCode));
        pageTreeLv4.forEach((lv4) => {
          breadcrumbs.push({
            name: toStringCaseCapitalize(lv4.name, ' '),
            href: emptyStringToSharp()
          });
          const pageTreeLv5 = lv4.subFeatures.filter((lv5) => lv5.code === pageCode);
          pageTreeLv5.forEach((lv5) => {
            breadcrumbs.push({
              name: `${lv5.name} [${lv5.description.split('/').pop()}]`,
              href: lv5.description
            });
          });
        });
      });
    });
  });
  return breadcrumbs;
}

export function getPageName(pageCode) {
  const userPermission = getUserPermission();
  const pageTree = userPermission.filter((lv1) =>
    lv1.subFeatures.some((lv2) =>
      lv2.subFeatures.some((lv3) => lv3.subFeatures.some((lv4) => lv4.subFeatures.some((lv5) => lv5.code === pageCode)))
    )
  );
  let pageNameReturn = 'Dashboard';
  pageTree.forEach((lv1) => {
    pageNameReturn = lv1.name;
    const pageTreeLv2 = lv1.subFeatures.filter((lv2) =>
      lv2.subFeatures.some((lv3) => lv3.subFeatures.some((lv4) => lv4.subFeatures.some((lv5) => lv5.code === pageCode)))
    );
    pageTreeLv2.forEach((lv2) => {
      const pageTreeLv3 = lv2.subFeatures.filter((lv3) =>
        lv3.subFeatures.some((lv4) => lv4.subFeatures.some((lv5) => lv5.code === pageCode))
      );
      pageTreeLv3.forEach((lv3) => {
        const pageTreeLv4 = lv3.subFeatures.filter((lv4) => lv4.subFeatures.some((lv5) => lv5.code === pageCode));
        pageTreeLv4.forEach((lv4) => {
          const pageTreeLv5 = lv4.subFeatures.filter((lv5) => lv5.code === pageCode);
          pageTreeLv5.forEach((lv5) => {
            pageNameReturn = lv5.name;
          });
        });
      });
    });
  });
  return `${pageNameReturn} | Điện Quang`;
}

export function getGridConfig(userGridConfig, pageCode, tableCode) {
  let tableConfigs = [];
  let currentPageConfig = [];
  if (!isUndefined(userGridConfig)) {
    currentPageConfig = userGridConfig.filter((page) => page.featureCode === pageCode && page.agGridId === tableCode);
  }
  if (!isEmpty(currentPageConfig) && !isEmpty(currentPageConfig[0]?.agGridConfig)) {
    tableConfigs = JSON.parse(currentPageConfig[0]?.agGridConfig);
  } else {
    tableConfigs = loadDefaultGridConfig(pageCode, tableCode);
  }
  tableConfigs
    .filter((column) => fDateTimeColumns.includes(column.field))
    .forEach((newColumn) => {
      newColumn.valueFormatter = (params) => fDateTime(params.value);
    });

  tableConfigs
    .filter((column) => fDateColumns.includes(column.field))
    .forEach((newColumn) => {
      newColumn.valueFormatter = (params) => fDate(params.value);
    });

  tableConfigs
    .filter((column) => fStateColumns.includes(column.field))
    .forEach((newColumn) => {
      newColumn.valueFormatter = (params) => formatState(params.value);
    });
  tableConfigs
    .filter((column) => fPrintStatusColumns.includes(column.field))
    .forEach((newColumn) => {
      newColumn.valueFormatter = (params) => formatPrintStatus(params.value);
    });
  tableConfigs
    .filter(
      (column) => !isUndefined(column.field) && (column.field.includes('Qty') || fNumberColumns.includes(column.field))
    )
    .forEach((newColumn) => {
      newColumn.valueFormatter = (params) => fShortNumber(params.value);
    });
  if (fLevelTables.includes(tableCode)) {
    tableConfigs
      .filter((column) => fLevelColumns.includes(column.field))
      .forEach((newColumn) => {
        newColumn.valueFormatter = (params) => formatLevel(params.value);
      });
    tableConfigs
      .filter((column) => fReflectColumns.includes(column.field))
      .forEach((newColumn) => {
        newColumn.valueFormatter = (params) => formatReflect(params.value);
      });
  }
  tableConfigs
    .filter((column) => fBalQtyColumns.includes(column.field))
    .forEach((newColumn) => {
      newColumn.valueFormatter = (params) => fShortNumber(formatBalQty(params));
    });

  if (tableCode === 'unitIDList') {
    tableConfigs
      .filter((column) => fUnitIdColumns.includes(column.field))
      .forEach((newColumn) => {
        newColumn.valueFormatter = (params) => formatUnitIdColumns(params.value);
      });
  }

  if (tableCode === 'operationTimeList') {
    tableConfigs
      .filter((column) => ['equipmentPart'].includes(column.field))
      .forEach((newColumn) => {
        newColumn.colSpan = (params) => colSpanOperationTime(params.data.equipmentPart);
      });
    tableConfigs.forEach((newColumn) => {
      const currentClass = newColumn.cellClass;
      newColumn.cellClass = (params) => formatCellClass(params.data.equipmentPart, currentClass);
    });
  }

  if (tableCode === 'WorkFormList') {
    tableConfigs
      .filter((column) => ['factory'].includes(column.field))
      .forEach((newColumn) => {
        newColumn.colSpan = (params) => colSpanStockDetail(params.data.factory);
      });
    tableConfigs.forEach((newColumn) => {
      const currentClass = newColumn.cellClass;
      newColumn.cellClass = (params) => formatCellClass(params.data.factory, currentClass);
    });
  }

  if (tableCode === 'WorkFormRegistrationForm') {
    tableConfigs
      .filter((column) => ['factory'].includes(column.field))
      .forEach((newColumn) => {
        newColumn.colSpan = (params) => colSpanStockDetail(params.data.factory);
      });
    tableConfigs.forEach((newColumn) => {
      const currentClass = newColumn.cellClass;
      newColumn.cellClass = (params) => formatCellClass(params.data.factory, currentClass);
    });
  }

  if (fPrintTables.includes(tableCode)) {
    tableConfigs
      .filter((column) => fPrintColumns.includes(column.field))
      .forEach((newColumn) => {
        newColumn.valueFormatter = (params) => formatLastPrintBy(params);
      });
  }

  if (['grPlanInfo'].includes(tableCode)) {
    tableConfigs
      .filter((column) => ['actualQty'].includes(column.field))
      .forEach((newColumn) => {
        newColumn.cellRenderer = (params) => FormatCellActualGr(params);
      });
  }
  if (fPrintTables.includes(tableCode)) {
    tableConfigs
      .filter((column) => fPrintColumns.includes(column.field))
      .forEach((newColumn) => {
        newColumn.valueFormatter = (params) => formatLastPrintBy(params);
      });
  }
  if (['stockInfo'].includes(tableCode)) {
    tableConfigs
      .filter((column) => ['stockQty'].includes(column.field))
      .forEach((newColumn) => {
        newColumn.cellRenderer = (params) => FormatCellActualGr(params);
      });
  }
  if (['giPlanInfo'].includes(tableCode)) {
    tableConfigs
      .filter((column) => ['actualQty'].includes(column.field))
      .forEach((newColumn) => {
        newColumn.cellRenderer = (params) => FormatCellActualGr(params);
      });
  }
  if (tableCode === 'grStockDetail') {
    tableConfigs
      .filter((column) => ['pk.factoryName'].includes(column.field))
      .forEach((newColumn) => {
        newColumn.colSpan = (params) => colSpanStockDetail(params.data.pk.factoryName);
      });
    tableConfigs.forEach((newColumn) => {
      const currentClass = newColumn.cellClass;
      newColumn.cellClass = (params) => formatCellClass(params.data.pk.factoryName, currentClass);
    });
  }
  if (['lineStockReportList'].includes(tableCode)) {
    tableConfigs
      .filter((column) => ['factoryName'].includes(column.field))
      .forEach((newColumn) => {
        newColumn.colSpan = (params) => colSpanListStock(params.data.factoryName);
      });
    tableConfigs.forEach((newColumn) => {
      const currentClass = newColumn.cellClass;
      newColumn.cellClass = (params) => formatCellClass(params.data.factoryName, currentClass);
      if (newColumn.field === 'monthStartQty' || newColumn.field === 'currentQty' || newColumn.field === 'gap') {
        newColumn.cellClass = (params) => customNormalLineStock(params.data.factoryName, currentClass);
      }
      if (newColumn.field === 'closingQty') {
        newColumn.cellClass = (params) => formatLineStock(params, params.data.factoryName, currentClass);
      }
      if (newColumn.children) {
        newColumn.children.forEach((child) => {
          child.cellClass = (params) => formatLineStock(params, params.data.factoryName, currentClass);
        });
      }
    });
  }

  if (tableCode === 'workCalendarList') {
    tableConfigs
      .filter((column) => ['factory'].includes(column.field))
      .forEach((newColumn) => {
        newColumn.colSpan = (params) => colSpanStockDetail(params.data.factory);
      });
    tableConfigs.forEach((newColumn) => {
      const currentClass = newColumn.cellClass;
      newColumn.cellClass = (params) => formatCellClass(params.data.factory, currentClass);
    });
  }
  if (tableCode === 'workCalendarFormGrid') {
    tableConfigs
      .filter((column) => ['factory'].includes(column.field))
      .forEach((newColumn) => {
        newColumn.colSpan = (params) => colSpanStockDetail(params.data.factory);
      });
    tableConfigs.forEach((newColumn) => {
      const currentClass = newColumn.cellClass;
      newColumn.cellClass = (params) => formatCellClass(params.data.factory, currentClass);
    });
  }

  if (['productionOrderList'].includes(tableCode)) {
    tableConfigs
      .filter((column) => ['actualQty'].includes(column.field))
      .forEach((newColumn) => {
        newColumn.cellRenderer = (params) => FormatCellActualGr(params);
      });
  }
  if (['stockClosingReportList'].includes(tableCode)) {
    tableConfigs
      .filter((column) => ['pk.factoryName'].includes(column.field))
      .forEach((newColumn) => {
        newColumn.colSpan = (params) => colSpanClosingStock(params.data.pk.factoryName);
      });
    tableConfigs.forEach((newColumn) => {
      const currentClass = newColumn.cellClass;
      newColumn.cellClass = (params) => formatCellClass(params.data.pk.factoryName, currentClass);
      if (newColumn.field === 'monthStartQty' || newColumn.field === 'currentQty' || newColumn.field === 'gap') {
        newColumn.cellClass = (params) => customNormalLineStock(params.data.pk.factoryName, currentClass);
      }
      if (newColumn.field === 'closingQty') {
        newColumn.cellClass = (params) => formatLineStock(params, params.data.pk.factoryName, currentClass);
      }
      if (newColumn.children) {
        newColumn.children.forEach((child) => {
          child.cellClass = (params) => formatLineStock(params, params.data.pk.factoryName, currentClass);
        });
      }
    });
  }
  if (['inspectionResultList'].includes(tableCode)) {
    tableConfigs.forEach((newColumn) => {
      if (newColumn.field === 'calculatedQcResult.description') {
        const currentClass = newColumn.cellClass;
        newColumn.cellClass = (params) => formatQcResult(params, currentClass);
      }
    });
  }
  if (['inspectionHistory'].includes(tableCode)) {
    tableConfigs.forEach((newColumn) => {
      if (['qcResult.description', 'attachment'].includes(newColumn.field)) {
        const currentClass = newColumn.cellClass;
        newColumn.cellClass = (params) => formatQcResult(params, currentClass);
      }
    });
  }
  if (['pmResultList'].includes(tableCode)) {
    tableConfigs
      .filter((column) => ['pmNo', 'spUse'].includes(column.field))
      .forEach((newColumn) => {
        newColumn.cellRenderer = (params) => FormatPmResult(params);
      });
  }
  if (['pmPlanningList'].includes(tableCode)) {
    tableConfigs
      .filter((column) => ['noticeYN'].includes(column.field))
      .forEach((newColumn) => {
        newColumn.cellRenderer = (params) => FormatPmPlanning(params);
      });
  }
  return tableConfigs;
}

function colSpanOperationTime(value) {
  if (value === 'Total') {
    return 7;
  }
  return 1;
}

function formatCellClass(value, currentClass) {
  if (value === 'Total' || value === 'SUM' || value === 'Sum') {
    return `${currentClass} ag-colspan-cell`;
  }
  return currentClass;
}

function formatLineStock(params, value, currentClass) {
  if (value === 'SUM' && params.value !== '0') {
    return `${currentClass} ag-right-aligned-cell ag-colspan-cell link-custom`;
  }
  if (value === 'SUM') {
    return `${currentClass} ag-right-aligned-cell ag-colspan-cell`;
  }
  if (value !== 'SUM' && params.value !== '0') {
    return `${currentClass} ag-right-aligned-cell line_stock_custom link-custom`;
  }
  if (value !== 'SUM') {
    return `${currentClass} ag-right-aligned-cell`;
  }

  return currentClass;
}

function customNormalLineStock(value, currentClass) {
  if (value === 'SUM') {
    return `${currentClass} ag-right-aligned-cell ag-colspan-cell`;
  }

  if (value !== 'SUM') {
    return `${currentClass} ag-right-aligned-cell`;
  }

  return currentClass;
}

function colSpanListStock(value) {
  if (value === 'SUM') {
    return 6;
  }
  return 1;
}
function colSpanClosingStock(value) {
  if (value === 'SUM') {
    return 7;
  }
  return 1;
}

function colSpanStockDetail(value) {
  if (value === 'SUM') {
    return 7;
  }
  if (value === 'Sum') {
    return 5;
  }
  return 1;
}

function FormatCellActualGr(props) {
  const cellValue = props.valueFormatted ? props.valueFormatted : props.value;

  if (cellValue === '0') {
    return cellValue;
  }
  return `<span><a href="#">${cellValue}</a></span>`;
}
function FormatPmResult(props) {
  const cellValue = props.valueFormatted ? props.valueFormatted : props.value;

  if (props?.column?.colId === 'spUse') {
    const isUsed = props?.data?.sparePartUses?.some((row) => row.usedQty > 0);
    if (isUsed) {
      return `<span>Y</span>`;
    }

    return `<span>N</span>`;
  }

  return `<span><a href="#">${cellValue}</a></span>`;
}

function FormatPmPlanning(props) {
  if (props?.data?.notice) {
    return `<span>Y</span>`;
  }
  return `<span>N</span>`;
}

function formatLastPrintBy(params) {
  return params?.data?.printNo === 0 ? '' : params?.data?.usrLogU;
}

function formatUnitIdColumns(value) {
  if (value) {
    return 'Y';
  }
  return 'N';
}

function formatBalQty(params) {
  let planQty = 0;
  let actualQty = 0;
  if (params?.data?.purchaseGRPlan?.planQty) {
    planQty = params?.data?.purchaseGRPlan?.planQty;
  } else if (params?.data?.planQty) {
    planQty = params?.data?.planQty;
  }
  if (params?.data?.generateQty) {
    actualQty = params?.data?.generateQty;
  } else if (params?.data?.actualQty) {
    actualQty = params?.data?.actualQty;
  }
  return planQty - actualQty;
}

function loadDefaultGridConfig(pageCode, tableCode) {
  let tableConfigs = [];
  const currentPageConfig = defaultGridConfig.filter(
    (page) => page.featureCode === pageCode && page.agGridId === tableCode
  );
  if (!isEmpty(currentPageConfig) && !isEmpty(currentPageConfig[0]?.agGridConfig)) {
    tableConfigs = JSON.parse(currentPageConfig[0]?.agGridConfig);
  }
  return tableConfigs;
}

function formatState(value) {
  if (value === 'RUNNING' || !value) {
    return 'Y';
  }
  return 'N';
}

function formatReflect(value) {
  if (value === true) {
    return 'Y';
  }
  return 'N';
}

function formatPrintStatus(value) {
  return value || 'Planned';
}

function formatLevel(level) {
  return `${parseDots(level)}${level}`;
}

function formatQcResult(params, currentClass) {
  if (params?.value === 'PLANNED') {
    return `${currentClass} ag-cell-qc-result-planned`;
  }
  if (params?.value === 'FAIL') {
    return `${currentClass} ag-cell-qc-result-fail `;
  }
  if (params?.value === 'PASS') {
    return `${currentClass} ag-cell-qc-result-success `;
  }
  if (params?.value === 'Y') {
    return `${currentClass} ag-cell-inspection-history-have-attachment `;
  }

  return `${currentClass}`;
}

function parseDots(length) {
  let result = '';
  const characters = '.';
  const charactersLength = characters.length;
  for (let i = 0; i < length - 1; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function parseOrgSearchAll(params, values) {
  if (values?.factoryIds) {
    params.factoryPks = values.factoryIds;
  }
  if (values?.plantIds) {
    params.plantPks = values.plantIds;
  }
  if (values?.teamIds) {
    params.teamPks = values.teamIds;
  }
  if (values?.groupIds) {
    params.groupPks = values.groupIds;
  }
  if (values?.partIds) {
    params.partPks = values.partIds;
  }
  if (values?.lineIds) {
    params.linePks = values.lineIds;
  }
  if (values?.processIds) {
    params.processPks = values.processIds;
  }
}

export function parseOrgSearchFactory(params, values) {
  if (values?.factoryIds) {
    params.factoryPks = values.factoryIds;
  }
}
