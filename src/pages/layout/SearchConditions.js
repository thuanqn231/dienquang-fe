import { Checkbox, FormControlLabel, FormGroup, Stack, TextField } from '@material-ui/core';
import { isEmpty, isUndefined } from 'lodash-es';
import PropTypes from 'prop-types';
import { Dropdown, DthDatePicker } from '../../core/wrapper';
import { updateSearchParams } from '../../redux/slices/page';
import { useDispatch, useSelector } from '../../redux/store';

const pxToRem = (value) => `${value / 16}rem`;

const SearchConditions = (props) => {
    const { initSearchParams, selectedWidgetCode } = props;
    const { searchParams } = useSelector((state) => state.page);
    const dispatch = useDispatch();

    const handleChangeSearchConfig = (event) => {
        const _search = {
            ...searchParams,
            [selectedWidgetCode]: {
                ...searchParams[selectedWidgetCode],
                [event.target.name]: `${event.target.value}`
            }
        };
        dispatch(updateSearchParams(_search));
    };

    const handleChangeDateSearchConfig = (name, value) => {
        console.log(name, value);
        const _search = {
            ...searchParams,
            [selectedWidgetCode]: {
                ...searchParams[selectedWidgetCode],
                [name]: `${value}`
            }
        };
        dispatch(updateSearchParams(_search));
    };

    const handleChangeSearchCheckConfig = (event) => {
        const _search = {
            ...searchParams,
            [selectedWidgetCode]: {
                ...searchParams[selectedWidgetCode],
                [event.target.name]: event.target.checked
            }
        };
        dispatch(updateSearchParams(_search));
    }

    return (
        <>
            {
                !isUndefined(initSearchParams[selectedWidgetCode]) && !isEmpty(initSearchParams[selectedWidgetCode]) &&
                initSearchParams[selectedWidgetCode].map((search) => {
                    let value = search.defaultValue;
                    if (!isUndefined(searchParams[selectedWidgetCode]) && !isUndefined(searchParams[selectedWidgetCode][search.id])) {
                        value = searchParams[selectedWidgetCode][search.id];
                    }
                    if (search.type === 'textfield') {
                        return (
                            <TextField
                                size="small"
                                fullWidth
                                id={search.id}
                                key={search.id}
                                name={search.id}
                                label={search.label}
                                value={value}
                                onChange={handleChangeSearchConfig}
                                sx={{ mt: 1, mb: 1 }}
                            />
                        )
                    }
                    if (search.type === 'dropdown') {
                        if (!isUndefined(search.options)) {
                            return (
                                <Dropdown
                                    size="small"
                                    fullWidth
                                    id={search.id}
                                    key={search.id}
                                    name={search.id}
                                    label={search.label}
                                    value={value}
                                    onChange={handleChangeSearchConfig}
                                    sx={{ mt: 1, mb: 1 }}
                                    options={search.options}
                                />
                            )
                        }
                        return (
                            <Dropdown
                                size="small"
                                fullWidth
                                id={search.id}
                                key={search.id}
                                name={search.id}
                                label={search.label}
                                value={value}
                                onChange={handleChangeSearchConfig}
                                sx={{ mt: 1, mb: 1 }}
                                groupId={search.groupId}
                            />
                        )
                    }
                    if (search.type === 'datepicker') {
                        return (
                            <DthDatePicker
                                size="small"
                                fullWidth
                                id={search.id}
                                key={search.id}
                                name={search.id}
                                label={search.label}
                                value={value}
                                defaultValue={search.defaultValue}
                                onChange={(newValue) => { handleChangeDateSearchConfig(search.id, newValue) }}
                                sx={{ mt: 1, mb: 1 }}
                            />
                        )
                    }
                    if (search.type === 'checkboxs') {
                        return (
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0} key='checkboxs'>
                                {
                                    search.list.map((checkbox) => {
                                        let checkboxValue = checkbox.defaultValue;
                                        if (!isUndefined(searchParams[selectedWidgetCode]) && !isUndefined(searchParams[selectedWidgetCode][checkbox.id])) {
                                            checkboxValue = searchParams[selectedWidgetCode][checkbox.id];
                                        }
                                        return (
                                            <FormGroup key={checkbox.id}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            name={checkbox.id}
                                                            style={{ color: 'common.black', fontWeight: 'fontWeightMedium', fontSize: pxToRem(16) }}
                                                            checked={checkboxValue}
                                                            onChange={handleChangeSearchCheckConfig}
                                                            inputProps={{ 'aria-label': 'controlled' }}
                                                        />
                                                    }
                                                    label={checkbox.label}
                                                />
                                            </FormGroup>
                                        )
                                    })
                                }
                            </Stack>
                        )
                    }

                    return (
                        <TextField
                            size="small"
                            fullWidth
                            id={search.id}
                            key={search.id}
                            name={search.id}
                            label={search.label}
                            value={value}
                            onChange={handleChangeSearchConfig}
                            sx={{ mt: 1, mb: 1 }}
                        />
                    )
                })
            }
        </>
    );
}

export default SearchConditions;

SearchConditions.propTypes = {
    initSearchParams: PropTypes.object,
    selectedWidgetCode: PropTypes.string
};