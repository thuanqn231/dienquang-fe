import jwtDecode from 'jwt-decode';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer } from 'react';
import { mutate, query } from '../core/api';
// utils
import axios from '../utils/axios';
import { encryptPassword } from '../utils/encrypt';
import { getSafeValue } from '../utils/formatString';
import { isValidToken, setSession } from '../utils/jwt';

// ----------------------------------------------------------------------

const page404 = {
  path: '/pages/404',
  name: 'Page Not Found',
  code: 'pageNotFound',
  permissions: ['READ']
};

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  commonDropdown: {},
  funcPermission: [page404],
  userGridConfig: []
};

const handlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user, commonDropdown, funcPermission, userGridConfig } = action.payload;
    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
      commonDropdown,
      funcPermission,
      userGridConfig
    };
  },
  LOGIN: (state, action) => {
    const { user, commonDropdown, funcPermission, userGridConfig } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
      commonDropdown,
      funcPermission,
      userGridConfig
    };
  },
  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null
  }),
  REGISTER: (state, action) => {
    const { user, commonDropdown } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
      commonDropdown
    };
  },
  UPDATEDROPDOWN: (state, action) => {
    const { commonDropdown, user } = action.payload;

    return {
      ...state,
      user,
      commonDropdown
    };
  },
  UPDATEGRIDCONFIG: (state, action) => {
    const { userGridConfig } = action.payload;

    return {
      ...state,
      userGridConfig
    };
  }
};

const reducer = (state, action) => (handlers[action.type] ? handlers[action.type](state, action) : state);

const AuthContext = createContext({
  ...initialState,
  method: 'jwt',
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve()
});

AuthProvider.propTypes = {
  children: PropTypes.node
};

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = window.localStorage.getItem('accessToken');
        const { userId, factoryCode } = jwtDecode(accessToken);
        const responseUser = await query({
          url: `v1/user/${factoryCode}-${userId}`,
          featureCode: 'user.create'
        });
        const { userParse } = parseUserInfo(responseUser.data);
        const {
          organizationalChartProduction: { factoryPks }
        } = userParse;
        const factoryIds = factoryPks.map((factory) => `${factory.factoryCode}-${factory.id}`).join();
        const commonDropdown = await getCommonDropdown(userParse);
        const userPermission = localStorage.getItem('userPermission');
        const funcPermission = [page404];
        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken);
          parseFunctionPermission(JSON.parse(userPermission), funcPermission);
          const userGridConfig = await loadAgGridConfig();
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: true,
              user: {
                ...userParse,
                factoryIds
              },
              commonDropdown,
              funcPermission,
              userGridConfig
            }
          });
        } else {
          logout();
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            user: null,
            commonDropdown: {},
            funcPermission: [page404]
          }
        });
      }
    };

    initialize();
  }, []);

  const loadAgGridConfig = async () => {
    const response = await query({
      url: '/v1/user/ag-grid-configuration',
      featureCode: 'user.create'
    });
    return response?.data || [];
  };

  const updateAgGridConfig = async () => {
    const userGridConfig = await loadAgGridConfig();
    dispatch({
      type: 'UPDATEGRIDCONFIG',
      payload: {
        userGridConfig
      }
    });
  };

  const updateCommonDropdown = async () => {
    const accessToken = window.localStorage.getItem('accessToken');
    const { userId, factoryCode } = jwtDecode(accessToken);
    const responseUser = await query({
      url: `v1/user/${factoryCode}-${userId}`,
      featureCode: 'user.create'
    });
    const { userParse } = parseUserInfo(responseUser.data);
    const {
      organizationalChartProduction: { factoryPks }
    } = userParse;
    const factoryIds = factoryPks.map((factory) => `${factory.factoryCode}-${factory.id}`).join();
    const commonDropdown = await getCommonDropdown(userParse);
    dispatch({
      type: 'UPDATEDROPDOWN',
      payload: {
        user: {
          ...userParse,
          factoryIds
        },
        commonDropdown
      }
    });
  };

  const login = async (email, password) => {
    let isSuccess = true;
    let msg = '';
    const response = await mutate({
      url: '/authentication/login',
      featureCode: 'user.create',
      data: {
        email,
        password: encryptPassword(password)
      }
    }).catch((error) => {
      isSuccess = false;
      msg = error.data.statusMessage
    });
    if (isSuccess) {
      const { token, user } = response;
      const { userParse, userPermission } = parseUserInfo(user, 'login');
      const {
        organizationalChartProduction: { factoryPks }
      } = userParse;
      const factoryIds = factoryPks.map((factory) => `${factory.factoryCode}-${factory.id}`).join();
      const funcPermission = [page404];
      parseFunctionPermission(userPermission, funcPermission);
      localStorage.setItem('userPermission', JSON.stringify(userPermission));
      setSession(token);
      const commonDropdown = await getCommonDropdown(userParse);
      const userGridConfig = await loadAgGridConfig();
      dispatch({
        type: 'LOGIN',
        payload: {
          user: {
            ...userParse,
            factoryIds
          },
          commonDropdown,
          funcPermission,
          userGridConfig
        }
      });
    }
    return { isSuccess, msg }
  };

  const parseUserInfo = (user, type) => {
    const userParse = {
      id: user.factoryPk,
      displayName: user.fullName,
      firstName: user.firstName,
      factory: {
        factoryPk: `${user.context.factoryPk.factoryCode}-${user.context.factoryPk.id}`,
        factoryCode: user.context.factoryPk.factoryCode,
        factoryName: user.context.factoryPk.factoryName
      },
      email: user.email,
      photoURL: user?.attachedFiles[0]?.url || '',
      phoneNumber: user.phoneNumber,
      address: user.address,
      department: {
        id: user.department.factoryPk,
        name: user.department.name,
        code: user.department.code
      },
      role: {
        id: user.profile.factoryPk,
        name: user.profile.name,
        description: user.profile.description
      },
      workStation: user.workStation,
      organizationalChartProduction: user.organizationalChartProduction,
      isPublic: true
    };
    if (type === 'login') {
      const userPermission = user.profile.featureGroupPermission.subFeatures;
      return { userParse, userPermission };
    }
    return { userParse };
  };

  const parseFunctionPermission = (userPermission, funcPermission) => {
    userPermission.forEach((permission) => {
      const { kind, code, name, permissions, description, subFeatures } = permission;
      const isExistPath = funcPermission.findIndex((func) => func.path === description);
      if (description.includes('/pages') && isExistPath === -1 && permissions.includes("READ")) {
        const widgetPermission = [];
        if (kind === 'MENU' && !isEmpty(subFeatures)) {
          subFeatures.forEach((widget) => {
            if (widget.permissions.includes("READ")) {
              widgetPermission.push({
                kind: widget.kind,
                name: widget.name,
                code: widget.code,
                permissions: widget.permissions
              });
            }
          });
        } else {
          widgetPermission.push({
            kind: 'TAB',
            name,
            code,
            permissions
          });
        }
        funcPermission.push({
          kind,
          path: description,
          name,
          code,
          permissions,
          widgets: widgetPermission
        });
      } else {
        parseFunctionPermission(subFeatures, funcPermission);
      }
    });
  };

  const register = async (email, password, firstName, lastName) => {
    const response = await axios.post('/api/account/register', {
      email,
      password,
      firstName,
      lastName
    });
    const { accessToken, user } = response.data;

    window.localStorage.setItem('accessToken', accessToken);
    const commonDropdown = await getCommonDropdown();
    dispatch({
      type: 'REGISTER',
      payload: {
        user,
        commonDropdown
      }
    });
  };

  const logout = async () => {
    setSession(null);
    localStorage.removeItem('userGridConfig');
    localStorage.removeItem('userPermission');
    dispatch({ type: 'LOGOUT' });
  };

  const resetPassword = () => { };

  const updateProfile = () => { };

  const generateCommonCode = (commonCodes) => commonCodes.filter((code) => code.groupId !== 'D000000');

  const getCommonDropdown = async (user) => {
    const { organizationalChartProduction } = user;
    let factoryPks = [];
    let plantPks = [];
    let teamPks = [];
    let groupPks = [];
    let partPks = [];
    if (!isEmpty(organizationalChartProduction.factoryPks)) {
      factoryPks = organizationalChartProduction.factoryPks.map((factoryPk) => `${factoryPk.factoryCode}-${factoryPk.id}`)
    }
    if (!isEmpty(organizationalChartProduction.plantPks)) {
      plantPks = organizationalChartProduction.plantPks.map((factoryPk) => `${factoryPk.factoryCode}-${factoryPk.id}`)
    }
    if (!isEmpty(organizationalChartProduction.teamPks)) {
      teamPks = organizationalChartProduction.teamPks.map((factoryPk) => `${factoryPk.factoryCode}-${factoryPk.id}`)
    }
    if (!isEmpty(organizationalChartProduction.groupPks)) {
      groupPks = organizationalChartProduction.groupPks.map((factoryPk) => `${factoryPk.factoryCode}-${factoryPk.id}`)
    }
    if (!isEmpty(organizationalChartProduction.partPks)) {
      partPks = organizationalChartProduction.partPks.map((factoryPk) => `${factoryPk.factoryCode}-${factoryPk.id}`)
    }

    const response = await query({
      url: '/v1/catalog/get-common-catalog',
      featureCode: 'user.create',
      timeout: 10000
    });
    let orgChartTree = [];
    const departmentDropdown = [];
    const profileDropdown = [];
    const documentRequestTypeDropdown = [];
    const factoryDropdown = [];
    const factoryDropdownAll = [];
    const factoryDropdownForPlant = [];
    const plantDropdown = [];
    const plantDropdownAll = [];
    const teamDropdown = [];
    const teamDropdownAll = [];
    const groupDropdown = [];
    const groupDropdownAll = [];
    const partDropdown = [];
    const partDropdownAll = [];
    const lineDropdown = [];
    const wipStorageDropdown = [];
    const processDropdown = [];
    const workStationDropdown = [];
    const nodesExpand = [];
    const treeNodes = [];
    let commonCodes = [];
    const materialGroupDropdown = [];
    const mrpControllerDropdown = [];
    const uomDropdown = [];
    const stockDropdown = [];
    const zoneDropdown = [];
    const binDropdown = [];
    const equipmentGroupDropdown = [];
    const equipmentCodeDropdown = [];
    if (response.data) {
      const resData = response.data;
      if (resData.materialGroups) {
        resData.materialGroups.forEach((materialGroup) => {
          const matrGroupCode = getSafeValue(materialGroup?.code);
          const matrGroupFactoryPk = getSafeValue(materialGroup?.factoryPk);
          materialGroupDropdown.push({
            value: matrGroupFactoryPk,
            label: `${matrGroupCode} (${getSafeValue(materialGroup?.name)})`,
            code: matrGroupCode,
            factory: getSafeValue(materialGroup?.pk?.factoryCode)
          });
        });
      }
      if (resData.mrp) {
        resData.mrp.forEach((mrp) => {
          const mrpCode = getSafeValue(mrp?.code);
          const mrpFactoryPk = getSafeValue(mrp?.factoryPk);
          mrpControllerDropdown.push({
            value: mrpFactoryPk,
            label: `${mrpCode} (${getSafeValue(mrp?.name)})`,
            code: mrpCode,
            factory: getSafeValue(mrp?.pk?.factoryCode)
          });
        });
      }
      if (resData.uom) {
        resData.uom.forEach((uom) => {
          const uomCode = getSafeValue(uom?.code);
          const uomFactoryPk = getSafeValue(uom?.factoryPk);
          uomDropdown.push({
            value: uomFactoryPk,
            label: `${uomCode} (${getSafeValue(uom?.name)})`,
            code: uomCode,
            factory: getSafeValue(uom?.pk?.factoryCode)
          });
        });
      }
      if (resData.stock) {
        const stocks = resData.stock;
        stocks.forEach((stock) => {
          const stockCode = getSafeValue(stock?.code);
          const stockFactoryPk = getSafeValue(stock?.factoryPk);
          stockDropdown.push({
            value: stockFactoryPk,
            label: `${stockCode} (${getSafeValue(stock?.name)})`,
            code: stockCode,
            factory: getSafeValue(stock?.pk?.factoryCode),
            stockType: stock.stockType.code
          });
          if (stock.zones) {
            const { zones } = stock;
            zones.forEach((zone) => {
              const zoneCode = getSafeValue(zone?.code);
              const zoneFactoryPk = getSafeValue(zone?.factoryPk);
              zoneDropdown.push({
                value: zoneFactoryPk,
                label: `${zoneCode} (${getSafeValue(zone?.name)})`,
                stock: stockFactoryPk,
                code: zoneCode,
                factory: getSafeValue(zone?.pk?.factoryCode)
              });
              if (zone.bins) {
                const { bins } = zone;
                bins.forEach((bin) => {
                  const binCode = getSafeValue(bin?.code);
                  const binFactoryPk = getSafeValue(bin?.factoryPk);
                  binDropdown.push({
                    value: binFactoryPk,
                    label: `${binCode} (${getSafeValue(bin?.name)})`,
                    stock: stockFactoryPk,
                    zone: zoneFactoryPk,
                    code: binCode,
                    factory: getSafeValue(bin?.pk?.factoryCode)
                  });
                });
              }
            });
          }
        });
      }
      if (resData.commonCode) {
        commonCodes = generateCommonCode(resData.commonCode);
      }
      if (resData.departments) {
        resData.departments.forEach((dept) => {
          const deptCode = getSafeValue(dept?.code);
          const deptFactoryPk = getSafeValue(dept?.factoryPk);
          departmentDropdown.push({
            value: deptFactoryPk,
            label: getSafeValue(dept.name),
            code: deptCode,
            factory: getSafeValue(dept?.pk?.factoryCode)
          });
        });
      }
      if (resData.documentRequestTypes) {
        resData.documentRequestTypes.forEach((drType) => {
          documentRequestTypeDropdown.push({
            value: drType.id.toString(),
            label: drType.name,
            description: drType.description
          });
        });
      }
      if (resData.profiles) {
        resData.profiles.forEach((profile) => {
          const profileCode = getSafeValue(profile?.code);
          const profileFactoryPk = getSafeValue(profile?.factoryPk);
          profileDropdown.push({
            value: profileFactoryPk,
            label: getSafeValue(profile?.name),
            description: getSafeValue(profile?.description)
          });
        });
      }
      const factoryPlan = 20000;
      const factoryActual = 15000;
      const factoryDiff = 5000;
      if (resData.factories) {
        orgChartTree = resData.factories;
        orgChartTree
          .sort((a, b) => a.rank - b.rank)
          .forEach((factory) => {
            if (factory.state === 'RUNNING') {
              const factoryCode = getSafeValue(factory?.pk?.factoryCode);
              const factoryPk = getSafeValue(factory?.factoryPk);
              const factoryName = getSafeValue(factory?.name);
              const factoryNodes = {
                value: `factory_${factoryPk}`,
                label: factoryName,
                plan: factoryPlan,
                actual: factoryActual,
                diff: factoryDiff
              };
              factoryDropdownAll.push({
                value: factoryPk,
                label: factoryName,
                code: factoryCode
              });
              if (factoryPks.includes(factoryPk)) {
                factoryDropdown.push({
                  value: factoryCode,
                  label: factoryName,
                  code: factoryCode
                });
                factoryDropdownForPlant.push({
                  value: factoryPk,
                  label: factoryName,
                  code: factoryCode
                });
                nodesExpand.push(`factory_${factoryPk}`);
              }
              const plantNodes = [];
              if (factory.plants) {
                const numberOfPlants = factory.plants.length;
                const plantPlan = factoryPlan/numberOfPlants;
                const plantActual = factoryActual/numberOfPlants;
                const plantDiff = factoryDiff/numberOfPlants;
                factory.plants
                  .sort((a, b) => a.rank - b.rank)
                  .forEach((plant) => {
                    if (plant.state === 'RUNNING') {
                      const plantFactoryPk = getSafeValue(plant?.factoryPk);
                      const plantName = getSafeValue(plant?.name);
                      const plantItems = {
                        value: `plant_${plantFactoryPk}`,
                        label: plantName,
                        plan: plantPlan,
                        actual: plantActual,
                        diff: plantDiff
                      };
                      plantDropdownAll.push({
                        value: plantFactoryPk,
                        label: plantName,
                        code: getSafeValue(plant?.code),
                        factory: factoryCode,
                        factoryPk
                      });
                      if (plantPks.includes(plantFactoryPk)) {
                        plantDropdown.push({
                          value: plantFactoryPk,
                          label: plantName,
                          code: getSafeValue(plant?.code),
                          factory: factoryCode,
                          factoryPk
                        });
                        nodesExpand.push(`plant_${plantFactoryPk}`);
                      }
                      const teamNodes = [];
                      if (plant.teams) {
                        const numberOfTeams = plant.teams.length;
                        const teamPlan = plantPlan/numberOfTeams;
                        const teamActual = plantActual/numberOfTeams;
                        const teamDiff = plantDiff/numberOfTeams;
                        plant.teams
                          .sort((a, b) => a.rank - b.rank)
                          .forEach((team) => {
                            if (team.state === 'RUNNING') {
                              const teamFactoryPk = getSafeValue(team?.factoryPk);
                              const teamName = getSafeValue(team?.name);
                              const teamItems = {
                                value: `team_${teamFactoryPk}`,
                                label: teamName,
                                plan: teamPlan,
                                actual: teamActual,
                                diff: teamDiff
                              };
                              teamDropdownAll.push({
                                value: teamFactoryPk,
                                label: teamName,
                                code: getSafeValue(team?.code),
                                factory: factoryCode,
                                factoryPk,
                                plant: plantFactoryPk
                              });
                              if (teamPks.includes(teamFactoryPk)) {
                                teamDropdown.push({
                                  value: teamFactoryPk,
                                  label: teamName,
                                  code: getSafeValue(team?.code),
                                  factory: factoryCode,
                                  factoryPk,
                                  plant: plantFactoryPk
                                });
                                nodesExpand.push(`team_${teamFactoryPk}`);
                              }
                              const groupNodes = [];
                              if (team.groups) {
                                const numberOfGroups = team.groups.length;
                                const groupPlan = teamPlan/numberOfGroups;
                                const groupActual = teamActual/numberOfGroups;
                                const groupDiff = teamDiff/numberOfGroups;
                                team.groups
                                  .sort((a, b) => a.rank - b.rank)
                                  .forEach((group) => {
                                    if (group.state === 'RUNNING') {
                                      const groupFactoryPk = getSafeValue(group?.factoryPk);
                                      const groupName = getSafeValue(group?.name);
                                      const groupItems = {
                                        value: `group_${groupFactoryPk}`,
                                        label: groupName,
                                        plan: groupPlan,
                                        actual: groupActual,
                                        diff: groupDiff
                                      };
                                      groupDropdownAll.push({
                                        value: groupFactoryPk,
                                        label: groupName,
                                        code: getSafeValue(group?.code),
                                        team: teamFactoryPk,
                                        factory: factoryCode,
                                        factoryPk,
                                        plant: plantFactoryPk
                                      });
                                      if (groupPks.includes(groupFactoryPk)) {
                                        groupDropdown.push({
                                          value: groupFactoryPk,
                                          label: groupName,
                                          code: getSafeValue(group?.code),
                                          team: teamFactoryPk,
                                          factory: factoryCode,
                                          factoryPk,
                                          plant: plantFactoryPk
                                        });
                                        nodesExpand.push(`group_${groupFactoryPk}`);
                                      }
                                      const partNodes = [];
                                      if (group.parts) {
                                        const numberOfParts = group.parts.length;
                                        const partPlan = groupPlan/numberOfParts;
                                        const partActual = groupActual/numberOfParts;
                                        const partDiff = groupDiff/numberOfParts;
                                        group.parts
                                          .sort((a, b) => a.rank - b.rank)
                                          .forEach((part) => {
                                            if (part.state === 'RUNNING') {
                                              const partFactoryPk = getSafeValue(part?.factoryPk);
                                              const partName = getSafeValue(part?.name);
                                              const partItems = {
                                                value: `part_${partFactoryPk}`,
                                                label: partName,
                                                plan: partPlan,
                                                actual: partActual,
                                                diff: partDiff
                                              };
                                              partDropdownAll.push({
                                                value: partFactoryPk,
                                                label: partName,
                                                code: getSafeValue(part?.code),
                                                team: teamFactoryPk,
                                                group: groupFactoryPk,
                                                factory: factoryCode,
                                                factoryPk,
                                                plant: plantFactoryPk
                                              });
                                              if (partPks.includes(partFactoryPk)) {
                                                partDropdown.push({
                                                  value: partFactoryPk,
                                                  label: partName,
                                                  code: getSafeValue(part?.code),
                                                  team: teamFactoryPk,
                                                  group: groupFactoryPk,
                                                  factory: factoryCode,
                                                  factoryPk,
                                                  plant: plantFactoryPk
                                                });
                                                nodesExpand.push(`part_${partFactoryPk}`);
                                                const lineNodes = [];
                                                if (part.lines) {
                                                  const numberOfLines = part.lines.length;
                                                  const linePlan = partPlan/numberOfLines;
                                                  const lineActual = partActual/numberOfLines;
                                                  const lineDiff = partDiff/numberOfLines;
                                                  part.lines
                                                    .sort((a, b) => a.rank - b.rank)
                                                    .forEach((line) => {
                                                      if (line.state === 'RUNNING') {
                                                        const lineFactoryPk = getSafeValue(line?.factoryPk);
                                                        const lineName = getSafeValue(line?.name);
                                                        const wip = line?.stock;
                                                        lineDropdown.push({
                                                          value: lineFactoryPk,
                                                          label: lineName,
                                                          code: getSafeValue(line?.code),
                                                          team: teamFactoryPk,
                                                          group: groupFactoryPk,
                                                          part: partFactoryPk,
                                                          factory: factoryCode,
                                                          factoryPk,
                                                          plant: plantFactoryPk,
                                                          processType: line?.processType.code
                                                        });
                                                        if (wip) {
                                                          wipStorageDropdown.push({
                                                            value: wip?.factoryPk,
                                                            label: wip?.name,
                                                            factory: factoryCode,
                                                            factoryPk,
                                                          })
                                                        }
                                                        const lineItems = {
                                                          value: `line_${lineFactoryPk}`,
                                                          label: lineName,
                                                          plan: linePlan,
                                                          actual: lineActual,
                                                          diff: lineDiff
                                                        };
                                                        const processNodes = [];
                                                        if (line.processes) {
                                                          line.processes
                                                            .sort((a, b) => a.rank - b.rank)
                                                            .forEach((process) => {
                                                              if (process.state === 'RUNNING') {
                                                                const processFactoryPk = getSafeValue(process?.factoryPk);
                                                                const processName = getSafeValue(process?.name?.name);
                                                                processDropdown.push({
                                                                  value: processFactoryPk,
                                                                  label: processName,
                                                                  code: getSafeValue(process?.code),
                                                                  team: teamFactoryPk,
                                                                  group: groupFactoryPk,
                                                                  part: partFactoryPk,
                                                                  line: lineFactoryPk,
                                                                  factory: factoryCode,
                                                                  factoryPk,
                                                                  plant: plantFactoryPk,
                                                                  finalYn: process?.finalYn
                                                                });

                                                                const processItems = {
                                                                  value: `process_${processFactoryPk}`,
                                                                  label: processName
                                                                };
                                                                processNodes.push(processItems);
                                                                if (process.workStations) {
                                                                  process.workStations
                                                                    .sort((a, b) => a.rank - b.rank)
                                                                    .forEach((workStation) => {
                                                                      if (workStation.state === 'RUNNING') {
                                                                        const wsFactoryPk = getSafeValue(
                                                                          workStation?.factoryPk
                                                                        );
                                                                        const wsName = getSafeValue(workStation?.name);
                                                                        workStationDropdown.push({
                                                                          value: wsFactoryPk,
                                                                          label: wsName,
                                                                          code: getSafeValue(workStation?.code),
                                                                          team: teamFactoryPk,
                                                                          group: groupFactoryPk,
                                                                          part: partFactoryPk,
                                                                          line: lineFactoryPk,
                                                                          process: processFactoryPk,
                                                                          factory: factoryCode,
                                                                          factoryPk,
                                                                          plant: plantFactoryPk
                                                                        });
                                                                      }
                                                                    });
                                                                }
                                                              }
                                                            });
                                                          if (!isEmpty(processNodes)) {
                                                            lineItems.children = processNodes;
                                                          }
                                                          lineNodes.push(lineItems);
                                                        }
                                                      }
                                                    });
                                                  if (!isEmpty(lineNodes)) {
                                                    partItems.children = lineNodes;
                                                  }
                                                  if (partPks.includes(partFactoryPk)) {
                                                    partNodes.push(partItems);
                                                  }
                                                }
                                              }
                                            }
                                          });
                                        if (!isEmpty(partNodes)) {
                                          groupItems.children = partNodes;
                                        }
                                        if (groupPks.includes(groupFactoryPk)) {
                                          groupNodes.push(groupItems);
                                        }
                                      }
                                    }
                                  });

                                if (!isEmpty(groupNodes)) {
                                  teamItems.children = groupNodes;
                                }
                                if (teamPks.includes(teamFactoryPk)) {
                                  teamNodes.push(teamItems);
                                }
                              }
                            }
                          });
                        if (!isEmpty(teamNodes)) {
                          plantItems.children = teamNodes;
                        }
                        if (plantPks.includes(plantFactoryPk)) {
                          plantNodes.push(plantItems);
                        }
                      }
                    }
                  });
                if (!isEmpty(plantNodes)) {
                  factoryNodes.children = plantNodes;
                }
                if (factoryPks.includes(factoryPk)) {
                  treeNodes.push(factoryNodes);
                }
              }
            }
          });
      }
      if (resData.equipmentGroups) {
        resData.equipmentGroups.forEach((equipmentGroup) => {
          const equipmentGroupCode = getSafeValue(equipmentGroup?.code);
          const equipmentGroupFactoryPk = getSafeValue(equipmentGroup?.factoryPk);
          equipmentGroupDropdown.push({
            value: equipmentGroupFactoryPk,
            label: `${equipmentGroupCode} (${getSafeValue(equipmentGroup?.name)})`,
            code: equipmentGroupCode,
            factory: getSafeValue(equipmentGroup?.pk?.factoryCode)
          });
        });
      }
      if (resData.equipmentCodes) {
        resData.equipmentCodes.forEach((equipmentCode) => {
          const equipmentCodesCode = getSafeValue(equipmentCode?.code);
          const equipmentGroupFactoryPk = getSafeValue(equipmentCode?.factoryPk);
          equipmentCodeDropdown.push({
            value: equipmentGroupFactoryPk,
            label: `${equipmentCodesCode} (${getSafeValue(equipmentCode?.name)})`,
            code: equipmentCodesCode,
            factory: getSafeValue(equipmentCode?.pk?.factoryCode)
          });
        });
      }
    }
    const userDropdown = await getUserDropdown();
    return {
      orgChartTree,
      departmentDropdown,
      profileDropdown,
      documentRequestTypeDropdown,
      factoryDropdown,
      factoryDropdownAll,
      factoryDropdownForPlant,
      plantDropdown,
      plantDropdownAll,
      teamDropdown,
      teamDropdownAll,
      groupDropdown,
      groupDropdownAll,
      partDropdown,
      partDropdownAll,
      lineDropdown,
      wipStorageDropdown,
      processDropdown,
      workStationDropdown,
      nodesExpand,
      treeNodes,
      commonCodes,
      userDropdown,
      materialGroupDropdown,
      mrpControllerDropdown,
      uomDropdown,
      stockDropdown,
      zoneDropdown,
      binDropdown,
      equipmentGroupDropdown,
      equipmentCodeDropdown
    };
  };

  const getUserDropdown = async () => {
    const response = await query({
      url: '/v1/user/getAll',
      featureCode: 'user.create'
    });
    const userDropdown = response.data.map((user) => ({
      value: user.userName,
      label: `${user.fullName} (${user.userName})`
    }));
    return [{ value: '', label: '' }, ...userDropdown];
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'jwt',
        login,
        logout,
        register,
        resetPassword,
        updateProfile,
        updateCommonDropdown,
        updateAgGridConfig
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };

