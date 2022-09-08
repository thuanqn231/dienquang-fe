import { useRef, useState } from 'react';
import { DthMessage } from '../../core/wrapper';
import useLocales from '../../hooks/useLocales';
import { useSelector } from '../../redux/store';
import OneTableLayout from '../layout/OneTableLayout';
import FactoryDelete from './FactoryDelete';
import FactoryForm from './FactoryForm';
import FactoryFormModify from './FactoryFormModify';
import GroupForm from './GroupForm';
import GroupFormModify from './GroupFormModify';
import { getWidgetCode, gridConfigs, initSearchParams, isRenderAllOrgChart, pageCode, widgets } from './helper';
import LineForm from './LineForm';
import LineFormModify from './LineFormModify';
import PartForm from './PartForm';
import PartFormModify from './PartFormModify';
import PlantForm from './PlantForm';
import PlantFormModify from './PlantFormModify';
import ProcessForm from './ProcessForm';
import ProcessFormModify from './ProcessFormModify';
import TeamForm from './TeamForm';
import TeamFormModify from './TeamFormModify';
import WorkStationForm from './WorkStationForm';
import WorkStationFormModify from './WorkStationFormModify';

// ----------------------------------------------------------------------
// import RoleRegistrationForm from './RoleRegistrationForm';


export default function OperationHierarchyList() {
  const { translate } = useLocales();
  const { selectedWidget } = useSelector((state) => state.page);
  const [url, setUrl] = useState({ currentUrl: '', childUrl: '' });
  const [factoryId, setFactoryId] = useState(null);
  const FactoryFormref = useRef(null);
  const FactoryFormModifyref = useRef(null);
  const FactoryDeleteref = useRef(null);
  const PlantFormref = useRef(null);
  const PlantFormModifyref = useRef(null);
  const TeamFormref = useRef(null);
  const TeamFormModifyref = useRef(null);
  const GroupFormModifyref = useRef(null);
  const GroupFormref = useRef(null);
  const PartFormModifyref = useRef(null);
  const PartFormref = useRef(null);
  const LineFormModifyref = useRef(null);
  const LineFormref = useRef(null);
  const ProcessFormModifyref = useRef(null);
  const ProcessFormref = useRef(null);
  const WorkStationFormModifyref = useRef(null);
  const WorkStationFormref = useRef(null);
  const pageSelectedWidget = selectedWidget[pageCode];
  const layoutRef = useRef(null);

  const getActionButtons = () => {
    const actionButtons = {};
    widgets.forEach((widget) => {
      const widgetCode = getWidgetCode(widget);
      actionButtons[widgetCode] = [
        {
          funcType: 'CREATE',
          label: translate(`button.register`),
          disabled: false,
          onClick: () => onClickAdd()
        },
        {
          funcType: 'UPDATE',
          label: translate(`button.modify`),
          disabled: !factoryId,
          onClick: () => onClickModify()
        },
        {
          funcType: 'DELETE',
          label: translate(`button.delete`),
          disabled: !factoryId,
          onClick: () => onClickDelete()
        }
      ]
    });
    return actionButtons;
  }

  const actionButtons = getActionButtons();

  const onRowSelected = (selectedNodes) => {
    const rowCount = selectedNodes.length;
    if (rowCount === 1) {
      setFactoryId(selectedNodes[0].data.factoryPk.toString());
    } else {
      setFactoryId(null);
    }
  };

  const onClickAdd = () => {
    switch (pageSelectedWidget?.widgetName) {
      case 'Factory':
        FactoryFormref.current.openDialogReference();
        break;
      case 'Plant':
        PlantFormref.current.openDialogReference();
        break;
      case 'Team':
        TeamFormref.current.openDialogReference();
        break;
      case 'Group':
        GroupFormref.current.openDialogReference();
        break;
      case 'Part':
        PartFormref.current.openDialogReference();
        break;
      case 'Line':
        LineFormref.current.openDialogReference();
        break;
      case 'Process':
        ProcessFormref.current.openDialogReference();
        break;
      case 'Work Station':
        WorkStationFormref.current.openDialogReference();
        break;
      default:
        console.log(`Sorry, we are out of ${pageSelectedWidget?.widgetName}.`);
    }
  };

  const onClickModify = () => {
    if (factoryId !== null) {
      switch (pageSelectedWidget?.widgetName) {
        case 'Factory':
          FactoryFormModifyref.current.openDialogReference();
          break;
        case 'Plant':
          PlantFormModifyref.current.openDialogReference();
          break;
        case 'Team':
          TeamFormModifyref.current.openDialogReference();
          break;
        case 'Group':
          GroupFormModifyref.current.openDialogReference();
          break;
        case 'Part':
          PartFormModifyref.current.openDialogReference();
          break;
        case 'Line':
          LineFormModifyref.current.openDialogReference();
          break;
        case 'Process':
          ProcessFormModifyref.current.openDialogReference();
          break;
        case 'Work Station':
          WorkStationFormModifyref.current.openDialogReference();
          break;
        default:
          console.log(`Sorry, we are out of ${pageSelectedWidget?.widgetName}.`);
      }
    } else {
      DthMessage({ variant: 'warning', message: translate(`message.please_select_1_factory`) });
    }
  };

  const onClickDelete = () => {
    if (factoryId !== null) {
      switch (pageSelectedWidget?.widgetName) {
        case 'Factory':
          setUrl({ currentUrl: 'factory', childUrl: 'plant' });
          FactoryDeleteref.current.openDialogReference();
          break;
        case 'Plant':
          setUrl({ currentUrl: 'plant', childUrl: 'team' });
          FactoryDeleteref.current.openDialogReference();
          break;
        case 'Team':
          setUrl({ currentUrl: 'team', childUrl: 'group' });
          FactoryDeleteref.current.openDialogReference();
          break;
        case 'Group':
          setUrl({ currentUrl: 'group', childUrl: 'part' });
          FactoryDeleteref.current.openDialogReference();
          break;
        case 'Part':
          setUrl({ currentUrl: 'part', childUrl: 'line' });
          FactoryDeleteref.current.openDialogReference();
          break;
        case 'Line':
          setUrl({ currentUrl: 'line', childUrl: 'process' });
          FactoryDeleteref.current.openDialogReference();
          break;
        case 'Process':
          setUrl({ currentUrl: 'process', childUrl: 'workstation' });
          FactoryDeleteref.current.openDialogReference();
          break;
        case 'Work Station':
          setUrl({ currentUrl: 'workstation', childUrl: '' });
          FactoryDeleteref.current.openDialogReference();
          break;
        default:
          console.log(`Sorry, we are out of ${pageSelectedWidget?.widgetName}.`);
      }
    } else {
      DthMessage({ variant: 'warning', message: translate(`message.please_select_row_data`) });
    }
  };

  const onLoadData = () => {
    if (layoutRef.current) {
      layoutRef.current.onLoadData();
    }
  }

  const onReload = () => {
    onLoadData();
  };

  return (
    <>
      <OneTableLayout
        ref={layoutRef}
        pageCode={pageCode}
        isRenderAllOrgChart={isRenderAllOrgChart}
        gridConfigs={gridConfigs}
        initSearchParams={initSearchParams}
        actionButtons={actionButtons}
        onRowSelected={onRowSelected}
      />
      <FactoryForm ref={FactoryFormref} onReload={onReload} />
      <PlantForm ref={PlantFormref} onReload={onReload} />
      <TeamForm ref={TeamFormref} onReload={onReload} />
      <GroupForm ref={GroupFormref} onReload={onReload} />
      <PartForm ref={PartFormref} onReload={onReload} />
      <LineForm ref={LineFormref} onReload={onReload} />
      <ProcessForm ref={ProcessFormref} onReload={onReload} />
      <WorkStationForm ref={WorkStationFormref} onReload={onReload} />
      {factoryId && (
        <>
          <FactoryFormModify ref={FactoryFormModifyref} FACTORYID={factoryId} onReload={onReload} />
          <PlantFormModify ref={PlantFormModifyref} FACTORYID={factoryId} onReload={onReload} />
          <TeamFormModify ref={TeamFormModifyref} FACTORYID={factoryId} onReload={onReload} />
          <GroupFormModify ref={GroupFormModifyref} FACTORYID={factoryId} onReload={onReload} />
          <PartFormModify ref={PartFormModifyref} FACTORYID={factoryId} onReload={onReload} />
          <LineFormModify ref={LineFormModifyref} FACTORYID={factoryId} onReload={onReload} />
          <ProcessFormModify ref={ProcessFormModifyref} FACTORYID={factoryId} onReload={onReload} />
          <WorkStationFormModify ref={WorkStationFormModifyref} FACTORYID={factoryId} onReload={onReload} />
          <FactoryDelete ref={FactoryDeleteref} FACTORYID={factoryId} onReload={onReload} url={url} />
        </>
      )}
    </>
  );
}