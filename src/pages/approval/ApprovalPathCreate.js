// material
import { styled } from '@material-ui/core/styles';
import React from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from "react-beautiful-dnd";
import ApprovalPathColumn from './ApprovalPathColumn';

// ----------------------------------------------------------------------

const RootStyle = styled('div')({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
});

export default class ApprovalPathCreate extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.approvalPath
    }

    onDragEnd = result => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return;
        }

        if (
            (destination.droppableId === source.droppableId &&
                destination.index === source.index) || destination.index === 0
        ) {
            return;
        }

        const column = this.state.columns[source.droppableId];
        const newApproverIds = Array.from(column.approverIds);
        newApproverIds.splice(source.index, 1);
        newApproverIds.splice(destination.index, 0, draggableId);

        const newColumn = {
            ...column,
            approverIds: newApproverIds,
        };

        const newState = {
            ...this.state,
            columns: {
                ...this.state.columns,
                [newColumn.id]: newColumn,
            },
        };

        this.setState(newState);
        this.props.setApprovalPath(newState);
    };

    resetPathIndex = (moveType, moveIndex, pathLenght) => {
        let newIndex = moveIndex;
        switch (moveType) {
            case 'up':
                newIndex -= 1;
                break;
            case 'down':
                newIndex += 1;
                break;
            case 'top':
                newIndex = 1;
                break;
            case 'bottom':
                newIndex = pathLenght - 1;
                break;

            default:
                break;
        }
        return newIndex;
    }

    handleChangeAction = (actionType, changedId) => {
        if (!changedId) {
            return;
        }
        const { approvers } = this.state;

        const newApprovers = {
            ...approvers,
            [changedId]: {
                ...approvers[changedId],
                type: actionType
            },
        };
        const newState = {
            ...this.state,
            approvers: newApprovers
        };

        this.setState(newState);
        this.props.setApprovalPath(newState);
    }

    handleChangeParallel = (_isParallel, changedId) => {
        if (!changedId) {
            return;
        }
        const { approvers } = this.state;

        const newApprovers = {
            ...approvers,
            [changedId]: {
                ...approvers[changedId],
                isParallel: _isParallel
            },
        };
        const newState = {
            ...this.state,
            approvers: newApprovers
        };

        this.setState(newState);
        this.props.setApprovalPath(newState);
    }

    handleMovePath = (moveType, moveId) => {
        const column = this.state.columns['approval-path'];
        const moveIndex = column.approverIds.indexOf(moveId);
        if ((['up', 'top'].includes(moveType) && moveIndex === 1) || (['down', 'bottom'].includes(moveType) && moveIndex === column.length)) {
            return;
        }
        const newApproverIds = Array.from(column.approverIds);
        newApproverIds.splice(moveIndex, 1);
        newApproverIds.splice(this.resetPathIndex(moveType, moveIndex, column.approverIds.length), 0, moveId); // destination index

        const newColumn = {
            ...column,
            approverIds: newApproverIds,
        };

        const newState = {
            ...this.state,
            columns: {
                ...this.state.columns,
                [newColumn.id]: newColumn,
            },
        };
        this.setState(newState);
        this.props.setApprovalPath(newState);
    }

    removeApproverId = (approverIds, approverId) => {
        const index = approverIds.indexOf(approverId);
        if (index > -1) {
            approverIds.splice(index, 1);
        }
        return approverIds;
    }

    handleDeleteApprover = (approverId) => {
        const { approvers } = this.state;
        const newApprovers = { ...approvers };
        delete newApprovers[approverId];
        const column = this.state.columns['approval-path'];
        const newApproverIds = Array.from(column.approverIds);

        const newColumn = {
            ...column,
            approverIds: this.removeApproverId(newApproverIds, approverId),
        };


        const newState = {
            ...this.state,
            approvers: newApprovers,
            columns: {
                ...this.state.columns,
                [newColumn.id]: newColumn,
            },
        };

        this.setState(newState);
        this.props.setApprovalPath(newState);
    }

    render() {
        return (
            <RootStyle>
                <DragDropContext onDragEnd={this.onDragEnd}>
                    {this.state.columnOrder.map(columnId => {
                        const column = this.state.columns[columnId];
                        const approvers = column.approverIds.map(approverId => this.state.approvers[approverId]);
                        return <ApprovalPathColumn key={column.id} column={column} approvers={approvers} handleMovePath={this.handleMovePath} handleChangeAction={this.handleChangeAction} handleChangeParallel={this.handleChangeParallel} handleDeleteApprover={this.handleDeleteApprover} />;
                    })}
                </DragDropContext>
            </RootStyle>
        );
    }
}

ApprovalPathCreate.propTypes = {
    setApprovalPath: PropTypes.func,
    approvalPath: PropTypes.object
};