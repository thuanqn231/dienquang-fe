import React, { Component } from 'react';

import Select from 'react-select';

const priorityOption = [
    { value: 'D054001', label: 'URGENT', color: '#FF4842' },
    { value: 'D054002', label: 'HIGH', color: '#FFC107' },
    { value: 'D054003', label: 'NORMAL', color: '#1890FF' },
]

export default class ApprovalPriority extends Component {

    handleChangePriority = (priority) => {
        this.props.handleChangePriority(priority);
    }

    render() {

        return (
            <>
                <Select
                    className="basic-single"
                    classNamePrefix="select"
                    defaultValue={priorityOption[2]}
                    name="approval-priority"
                    options={priorityOption}
                    onChange={entry => this.handleChangePriority(entry)}
                    placeholder="Approval Priority"
                    styles={{
                        container: base => ({
                            ...base,
                            width: "10vw"
                        })
                    }}
                />
            </>
        );
    }
}