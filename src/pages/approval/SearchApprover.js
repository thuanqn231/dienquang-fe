import searchFill from '@iconify/icons-eva/search-fill';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Select, { components } from 'react-select';
import { query } from '../../core/api';



const Placeholder = props => <components.Placeholder {...props} />;

const DropdownIndicator = props =>
    <components.DropdownIndicator {...props}>
        <Icon icon={searchFill} width={20} height={20} />
    </components.DropdownIndicator>;

export default class SearchApprover extends Component {

    constructor(props) {
        super(props);

        this.state = {
            options: []
        }
    }

    componentDidMount() {
        this.getOptions()
    }

    async getOptions() {
        const res = await query({
            url: '/v1/user/getAll',
            featureCode: 'user.create'
        })
        const { data } = res;

        const options = data.filter(user => user?.factoryPk !== this.props.userDraft?.id).map(d => ({
            "value": d.factoryPk,
            "label": `${d.fullName} (${d.email})/${d.department.name}`

        }));

        this.setState({ options })

    }

    // handleAddApprover
    handleSelectApprover = (approver) => {
        this.props.handleAddApprover(approver);
    }

    render() {
        const MenuList = props => (
            <components.MenuList {...props}>
                {Array.isArray(props.children) ? props.children.slice(0, 10) : props.children}
            </components.MenuList>
        );
        return (
            <div>
                <Select
                    options={this.state.options}
                    onChange={entry => this.handleSelectApprover(entry)}
                    filterMaxResults={10}
                    value=''
                    components={{ Placeholder, DropdownIndicator, MenuList }}
                    placeholder="Search Approver"
                    menuPortalTarget={document.body}
                    styles={{
                        placeholder: base => ({
                            ...base,
                            fontSize: "1em",
                            fontWeight: 400
                        }),
                        menuPortal: base => ({ ...base, zIndex: 9999 })
                    }}
                />
            </div>
        )
    }
}
SearchApprover.propTypes = {
    handleAddApprover: PropTypes.func,
    userDraft: PropTypes.object
};