import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { withStyles, withTheme, useTheme, makeStyles, createStyles } from "@material-ui/styles";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "react-select";
import { alpha } from "@material-ui/core/styles/";

const useStyles = makeStyles(theme =>
    createStyles({
        root: {
            display: "flex",
            flexWrap: "wrap",
            textAlign: "left",
            flexDirection: "column",
            boxSizing: "border-box"
        },
        grow: {
            flexGrow: 2,
            minWidth: 48
        },
        inputArea: {
            display: "flex",
            position: "relative",
            flexGrow: 1,
            margin: theme.spacing.unit,
            borderRadius: theme.shape.borderRadius,
            backgroundColor: alpha(theme.palette.common.white, 0.15),
            "&:hover": {
                backgroundColor: alpha(theme.palette.common.white, 0.25)
            },
            width: "100%",
            [theme.breakpoints.up("sm")]: {
                marginLeft: theme.spacing.unit * 3.5,
                width: "auto"
            },
            color: "#ccc"
        },
        inputLabel: {
            color: "#666",
            marginBottom: 16,
            // paddingBottom: -16,
            "&$inputLabelError": {
                color: theme.palette.error,
                margin: 0
            },
            "&$inputLabelFocused": {
                color: "#ff665e",
                margin: 0
            },
            inputLabelError: {},
            inputLabelFocused: {},
            shrink: {
                transform: "translate(0, 1.5px) scale(0.75)",
                transformOrigin: "top left",
                color: "#ff665e",
                margin: 0
            },
            zIndex: 2
        },
        shrink: {
            transform: "translate(0, 1.5px) scale(0.75)",
            transformOrigin: "top left",
            color: "#000",
            margin: 0
        }
    })
);

ApproverSelect.propTypes = {
    options: PropTypes.array.isRequired,
    isMulti: PropTypes.bool,
    isRequired: PropTypes.bool,
    isError: PropTypes.bool,
    name: PropTypes.string,
    id: PropTypes.string,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    minWidth: PropTypes.number,
    width: PropTypes.number
};

ApproverSelect.defaultProps = {
    isMulti: false,
    isRequired: false,
    isError: false,
    name: "name",
    label: "Label",
    placeholder: "Select",
    minWidth: 260,
    width: 500,
};

export default function ApproverSelect(props) {
    const classes = useStyles();
    const theme = useTheme();
    const { options } = props;
    const { name } = props;
    const id = 'approver-select';
    const { isMulti } = props;
    const { isRequired } = props;
    const { isError } = props;
    const { label } = props;
    const { minWidth } = props;
    const { width } = props;
    const { placeholder } = props;
    const [selectedValue, setSelectedValue] = useState(null)
    const [selectedOptions, setSelectedOptions] = useState([])
    const isValue = selectedValue || selectedOptions.length;
    const displayError = isError && !isValue;
    const activeColor = theme.palette.action.active;
    const backgroundColor = theme.palette.background.default;
    const darkGrey = theme.palette.grey[600];
    const lightGrey = theme.palette.grey[200];
    const textColor = theme.palette.text.primary;
    const handleChangeMulti = inputValue => {
        const temp = [];
        inputValue.map(value => temp.push(value));
        setSelectedOptions(temp);
    };

    const handleChangeSingle = optionSelected => {
        setSelectedValue(optionSelected.value);
    };
    return (
        <div className={classes.root}>
            <>
                <div className={classes.inputArea}>
                    <FormControl style={{ width }}>
                        <InputLabel
                            htmlFor={id}
                            required={isRequired}
                            error={displayError}
                            shrink={Boolean((selectedValue || selectedOptions.length))}
                            style={{
                                zIndex: 1,
                            }}
                            classes={{
                                shrink: classes.shrink,
                                error: classes.inputLabelError,
                                root: classes.inputLabel,
                                focused: classes.inputLabelFocused
                            }}
                        >
                            {label}
                        </InputLabel>
                        <Input
                            inputComponent={Select}
                            required={isRequired}
                            error={displayError}
                            style={{
                                root: {
                                    minWidth: { minWidth },
                                    width: width || "100%",
                                    marginBottom: 16,
                                    marginTop: 0
                                }
                            }}
                            inputProps={{
                                isMulti,
                                options,
                                placeholder,
                                name,
                                label,
                                id,
                                onChange: isMulti
                                    ? handleChangeMulti
                                    : handleChangeSingle,
                                styles: {
                                    container: (theme, state) => ({
                                        ...theme,
                                        opacity: state.isDisabled ? ".5" : "1",
                                        backgroundColor: "transparent"
                                    }),
                                    control: (theme, state) => ({
                                        // none of react-select's styles are passed to <Control />
                                        ...theme,
                                        color: textColor,
                                        backgroundColor,
                                        border: 1,
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        color: textColor,
                                        zIndex: 5,
                                        backgroundColor,
                                        ":active": {
                                            backgroundColor: activeColor
                                        }
                                    }),
                                    menu: base => ({
                                        ...base,
                                        // override border radius to match the box
                                        borderRadius: 0,
                                        // beautify the word cut by adding a dash see https://caniuse.com/#search=hyphens for the compatibility
                                        hyphens: "auto",
                                        // kill the gap
                                        marginTop: 20,
                                        textAlign: "left",
                                        // prevent menu to scroll y
                                        wordWrap: "break-word",
                                        zIndex: 5
                                    }),
                                    menuList: base => ({
                                        ...base,
                                        // kill the white space on first and last option
                                        padding: 0
                                    }),
                                    multiValue: base => ({
                                        ...base,
                                        borderRadius: 12,
                                        color: textColor
                                    }),
                                    multiValueRemove: base => ({
                                        ...base,
                                        borderRadius: "0 12px 12px 0",
                                        color: textColor,
                                        "&:hover": {
                                            backgroundColor: darkGrey,
                                            color: lightGrey
                                        }
                                    }),
                                    placeholder: base => ({
                                        ...base,
                                        opacity: 0
                                    })
                                }
                            }}
                        />
                    </FormControl>
                </div>
            </>
        </div>
    );
};
