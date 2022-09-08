import { Box, Button, FormControlLabel, Radio, RadioGroup, Typography } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { toStringCaseCapitalize } from '../../utils/formatString';
import ApprovalPathCreateToolbar from './ApprovalPathCreateToolbar';

const Container = styled('div')(({ theme }) => ({
    margin: theme.spacing(1),
    border: `1px solid lightgrey`
}));

const LineContainer = styled('div')(() => ({
    marginBottom: 1,
    padding: 1,
    border: `1px solid lightgrey`
}));

const ApprovalList = styled('div')(({ theme }) => ({
    padding: theme.spacing(1)
}));

export default class ApprovalPathColumn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedLine: '',
            approverAction: {},
            isParallel: {}
        }
    }

    componentDidMount() {
        const _approverAction = {};
        const _isParallel = {};
        this.props.approvers.map((approver) => {
            _approverAction[approver.userId] = approver.type;
            _isParallel[approver.userId] = approver.isParallel;
            return { _approverAction, _isParallel }
        });
        this.setState({
            approverAction: _approverAction,
            isParallel: _isParallel
        });
    }

    handleChange = (event) => {
        this.setState({ selectedLine: event.target.value })
    }

    handleMovePath = (moveType) => {
        this.props.handleMovePath(moveType, this.state.selectedLine);
    }

    handleChangeAction = (actionType, selectedLine) => {
        this.props.handleChangeAction(actionType, selectedLine);
        this.changeStateActionType(this.state.selectedLine, actionType);
    }

    handleChangeActionToolbar = (actionType) => {
        this.props.handleChangeAction(actionType, this.state.selectedLine);
        this.changeStateActionType(this.state.selectedLine, actionType);
    }

    handleChangeActionParallel = (actionType) => {
        if (!this.state.selectedLine || this.state.approverAction[this.state.selectedLine] === 'notification') {
            return;
        }
        let _newIsParallel = this.state.isParallel[this.state.selectedLine];
        if (actionType === 'parallel') {
            if (this.state.isParallel[this.state.selectedLine]) {
                return;
            }
            _newIsParallel = true;
        } else {
            _newIsParallel = false;
        }
        this.props.handleChangeParallel(_newIsParallel, this.state.selectedLine);
        this.changeStateParallel(this.state.selectedLine, _newIsParallel);
    }

    changeStateParallel = (approver, _isParallel) => {
        const { isParallel } = this.state;
        const newIsParallel = {
            ...isParallel,
            [approver]: _isParallel,
        };
        this.setState((state) => ({
            ...state,
            isParallel: newIsParallel
        }));
    }

    changeStateActionType = (approver, actionType) => {
        const { approverAction } = this.state;
        const newApproverAction = {
            ...approverAction,
            [approver]: actionType,
        };
        this.setState((state) => ({
            ...state,
            approverAction: newApproverAction
        }));
    }

    getApprovalType = (approverType, isParallel) => {
        if (isParallel) {
            return toStringCaseCapitalize(`Parallel_${approverType}`, "_");
        }
        return toStringCaseCapitalize(approverType, "_");
    }

    handleDeleteApprover = () => {
        this.props.handleDeleteApprover(this.state.selectedLine);
    }

    render() {
        return (
            <Container>
                <ApprovalPathCreateToolbar handleMovePath={this.handleMovePath} handleDeleteApprover={this.handleDeleteApprover} handleChangeActionToolbar={this.handleChangeActionToolbar} handleChangeActionParallel={this.handleChangeActionParallel} countOfApprover={this.props.approvers.length} selectedLine={Boolean(this.state.selectedLine)} />
                <Droppable droppableId={this.props.column.id}>
                    {provided => (
                        <ApprovalList ref={provided.innerRef} {...provided.droppableProps}>
                            {this.props.approvers.map((approver, index) => (
                                <RadioGroup key={approver.userId} aria-label="approval-line" name="approval-line" value={this.state.selectedLine} onChange={this.handleChange}>
                                    <Draggable draggableId={approver.userId} index={index} isDragDisabled={approver.type === 'DRAFT'}>
                                        {provided => (
                                            <LineContainer
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                ref={provided.innerRef}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <FormControlLabel value={approver.userId} control={<Radio />} disabled={approver.type === 'DRAFT'} label={false} sx={{ ml: 0.2, mr: 0 }} />
                                                    {(approver.type === 'DRAFT') &&
                                                        <Box>
                                                            <Button variant="outlined" size="small" sx={{ width: 130 }} disabled>{this.getApprovalType(approver.type, approver.isParallel)}</Button>
                                                        </Box>
                                                    }
                                                    {(approver.type !== 'DRAFT' && approver.isParallel) &&
                                                        <Box>
                                                            <Button variant="outlined" size="small" sx={{ width: 130 }}>{this.getApprovalType(approver.type, approver.isParallel)}</Button>
                                                        </Box>
                                                    }
                                                    {approver.type !== 'DRAFT' && !approver.isParallel &&
                                                        <Box>
                                                            <Button variant={approver.type === 'APPROVER' ? "contained" : "outlined"} size="small" sx={{ minWidth: 42, width: 42 }} onClick={() => this.handleChangeAction('APPROVER', approver.userId)}>Appr</Button>
                                                            <Button variant={approver.type === 'CONSENT' ? "contained" : "outlined"} size="small" sx={{ minWidth: 42, width: 42, ml: 0.2 }} onClick={() => this.handleChangeAction('CONSENT', approver.userId)}>Cons</Button>
                                                            <Button variant={approver.type === 'NOTIFICATION' ? "contained" : "outlined"} size="small" sx={{ minWidth: 42, width: 42, ml: 0.2 }} onClick={() => this.handleChangeAction('NOTIFICATION', approver.userId)}>Noti</Button>
                                                        </Box>
                                                    }
                                                    <Box sx={{ marginLeft: 1 }}>
                                                        <Typography variant="body2">
                                                            {approver.content}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </LineContainer>
                                        )}
                                    </Draggable>
                                </RadioGroup>
                            ))}
                            {provided.placeholder}
                        </ApprovalList>
                    )}
                </Droppable>
            </Container>
        );
    }
}

ApprovalPathColumn.propTypes = {
    approvers: PropTypes.array,
    column: PropTypes.object,
    handleMovePath: PropTypes.func,
    handleChangeParallel: PropTypes.func,
    handleChangeAction: PropTypes.func,
};