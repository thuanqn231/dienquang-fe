import { Box, Button, Checkbox, Typography } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import { isUndefined } from 'lodash';
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import useLocales from 'src/hooks/useLocales';

const Container = styled('div')(() => ({
    marginBottom: 1,
    padding: 1,
    border: `1px solid lightgrey`
}));

export default class ApprovalPathLine extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkedList: [],
            translate: useLocales().translate
        }
    }



    handleChange = (event) => {
        let _checkedList = [];
        if (event.target.checked) {
            _checkedList = [...this.state.checkedList, event.target.name]
        }
        this.setState((state) => ({ checkedList: [...state.checkedList, event.target.name] }));

    };


    render() {
        return (
            <Draggable draggableId={this.props.task.id} index={this.props.index} isDragDisabled={this.props.draft}>
                {provided => (
                    <Container
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Checkbox
                                onChange={this.handleChange}
                                color="primary"
                                value={this.props.task.id}
                                name={this.props.task.id}
                                inputProps={{ 'aria-label': this.props.task.id }}
                            />
                            <Box>
                                {this.props.draft &&
                                    <Box>
                                        <Button variant="outlined" size="small" sx={{ width: 110 }} disabled>{this.state.translate(`button.draft`)}</Button>
                                    </Box>
                                }
                                {isUndefined(this.props.draft) &&
                                    <>
                                        <Button variant="outlined" size="small" sx={{ minWidth: 36, width: 36 }}>{this.state.translate(`button.approve`)}</Button>
                                        <Button variant="outlined" size="small" sx={{ minWidth: 36, width: 36, ml: 0.2 }}>{this.state.translate(`button. consent`)}</Button>
                                        <Button variant="outlined" size="small" sx={{ minWidth: 36, width: 36, ml: 0.2 }}>{this.state.translate(`button.notification`)}</Button>
                                    </>
                                }
                            </Box>
                            <Box sx={{ marginLeft: 1 }}>
                                <Typography variant="body2">
                                    {this.props.task.content}
                                </Typography>
                            </Box>
                        </Box>
                    </Container>
                )}
            </Draggable>
        )
    }
};
