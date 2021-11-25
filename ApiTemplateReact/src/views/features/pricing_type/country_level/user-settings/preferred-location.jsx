'use strict';
const React = require('react');
const BaseComponent = require('../../../../shared/base');

class UserPreferredLocation extends BaseComponent {
    constructor(props) {
        super(props);
        const { userCustomFields } = props;

        this.customFieldName = 'user_preferred_location';

        let userPreferredLocation = '';

        if (userCustomFields && userCustomFields.length > 0) {
            const customField = userCustomFields.find(c => c.Code.startsWith(this.customFieldName));

            if (customField) {
                userPreferredLocation = customField.Values[0];
            }
        }

        this.state = {
            locations: [],
            userPreferredLocation: userPreferredLocation
        };
    }

    componentDidMount() {
        const self = this;
        const { customFieldDefinition } = this.props;

        this.props.getLocations((locations) => {
            self.setState({
                locations: locations 
            }, function () {
                if (!customFieldDefinition || customFieldDefinition.length == 0 || !customFieldDefinition.find(c => c.Code.startsWith(self.customFieldName))) {
                    self.props.createCustomFieldDefinition({
                        Name: self.customFieldName,
                        DataInputType: 'textfield',
                        DataFieldType: 'string',
                        ReferenceTable: 'Users',
                    });
                }
            });
        });
    }

    getUserPreferredLocation() {
        return this.state.userPreferredLocation;
    }

    render() {
        const { locations } = this.state;
        let locationGroupName = locations.length !== 0 ? locations[0].GroupName : 'Select Country';
        let selectedLocation = this.state.userPreferredLocation === '' ? locationGroupName : this.state.userPreferredLocation;
        return (
            <div className='input-container'>
                <span className='title'>User Location</span>
                <span className="select-option">
                    <select name="country" className="get-text required" value={selectedLocation} data-react-state-name='userPreferredLocation' onChange={(e) => this.onChange(e)} >
                        {locationGroupName !== '' ? <option value="" disable="" select="" hidden='hidden'>{locationGroupName}</option>:'' }
                        {
                            locations.map((location) => {
                                return (
                                    <option key={location.ID} value={location.ID}>{location.Name.trim()}</option>
                                )
                            })
                        }
                    </select>
                    <i className="fa fa-angle-down" />
                </span>
            </div>
        );
    }
}

module.exports = UserPreferredLocation;