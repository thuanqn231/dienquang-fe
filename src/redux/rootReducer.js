import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
// slices
import approvalReducer from './slices/approval';
import commonReducer from './slices/common';
import userReducer from './slices/user';
import userManagementReducer from './slices/userManagement';
import pageReducer from './slices/page';
import stockMasterReducer from './slices/stockMaster';
import uomManagementReducer from './slices/uomManagement';
import mrpManagementReducer from './slices/mrpManagement';
import roleManagementReducer from './slices/roleManagement';
import matrGroupManagementReducer from './slices/matrGroupManagement';
import materialMasterReducer from './slices/materialMaster';
import cycleTimeManagementReducer from './slices/cycleTimeManagement';
import tactTimeManagementReducer from './slices/tactTimeManagement';
import factoryConfigurationManagementReducer from './slices/factoryConfigurationManagement';
import timePeriodManagementReducer from './slices/timePeriodManagement';
import bomEcnManagementReducer from './slices/bomEcnManagement';
import operationHierarchyReducer from './slices/operationHierarchy';
import equipmentGroupReducer from './slices/equipmentGroupManagement';
import equipmentCodeReducer from './slices/equipmentCodeManagement';
import equipmentIDReducer from './slices/equipmentIDManagement';
import unitIDReducer from './slices/unitIDManagement';
import productionOrderReducer from './slices/productionOrderManagement';
import bizPartnerReducer from './slices/bizPartnerManagement';
import grPlanReducer from './slices/grPlanManagement';
import pmPlanningReducer from './slices/pmPlanningManagement';
import lossReducer from './slices/lossManagement';
import labelGenerateReducer from './slices/labelGenerateManagement';
import machineLossTimeReducer from './slices/machineLossTimeManagement';
import grResultReducer from './slices/grResultManagement';
import operationTimeManagementReducer from './slices/operationTimeManagement';
import giPlanReducer from './slices/giPlanManagement';
import giResultReducer from './slices/giResultManagement';
import stockReportReducer from './slices/stockReportManagement';
import inspectionResultReducer from './slices/inspectionResultManagement';
import stockAdjustmentReducer from './slices/stockAdjustmentManagement';
import lossPicReducer from './slices/lossPicManagement';
import productionLossTimeReducer from './slices/productionLossTimemanagement';
import operationRulesReducer from './slices/operationRulesManagement';

import lineStockReportReducer from './slices/lineStockReportManagement';
import equipmentLocationReducer from './slices/equipmentLocationManagement';
import workCalendarReducer from './slices/workCalendarManagement';
import lineStockAdjustmentReducer from './slices/lineStockAdjustmentManagement';
import fmbReducer from './slices/fmb';
import productionResultReducer from './slices/productionResultManagement';
import planBomMappingReducer from './slices/planBomMappingManagement';
import defectSymptomReducer from './slices/defectSymptomManagement';
import inspectItemReducer from './slices/inspectItemManagement';
import factoryDSReducer from './slices/factoryDSManagement';
import resetPasswordReducer from './slices/resetPassWordManagement';
import factoryDefectCausesReducer from './slices/factoryDefectCausesManagement';
import defectCauseReducer from './slices/defectCauseManagement';
import stockClosingReportReducer from './slices/stockClosingReportManagement';
import factorySymtomCauseMappingReducer from './slices/factorySymtomCauseMappingManagement';
import pmResultReducer from './slices/pmResultManagement';
// ----------------------------------------------------------------------

const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'redux-',
  whitelist: []
};

const rootReducer = combineReducers({
  user: userReducer,
  common: commonReducer,
  approval: approvalReducer,
  userManagement: userManagementReducer,
  page: pageReducer,
  stockMaster: stockMasterReducer,
  uomManagement: uomManagementReducer,
  mrpManagement: mrpManagementReducer,
  roleManagement: roleManagementReducer,
  matrGroupManagement: matrGroupManagementReducer,
  materialMaster: materialMasterReducer,
  cycleTimeManagement: cycleTimeManagementReducer,
  tactTimeManagement: tactTimeManagementReducer,
  factoryConfigurationManagement: factoryConfigurationManagementReducer,
  timePeriodManagement: timePeriodManagementReducer,
  bomEcnManagement: bomEcnManagementReducer,
  operationHierarchy: operationHierarchyReducer,
  equipmentGroupManagement: equipmentGroupReducer,
  equipmentCodeManagement: equipmentCodeReducer,
  equipmentIDManagement: equipmentIDReducer,
  unitIDManagement: unitIDReducer,
  productionOrderManagement: productionOrderReducer,
  bizPartnerManagement: bizPartnerReducer,
  grPlanManagement: grPlanReducer,
  pmPlanningManagement: pmPlanningReducer,
  lossManagement: lossReducer,
  labelGenerateManagement: labelGenerateReducer,
  operationTimeManagement: operationTimeManagementReducer,
  grResultManagement: grResultReducer,
  giPlanManagement: giPlanReducer,
  giResultManagement: giResultReducer,
  stockReportManagement: stockReportReducer,
  stockAdjustmentManagement: stockAdjustmentReducer,
  lossPicManagement: lossPicReducer,
  inspectionResultManagement: inspectionResultReducer,
  machineLossTime: machineLossTimeReducer,
  productionLossTimeManagement: productionLossTimeReducer,
  workCalendarManagement: workCalendarReducer,
  operationRulesManagement: operationRulesReducer,
  lineStockReportManagement: lineStockReportReducer,
  equipmentLocationManagement: equipmentLocationReducer,
  lineStockAdjustmentManagement: lineStockAdjustmentReducer,
  fmb: fmbReducer,
  productionResultManagement: productionResultReducer,
  planBomMappingManagement: planBomMappingReducer,
  defectSymptomManagement: defectSymptomReducer,
  stockClosingReportManagement: stockClosingReportReducer,
  factoryDSManagement: factoryDSReducer,
  resetPasswordManagement: resetPasswordReducer,
  factoryDefectCausesManagement: factoryDefectCausesReducer,
  defectCausesManagement: defectCauseReducer,
  factorySymtomCauseMappingManagement: factorySymtomCauseMappingReducer,
  inspectItemManagement: inspectItemReducer,
  pmResultManagement: pmResultReducer
});

export { rootPersistConfig, rootReducer };
