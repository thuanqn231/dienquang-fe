import PropTypes from 'prop-types';
import searchFill from '@iconify/icons-eva/search-fill';
import { Icon } from '@iconify/react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isEmpty } from 'lodash-es';
import Select, { components } from 'react-select';
import useAuth from '../../hooks/useAuth';
import { useDispatch, useSelector } from '../../redux/store';
import { setSelectedWidget } from '../../redux/slices/page';

const Placeholder = (props) => <components.Placeholder {...props} />;

const DropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <Icon icon={searchFill} width={20} height={20} />
  </components.DropdownIndicator>
);

const MenuList = (props) => (
  <components.MenuList {...props}>
    {Array.isArray(props.children) ? props.children.slice(0, 20) : props.children}
  </components.MenuList>
);

SearchPage.propTypes = {
  isSearchWidget: PropTypes.bool
};

export default function SearchPage({ isSearchWidget }) {
  const { funcPermission } = useAuth();
  const { selectedWidget } = useSelector((state) => state.page);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [options, setOptions] = useState([]);

  useEffect(() => {
    getOptions();
  }, [funcPermission, isSearchWidget]);
  const getOptions = () => {
    let _options;
    if (isSearchWidget) {
      _options = generateOptionsWithWidgets();
    } else {
      _options = generateOptionsWithoutWidgets();
    }
    setOptions(_options);
  };

  const generateOptionsWithoutWidgets = () => {
    const _options = funcPermission
      .filter((f) => f.code !== 'pageNotFound' && f.permissions.includes("READ"))
      .map((d) => ({
        value: d.path,
        label: `${d.name} (${d.path.split('/').slice(-1)})`
      }));
    return _options;
  }

  const generateOptionsWithWidgets = () => {
    const _options = [];
    const _optionsFilter = funcPermission
      .filter((f) => f.code !== 'pageNotFound' && f.permissions.includes("READ"));
    if (!isEmpty(_optionsFilter)) {
      _optionsFilter.forEach((option) => {
        if (isEmpty(option.widgets)) {
          _options.push({
            path: option.path,
            value: option.path,
            pageCode: option.code,
            label: `${option.name} (${option.path.split('/').slice(-1)})`
          });
        } else {
          option.widgets.forEach((widget) => {
            _options.push({
              path: option.path,
              value: widget.code,
              pageCode: option.code,
              widgetName: widget.name,
              label: `${widget.name} (${option.name} - ${option.path.split('/').slice(-1)})`
            });
          });
        }
      })
    }
    return _options;
  }

  const handleSelectPage = (page) => {
    let navigateTo;
    if (isSearchWidget) {
      navigateTo = page.path;
      dispatch(
        setSelectedWidget(
          {
            ...selectedWidget,
            [page.pageCode]:
            {
              widgetCode: page.value,
              widgetName: page.widgetName
            }
          }
        )
      );
    } else {
      navigateTo = page.value;
    }
    navigate(navigateTo);
  };

  return (
    <Select
      options={options}
      onChange={(entry) => handleSelectPage(entry)}
      filterMaxResults={20}
      value=""
      components={{ Placeholder, DropdownIndicator, MenuList }}
      placeholder={`Search ${isSearchWidget ? 'Widget' : 'Screen'}...`}
      styles={{
        placeholder: (base) => ({
          ...base,
          fontSize: '1em',
          fontWeight: 400
        }),
        option: (provided, state) => ({
          ...provided,
          borderBottom: '1px dotted grey',
          color: 'black',
          padding: 20
        })
      }}
    />
  );
}
