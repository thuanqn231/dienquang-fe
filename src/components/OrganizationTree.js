import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { isEmpty } from 'lodash-es';
import { Button } from '@material-ui/core';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import {
  MdAddBox,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdChevronRight,
  MdFolder,
  MdFolderOpen,
  MdIndeterminateCheckBox,
  MdInsertDriveFile,
  MdKeyboardArrowDown
} from 'react-icons/md';

import useAuth from '../hooks/useAuth';

const icons = {
  check: <MdCheckBox className="rct-icon rct-icon-check" />,
  uncheck: <MdCheckBoxOutlineBlank className="rct-icon rct-icon-uncheck" />,
  halfCheck: <MdIndeterminateCheckBox className="rct-icon rct-icon-half-check" />,
  expandClose: <MdChevronRight className="rct-icon rct-icon-expand-close" />,
  expandOpen: <MdKeyboardArrowDown className="rct-icon rct-icon-expand-open" />,
  expandAll: <MdAddBox className="rct-icon rct-icon-expand-all" />,
  collapseAll: <MdIndeterminateCheckBox className="rct-icon rct-icon-collapse-all" />,
  parentClose: <MdFolder className="rct-icon rct-icon-parent-close" />,
  parentOpen: <MdFolderOpen className="rct-icon rct-icon-parent-open" />,
  leaf: <MdInsertDriveFile className="rct-icon rct-icon-leaf-close" />
};

export default function OrganizationTree({ parseSelected, renderAll = false, ...restProps }) {
  const { user, commonDropdown } = useAuth();
  const { nodesExpand, treeNodes } = commonDropdown;
  const [isExpandAll, setIsExpandAll] = useState(true);
  const [expanded, setExpanded] = useState(nodesExpand);
  const [checked, setChecked] = useState([]);
  const [treeRender, setTreeRender] = useState(treeNodes);
  const [factoryPks, setFactoryPks] = useState([]);
  const [plantPks, setPlantPks] = useState([]);
  const [teamPks, setTeamPks] = useState([]);
  const [groupPks, setGroupPks] = useState([]);
  const [partPks, setPartPks] = useState([]);

  useEffect(() => {
    if (!renderAll) {
      let _checked = [];
      if (treeNodes.length === 1) {
        _checked = [`factory_${user?.factory?.factoryPk}`];
      }
      setExpanded([]);
      setChecked(_checked);
      const currentTree = treeNodes.map((tree) => ({
        value: tree.value,
        label: tree.label
      }));
      setTreeRender(currentTree);
    } else {
      setExpanded(nodesExpand);
      setChecked([]);
      setTreeRender(treeNodes);
    }
  }, [renderAll, treeNodes]);

  useEffect(() => {
    parseUserAuth();
  }, [user]);

  const parseUserAuth = () => {
    const {
      organizationalChartProduction: { factoryPks, plantPks, teamPks, groupPks, partPks }
    } = user;
    setFactoryPks(factoryPks);
    setPlantPks(plantPks);
    setTeamPks(teamPks);
    setGroupPks(groupPks);
    setPartPks(partPks);
  }

  // const handleInitChecked = () => {
  //     const arrChecked = [];
  //     const appendCheckedNodes = (nodes) => {
  //         nodes.forEach((node) => {
  //             arrChecked.push(node.value);
  //             if (!isEmpty(node.children)) {
  //                 appendCheckedNodes(node.children);
  //             }
  //         });
  //     }
  //     treeNodes.filter((node) => node.value === `factory_${user?.factory?.factoryPk}`).forEach((node) => {
  //         arrChecked.push(node.value);
  //         if (!isEmpty(node.children)) {
  //             appendCheckedNodes(node.children);
  //         }
  //     });
  //     return arrChecked;
  // }

  const handleExpandCollapseAll = () => {
    const isExpand = !isExpandAll;
    setIsExpandAll(isExpand);
    if (isExpand) {
      onExpand(nodesExpand);
    } else {
      onExpand([]);
    }
  };

  const onCheck = (event) => {
    setChecked(event);
  };

  const onExpand = (expanded, targetNode) => {
    setExpanded(expanded);
    if (targetNode) {
      if (targetNode.expanded) {
        setIsExpandAll(true);
      } else {
        setIsExpandAll(false);
      }
    }
  };

  useEffect(() => {
    handleConvertSelectedToArray();
  }, [checked]);

  const handleConvertSelectedToArray = () => {
    let factoryIds = '';
    let plantIds = '';
    let teamIds = '';
    let groupIds = '';
    let partIds = '';
    const factoriesChecked = checked.filter((check) => check.includes('factory'));
    const plantsChecked = checked.filter((check) => check.includes('plant'));
    const teamsChecked = checked.filter((check) => check.includes('team'));
    const groupsChecked = checked.filter((check) => check.includes('group'));
    const partsChecked = checked.filter((check) => check.includes('part'));
    if (isEmpty(factoriesChecked)) {
      if (!isEmpty(factoryPks)) {
        factoryIds = factoryPks.map((factory) => `${factory.factoryCode}-${factory.id}`).join();
      }
    } else {
      factoryIds = factoriesChecked.map((factory) => {
        const factorySplit = factory.split('_');
        return factorySplit[factorySplit.length - 1];
      })
        .join();
    }
    if (isEmpty(plantsChecked)) {
      if (!isEmpty(plantPks)) {
        plantIds = plantPks.map((plant) => `${plant.factoryCode}-${plant.id}`).join();
      }
    } else {
      plantIds = plantsChecked.map((plant) => {
        const plantSplit = plant.split('_');
        return plantSplit[plantSplit.length - 1];
      })
        .join();
    }
    if (isEmpty(teamsChecked)) {
      if (!isEmpty(teamPks)) {
        teamIds = teamPks.map((team) => `${team.factoryCode}-${team.id}`).join();
      }
    } else {
      teamIds = teamsChecked.map((team) => {
        const teamSplit = team.split('_');
        return teamSplit[teamSplit.length - 1];
      })
        .join();
    }
    if (isEmpty(groupsChecked)) {
      if (!isEmpty(groupPks)) {
        groupIds = groupPks.map((group) => `${group.factoryCode}-${group.id}`).join();
      }
    } else {
      groupIds = groupsChecked.map((group) => {
        const groupSplit = group.split('_');
        return groupSplit[groupSplit.length - 1];
      })
        .join();
    }
    if (isEmpty(partsChecked)) {
      if (!isEmpty(partPks)) {
        partIds = partPks.map((part) => `${part.factoryCode}-${part.id}`).join();
      }
    } else {
      partIds = partsChecked.map((part) => {
        const partSplit = part.split('_');
        return partSplit[partSplit.length - 1];
      })
        .join();
    }
    const lineIds = checked
      .filter((check) => check.includes('line'))
      .map((line) => {
        const lineSplit = line.split('_');
        return lineSplit[lineSplit.length - 1];
      })
      .join();
    const processIds = checked
      .filter((check) => check.includes('process'))
      .map((process) => {
        const processSplit = process.split('_');
        return processSplit[processSplit.length - 1];
      })
      .join();
    if (parseSelected) {
      parseSelected({ factoryIds, plantIds, teamIds, groupIds, partIds, lineIds, processIds });
    }
  };

  return (
    <>
      {renderAll && (
        <Button
          onClick={() => handleExpandCollapseAll()}
          variant="outlined"
          sx={{ width: '100%', height: '36px', mb: 1 }}
        >
          {`${isExpandAll ? 'Collapse' : 'Expand'} All`}
        </Button>
      )}
      <CheckboxTree
        {...restProps}
        nodes={treeRender}
        checked={checked}
        expanded={expanded}
        onCheck={onCheck}
        onExpand={onExpand}
        icons={icons}
        showNodeIcon={false}
        iconsClass="fa5"
        checkModel="all"
        nativeCheckboxes
        nameAsArray
      />
    </>
  );
}
OrganizationTree.propTypes = {
  parseSelected: PropTypes.func
};
