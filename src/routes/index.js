import { lazy, Suspense } from 'react';
import { Navigate, useLocation, useRoutes } from 'react-router-dom';
// import RoleBasedGuard from '../guards/RoleBasedGuard';
// components
import LoadingScreen from '../components/LoadingScreen';
import AuthGuard from '../guards/AuthGuard';
// guards
import GuestGuard from '../guards/GuestGuard';
import LogoOnlyLayout from '../layouts/LogoOnlyLayout';
// layouts
import MainLayout from '../layouts/main';
import FmbLayout from '../layouts/fmb';
import OILayout from '../layouts/oi';

// ----------------------------------------------------------------------

const Loadable = (Component) => (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();
  const isPages = pathname.includes('/pages');

  return (
    <Suspense
      fallback={
        <LoadingScreen
          sx={{
            ...(!isPages && {
              top: '50vh',
              left: 0,
              width: 1,
              zIndex: 9999,
              position: 'fixed'
            })
          }}
        />
      }
    >
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (
            <GuestGuard>
              <Login />
            </GuestGuard>
          )
        },
        {
          path: 'register',
          element: (
            <GuestGuard>
              <Register />
            </GuestGuard>
          )
        },
        { path: 'login-unprotected', element: <Login /> },
        { path: 'register-unprotected', element: <Register /> },
        { path: 'forgot-password', element: <ForgotPassword /> },
        { path: 'verify', element: <VerifyCode /> },
        { path: 'reset-password', element: <ResetPassword /> }
      ]
    },

    // Pages Routes
    {
      path: 'pages',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        { path: '', element: <Navigate to="/pages/C002000" replace /> },
        {
          path: 'user',
          children: [{ path: '', element: <Navigate to="/pages/C002002" replace /> }]
        },
        {
          path: 'department',
          children: [{ path: '', element: <Navigate to="/pages/C002003" replace /> }]
        },
        {
          path: 'home',
          children: [{ path: '', element: <Navigate to="/pages/C001001" replace /> }]
        },
        {
          path: 'permission',
          children: [{ path: '', element: <Navigate to="/pages/C002004" replace /> }]
        },
        {
          path: 'approval',
          children: [{ path: '', element: <Navigate to="/pages/SM02010102" replace /> }]
        },
        {
          path: 'user-information',
          children: [{ path: '', element: <Navigate to="/pages/SM01010101" replace /> }]
        },
        {
          path: 'role-master',
          children: [{ path: '', element: <Navigate to="/pages/SM01010101" replace /> }]
        },
        { path: '404', element: <NotFound /> },
        { path: 'C002000', element: <Dashboard /> },
        { path: 'C001001', children: [{ path: '', element: <Navigate to="/pages/C002000" replace /> }] },
        { path: 'C002002', element: <UserList /> },
        // { path: 'C002003', element: <DepartmentList /> }
        {
          path: 'C002003',
          element: (
            // <RoleBasedGuard accessibleRoles={['leader', 'ceo']}>
            <DepartmentList />
          )
          // </RoleBasedGuard>
        },
        {
          path: 'Operation Hierarchy',
          children: [{ path: '', element: <Navigate to="/pages/MD01010101" replace /> }]
        },

        {
          path: 'Common Code',
          children: [{ path: '', element: <Navigate to="/pages/MD01010100" replace /> }]
        },

        { path: 'C002004', element: <PermissionList /> },
        { path: 'SM02010102/', element: <Approval /> },
        { path: 'SM02010102/:approvalId', element: <Approval /> },
        { path: 'MD01010101', element: <OperationHiarchy /> },
        { path: 'MD01010100', element: <CommonCode /> },
        { path: 'SM01010101', element: <UserInformationList /> },
        { path: 'SM01010201', element: <RoleMasterList /> },
        { path: 'MD01020501', element: <UOMList /> },
        { path: 'MD01020502', element: <MRPControllerList /> },
        { path: 'MD01050101', element: <StockMasterList /> },
        { path: 'MD01020102', element: <MatrGroupList /> },
        { path: 'MD01020101', element: <MaterialMasterList /> },

        { path: 'MD01010201', element: <CycleTimeList /> },
        { path: 'MD01010202', element: <TactTimeList /> },
        { path: 'SM01010100', element: <FactoryConfigurationList /> },
        { path: 'MD01010204', element: <TimePeriodList /> },
        { path: 'MD01020104', element: <BomEcnList /> },
        { path: 'MD01040104', element: <EquipmentGroupList /> },
        { path: 'MD01040402', element: <LossPicList /> },

        { path: 'MD01040101', element: <EquipmentCodeList /> },
        { path: 'MD01040102', element: <EquipmentIDList /> },
        { path: 'MD01020201', element: <UnitIDList /> },
        { path: 'MD01010203', element: <WorkFormList /> },
        { path: 'PP01020101', element: <ProductionOrderList /> },
        { path: 'PP04040101', element: <PmPlanningList /> },
        { path: 'PP04040102', element: <PmResultList /> },
        { path: 'MD03010101', element: <BusinessPartnerCodeList /> },
        { path: 'MD03010102', element: <BusinessPartnerGroupList /> },
        { path: 'PP01020103', element: <GrPlanList /> },
        { path: 'PP02020202', element: <PlanBomMappingList /> },
        { path: 'MD01040401', element: <LossMasterList /> },
        { path: 'PP04010201', element: <MaChineLossTimeList /> },
        { path: 'PP02030101', element: <ProductionLossTimeList /> },
        { path: 'PP07010101', element: <LabelGenerationList /> },
        { path: 'PP04010101', element: <OperationTimeList /> },
        { path: 'PP02010301', element: <GrResultList /> },
        { path: 'PP04010101', element: <OperationTimeList /> },
        { path: 'PP01020104', element: <GiPlanList /> },
        { path: 'PP03010101', element: <InspectionResultList /> },
        { path: 'MD01040401', element: <LossMasterList /> },
        { path: 'PP02010401', element: <GiResultList /> },
        { path: 'PP05010101', element: <StockReportList /> },
        { path: 'PP05010501', element: <StockAdujustmentList /> },
        { path: 'PP05010102', element: <LineStockReportList /> },
        { path: 'PP05010103', element: <StockClosingReportList /> },
        { path: 'MD01050203', element: <OperationRulesList /> },
        { path: 'PP05010201', element: <EquipmentLocationList /> },
        { path: 'PP05010202', element: <LineStockAdjustment /> },
        { path: 'SM01020101', element: <PeriodClosing /> },
        { path: 'PP02040101', element: <ProductionResultList /> },
        { path: 'SM01010302', element: <EmployeeProfileList /> },
        { path: 'MD01030201', element: <DefectSymptomList /> },
        { path: 'MD01030301', element: <FactoryDSList /> },
        { path: 'MD01030302', element: <FactoryDefectCauses /> },
        { path: 'MD01030203', element: <FactorySymtomCauseMapping /> },
        { path: 'MD01030202', element: <DefectCauseList /> },
        { path: 'MD01030101', element: <InspectionItemList /> },
        { path: 'MD01030103', element: <FactorySampleRulesList /> },
        { path: 'FB01010101', children: [{ path: '', element: <Navigate to="/fmb/F01010101/FAC01" replace /> }] },
        { path: 'FB01010201', children: [{ path: '', element: <Navigate to="/fmb/F01010102/FAC01" replace /> }] },
        // { path: 'F01010104', children: [{ path: '', element: <Navigate to="/fmb/F01010104/FAC01" replace /> }] },
        { path: 'FB01010201', children: [{ path: '', element: <Navigate to="/fmb/F01010103/FAC01/RO01" replace /> }] },
        { path: 'F01010104', children: [{ path: '', element: <Navigate to="/fmb/F01010104/FAC01" replace /> }] }
        // { path: 'demo-grid', element: <DemoGrid /> }
      ]
    },

    // Fmb Routes
    {
      path: 'fmb',
      element: <FmbLayout />,
      children: [
        { path: '', element: <Navigate to="/fmb/F01010101" replace /> },
        {
          path: 'prod-status',
          children: [{ path: '', element: <Navigate to="/fmb/F01010101" replace /> }]
        },
        { path: 'F01010101/:factoryCode', element: <ProductionStatus /> },
        { path: 'F01010102/:factoryCode', element: <StuffingStatus /> },
        { path: 'F01010103/:factoryCode/:lineCode', element: <LineStatus /> },
        { path: 'F01010104/:factoryCode', element: <MachineOperationStatus /> }
      ]
    },

    // OI Routes
    {
      path: 'oi',
      element: <OILayout />,
      children: [
        { path: '', element: <Navigate to="/pages/C001001" replace /> },
        {
          path: 'prod-result',
          children: [{ path: '', element: <Navigate to="/oi/O01010101" replace /> }]
        },
        { path: 'O01010101', element: <ProductionResult /> }
      ]
    },

    // Main Routes
    {
      path: '*',
      element: <LogoOnlyLayout />,
      children: [
        { path: 'maintenance', element: <Maintenance /> },
        { path: '500', element: <Page500 /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/pages/404" replace /> }
      ]
    },
    {
      path: '',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [{ path: '', element: <Navigate to="/pages/C002000" replace /> }]
    },
    { path: '*', element: <Navigate to="/pages/404" replace /> }
  ]);
}

// IMPORT COMPONENTS

// Authentication
const Login = Loadable(lazy(() => import('../pages/authentication/Login')));
const Register = Loadable(lazy(() => import('../pages/authentication/Register')));
const ForgotPassword = Loadable(lazy(() => import('../pages/authentication/ForgotPassword')));
const ResetPassword = Loadable(lazy(() => import('../pages/authentication/ResetPassword')));
const VerifyCode = Loadable(lazy(() => import('../pages/authentication/VerifyCode')));
// Main
const Maintenance = Loadable(lazy(() => import('../pages/Maintenance')));
const Page500 = Loadable(lazy(() => import('../pages/Page500')));
const NotFound = Loadable(lazy(() => import('../pages/Page404')));
// Components
const UserList = Loadable(lazy(() => import('../pages/general-management/user-management/UserList')));
const DepartmentList = Loadable(lazy(() => import('../pages/general-management/dept-management/DepartmentList')));
const PermissionList = Loadable(lazy(() => import('../pages/general-management/permission-management/PermissionList')));
const Dashboard = Loadable(lazy(() => import('../pages/home/Dashboard')));
const Approval = Loadable(lazy(() => import('../pages/approval/Approval')));
const OperationHiarchy = Loadable(lazy(() => import('../pages/operation-hierarchy/OperationHierarchyList')));
const CommonCode = Loadable(lazy(() => import('../pages/common_code/CommonCodeList')));
const UserInformationList = Loadable(lazy(() => import('../pages/user-information/UserInformationList')));
const RoleMasterList = Loadable(lazy(() => import('../pages/role-master/RoleMasterList')));
const ProductionStatus = Loadable(lazy(() => import('../pages/fmb/ProductionStatus')));
const StuffingStatus = Loadable(lazy(() => import('../pages/fmb/StuffingStatus')));
const MachineOperationStatus = Loadable(lazy(() => import('../pages/fmb/MachineOperationStatus')));
const LineStatus = Loadable(lazy(() => import('../pages/fmb/LineStatus')));
const ProductionResult = Loadable(lazy(() => import('../pages/oi/ProductionResult')));
const UOMList = Loadable(lazy(() => import('../pages/uom/UOMList')));
const MRPControllerList = Loadable(lazy(() => import('../pages/mrp-controller/MRPControllerList')));
const StockMasterList = Loadable(lazy(() => import('../pages/stock-master/StockMasterList')));
const MatrGroupList = Loadable(lazy(() => import('../pages/material-group/MatrGroupList')));
const MaterialMasterList = Loadable(lazy(() => import('../pages/material-master/MaterialMasterList')));
const CycleTimeList = Loadable(lazy(() => import('../pages/cycle-time/CycleTimeList')));
const FactoryConfigurationList = Loadable(
  lazy(() => import('../pages/factory-configuration/FactoryConfigurationList'))
);
const TimePeriodList = Loadable(lazy(() => import('../pages/time-period/TimePeriodList')));
const BomEcnList = Loadable(lazy(() => import('../pages/bom-ecn/BomEcnList')));
const EquipmentGroupList = Loadable(lazy(() => import('../pages/equipment-group/EquipmentGroupList')));
const EquipmentCodeList = Loadable(lazy(() => import('../pages/equipment-code/EquipmentCodeList')));
const EquipmentIDList = Loadable(lazy(() => import('../pages/equipment-id/EquipmentIDList')));
const UnitIDList = Loadable(lazy(() => import('../pages/unit-id/UnitIdList')));
const ProductionOrderList = Loadable(lazy(() => import('../pages/production-order/ProductionOrderList')));
const BusinessPartnerGroupList = Loadable(lazy(() => import('../pages/business-partner/BusinessPartnerGroupList')));
const BusinessPartnerCodeList = Loadable(lazy(() => import('../pages/business-partner/BusinessPartnerCodeList')));
const GrPlanList = Loadable(lazy(() => import('../pages/gr-plan/GrPlanList')));
const PmPlanningList = Loadable(lazy(() => import('../pages/pm-planning/PmPlanningList')));
const LossMasterList = Loadable(lazy(() => import('../pages/loss-master/LossMasterList')));
const LabelGenerationList = Loadable(lazy(() => import('../pages/label-generation/LabelGenerationList')));
const OperationTimeList = Loadable(lazy(() => import('../pages/operation-time/OperationTimeList')));
const GiPlanList = Loadable(lazy(() => import('../pages/gi-plan/GiPlanList')));
const GiResultList = Loadable(lazy(() => import('../pages/gi-result/GiResultList')));
const GrResultList = Loadable(lazy(() => import('../pages/gr-result/GrResultList')));
const StockReportList = Loadable(lazy(() => import('../pages/stock-report/StockReportList')));
const LossPicList = Loadable(lazy(() => import('../pages/loss-pic/LossPicList')));
const StockAdujustmentList = Loadable(lazy(() => import('../pages/stock-adjustment/StockAdujustmentList')));
const InspectionResultList = Loadable(lazy(() => import('../pages/inspection-result/InspectionResultList')));
const TactTimeList = Loadable(lazy(() => import('../pages/tact-time/TactTimeList')));
const MaChineLossTimeList = Loadable(lazy(() => import('../pages/machineloss-time/MachineLossTimeList')));
const ProductionLossTimeList = Loadable(lazy(() => import('../pages/productionloss-time/ProductionLossTimeList')));
const WorkFormList = Loadable(lazy(() => import('../pages/work-calendar/WorkFormList')));
const OperationRulesList = Loadable(lazy(() => import('../pages/operation-rules/OperationRulesList')));
const LineStockReportList = Loadable(lazy(() => import('../pages/line-stock-report/LineStockReportList')));
const EquipmentLocationList = Loadable(lazy(() => import('../pages/equipment-location/EquipmentLocationList')));
const LineStockAdjustment = Loadable(lazy(() => import('../pages/line-stock-adjustment/LineStockAdjustment')));
const ProductionResultList = Loadable(lazy(() => import('../pages/production-result/ProductionResultList')));
const PeriodClosing = Loadable(lazy(() => import('../pages/period-closing/PeriodClosing')));
const PlanBomMappingList = Loadable(lazy(() => import('../pages/planBomMapping/PlanBomMappingList')));
const StockClosingReportList = Loadable(lazy(() => import('../pages/stock-closing-report/StockClosingReportList')));
const EmployeeProfileList = Loadable(lazy(() => import('../pages/employee-profile/EmployeeProfileList')));
const DefectSymptomList = Loadable(lazy(() => import('../pages/defect-symptom/DefectSymptomList')));
const DefectCauseList = Loadable(lazy(() => import('../pages/defect-cause/DefectCauseList')));
const DemoGrid = Loadable(lazy(() => import('../pages/test/DemoGrid')));
const FactoryDSList = Loadable(lazy(() => import('../pages/factory-defect-symptom/FactoryDSList')));
const FactoryDefectCauses = Loadable(lazy(() => import('../pages/factory-defect-causes/FactoryDefectCausesList')));
const FactorySymtomCauseMapping = Loadable(
  lazy(() => import('../pages/factory-symptom-cause-mapping/FactorySymtomCauseMappingList'))
);
const InspectionItemList = Loadable(lazy(() => import('../pages/inspection-item/InspectionItemList')));
const PmResultList = Loadable(lazy(() => import('../pages/pm-result/PmResultList')));
const FactorySampleRulesList = Loadable(lazy(() => import('../pages/factory-sample-rules/FactorySampleRulesList')));
