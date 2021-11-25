'use strict';
var React = require('react');
var BaseClassComponent = require('../../shared/base.jsx');
var EnumCoreModule = require('../../../../src/public/js/enum-core.js');
var AddressSettingsButton = require(`./address-settings-button`);
const PermissionTooltip = require('../../common/permission-tooltip');

class AddressSettingsComponent extends BaseClassComponent {
    constructor(props) {
        super(props);
        this.state = {};
        this.onChange = this.onChange.bind(this);
        this.permissionPageType = props.componentType != 'merchant' ? 'consumer' : 'merchant';
    }

    componentDidMount() {
        $('[data-toggle="tooltip"]').tooltip();
    }

    constants() {
        return elements = {
            AddressTab: 'AddressTab',
            AddresBox: 'AddresBox'
        };
    }

    hideShowAddressTabContainer() {

        let returnClass = 'address-tab full-width';

        if (this.props.addresses && this.props.addresses.length > 0) {
            returnClass = returnClass + " hide-me";
        }
        return returnClass;
    }

    hideShowAddressBoxContainer() {

        let returnClass = 'setting-address-box full-width';

        if (!this.props.addresses || this.props.addresses.length < 1) {
            returnClass = returnClass + " hide-me";
        }

        return returnClass;
    }

    hideElement(element) {
        this.props.validatePermissionToPerformAction(`add-${this.permissionPageType}-addresses-api`, () => {
            $('#encodeContainer').removeClass('hide-me');
            $('#boxContainer').removeClass('hide-me');

            if (element == "AddressTab") {
                $('#encodeContainer').addClass('hide-me');
            } else {
                $('#boxContainer').addClass('hide-me');
            }
        });
    }

    addAddress(e) {
        const self = this;
        const target = e.target;

        this.props.validatePermissionToPerformAction(`edit-${this.permissionPageType}-addresses-api`, () => {
            self.validateFields('.address-tab');
            var $this = $(target);
            var $parent = $this.parents(".address-tab");
            if (!$parent.find(".error-con").length && $parent.length) {
                var newAddress = Object.assign({}, self.state, {
                    "Name": self.state['FirstName'] + ' ' + self.state['LastName'],
                    Delivery: true,
                    Pickup: false
                });
                self.props.createAddress((newAddress));

                self.setState({
                    FirstName: '',
                    LastName: '',
                    Line1: '',
                    CountryCode: '',
                    State: '',
                    City: '',
                    PostCode: '',
                }, function () {

                });

                self.hideElement('AddressTab');
            }
        })
    }

    showDeleteAddress(id) {
        const self = this;
        this.props.validatePermissionToPerformAction(`delete-${this.permissionPageType}-addresses-api`, () => {
            $('#modalRemove').modal('show');
            self.setState({
                selectedAddressToDelete: id
            });
        });
    }


    showAddressList() {
        const self = this;
        function showFirst(name) {


            if (name == null)
                return ''

            if (name.indexOf('|') > 0) {
                return name.split('|')[0]
            }
            return name
        }

        function showSecond(name) {

            if (name == null)
                return ''

            if (name.indexOf('|') > 0) {
                return name.split('|')[1]
            }
            return ''
        }

        function addSelectedClass(id) {
            $('[data-address-id]').removeClass('selected')
            $('[data-address-id="' + id + '"]').addClass('selected')
        }

        function showHideDeleteAddress(index,addressID) {
            if (index == 0)
                return ''
            else
                return (
                    <span className="icon-delete openModalRemove">
                        <PermissionTooltip isAuthorized={self.props.addressPermissions.isAuthorizedToDelete} extraClassOnUnauthorized={'icon-grey'}>
                            <i className="fa fa-trash" onClick={(e) => self.showDeleteAddress(addressID)} />
                        </PermissionTooltip>
                    </span>
                )
        }

        if (this.props.addresses && this.props.addresses.length > 0) {
            return (
                this.props.addresses.map(function (addr, index) {

                    if (addr.Pickup != false)
                        return ''

                    return (
                        <div key={addr.ID} onClick={(e) => addSelectedClass(addr.ID)} data-address-id={addr.ID} className="pdcb-address-box  parent-r-b onboarder-address" style={{ 'height': '210px' }}>
                            <span className="pdcb-detail">
                                <p>{showFirst(addr.Name)}</p>
                                <p>{showSecond(addr.Name)}</p>
                                <p>{addr.Line1}</p>
                                <p>{addr.City} {addr.State == null || addr.State == '' ? '' : ', ' + addr.State}</p>
                                <p>{addr.Country}</p>
                                <p>{addr.PostCode}</p>
                            </span>
                            {
                                showHideDeleteAddress(index, addr.ID)
                            }
                            
                        </div >
                    );
                })
            );
        } else
            return '';
    }

    doAddressDelete(e) {
        var self = this;
        this.props.validatePermissionToPerformAction(`delete-${this.permissionPageType}-addresses-api`, () => {
            self.props.deleteAddress(self.state.selectedAddressToDelete);
            $('#modalRemove').modal('hide');
        });
    }

    renderCountry() {

        var countries = []

        EnumCoreModule.GetCountries().map(function (country) {
            countries.push(country.name)
        })

        countries = countries.sort();

        return countries.map(function (country) {
            let theCountry = EnumCoreModule.GetCountries().filter(d => d.name == country);
            return (
                <option key={theCountry[0].alpha2code} value={theCountry[0].alpha2code}>{theCountry[0].name}</option>
            );
        })
    }

    render() {
        let self = this;
        return (
            <React.Fragment>
                <div id="modalRemove" className="modal fade" role="dialog" data-backdrop="static" data-keyboard="false">
                    <div className="modal-dialog delete-modal-content">
                        <div className="modal-content">
                            <div className="modal-body">
                                <p>Are you sure want to delete?</p>
                            </div>
                            <div className="modal-footer">
                                <div className="btn-gray" data-dismiss="modal">Cancel</div>
                                <div className="btn-green" id="btnRemove" onClick={(e) => self.doAddressDelete(e)}>Okay</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="Address" className="tab-pane fade">
                    <div className={self.hideShowAddressTabContainer()} id="encodeContainer">
                        <div className="set-content">
                            <div className="pdc-inputs">
                                <div className="set-inputs">
                                    <div className="input-container"> <span className="title">First Name</span>
                                        <input type="text" className="input-text get-text required" name="first_name" placeholder="First Name" data-react-state-name="FirstName" data-react-state-component-name="Address" defaultValue={self.state.FirstName} value={self.state.FirstName} onChange={self.onChange} />
                                    </div>
                                    <div className="input-container"> <span className="title">Last Name</span>
                                        <input type="text" className="input-text get-text required" name="last" placeholder="Last Name" data-react-state-name="LastName" data-react-state-component-name="Address" defaultValue={self.state.LastName} value={self.state.LastName} onChange={self.onChange} />
                                    </div>
                                </div>
                                <div className="set-inputs">
                                    <div className="input-container full-width"> <span className="title">Address</span>
                                        <input type="text" className="input-text get-text required" name="address" data-react-state-name="Line1" data-react-state-component-name="Address" defaultValue={self.state.Line1} value={self.state.Line1} onChange={self.onChange} />
                                    </div>
                                </div>
                                <div className="set-inputs">
                                    <div className="input-container"> <span className="title">Country</span> <span className="select-option">
                                        <select name="country" className="get-text required" data-react-state-name="CountryCode" data-react-state-component-name="Address" defaultValue={self.state.CountryCode} value={self.state.CountryCode} onChange={self.onChange}>
                                            <option value="">Select your country</option>
                                            {
                                                this.renderCountry()
                                            }
                                        </select>
                                        <i className="fa fa-angle-down" /> </span> </div>
                                    <div className="input-container"> <span className="title">State</span>
                                        <input type="text" className="input-text get-text" name="state" placeholder="State" data-react-state-name="State" data-react-state-component-name="Address" defaultValue={self.state.State} value={self.state.State} onChange={self.onChange} />
                                    </div>
                                </div>
                                <div className="set-inputs">
                                    <div className="input-container"> <span className="title">City</span>
                                        <input type="text" className="input-text get-text required" name="City" data-react-state-name="City" data-react-state-component-name="Address" defaultValue={self.state.City} value={self.state.City} onChange={self.onChange} />
                                    </div>
                                    <div className="input-container"> <span className="title">Postal Code</span>
                                        <input type="text" className="input-text get-text required" name="postal_code" data-react-state-name="PostCode" data-react-state-component-name="Address" defaultValue={self.state.PostCode} value={self.state.PostCode} onChange={self.onChange} />
                                    </div>
                                </div>
                                <div className={"back-to-address " + ((!this.props.addresses || this.props.addresses.length == 0) ? 'hide' : '')} onClick={() => this.hideElement('AddressTab')}>
                                    <svg width="8px" height="12px" viewBox="0 0 8 12" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                            <g id="Group-4" transform="translate(-208.000000, -691.000000)" fill="#4D4D4D" fill-rule="nonzero">
                                                <g id="Group-3" transform="translate(200.000000, 686.000000)">
                                                    <polygon id="" points="14.016 17.072 15.432 15.68 10.824 11.072 15.432 6.488 14.016 5.072 8.016 11.072"></polygon>
                                                </g>
                                            </g>
                                        </g>
                                    </svg>&nbsp;&nbsp; Cancel new address
                                </div>
                            </div>
                        </div>
                        <div className="settings-button">
                            <div className="btn-previous pull-left" onClick={(e) => { $('.nav-pills a:first').tab('show'); }}>Previous</div>
                            {
                                !self.props.addressPermissions.isAuthorizedToEdit ?
                                    <div id="addAddress" className="tool-tip btn-add pull-right icon-grey" data-toggle="tooltip" data-placement={"auto top"} title="" data-original-title="You need permission to perform this action">Add</div>
                                    :
                                    <div id="addAddress" className="btn-add pull-right" onClick={(e) => self.addAddress(e)}>Add</div>
                            }
                        </div>
                    </div>
                    <div className={self.hideShowAddressBoxContainer()} id="boxContainer">
                        <div className="pdc-boxs">
                            {
                                self.showAddressList()
                            }
                            {
                                this.props.addressPermissions.isAuthorizedToAdd ?
                                    <div className="pdcb-address-box btn-add-adress" id="btnAddDeliveryAddress" style={{ height: '210px' }} onClick={(e) => self.hideElement('AddresBox')}>
                                        <span className="icon-address"> 
                                            <img src={`/assets/images/add_address${process.env.TEMPLATE == 'bespoke' ? '_black' : ''}.svg`} />
                                        </span>
                                        <span>Add Delivery Address</span>
                                    </div>
                                : 
                                    <div 
                                        data-toggle="tooltip"
                                        data-placement="top"
                                        data-original-title="You need permission to perform this action" className="pdcb-address-box btn-add-adress icon-grey"
                                        id="btnAddDeliveryAddress" style={{ height: '210px' }}
                                    >
                                        <span className="icon-address">
                                            <img src={`/assets/images/add_address${process.env.TEMPLATE == 'bespoke' ? '_black' : ''}.svg`} />
                                        </span>
                                        <span>Add Delivery Address</span>
                                    </div>
                            }
                        </div>
                        <AddressSettingsButton addressPermissions={this.props.addressPermissions} updateUserToOnboard={this.props.updateUserToOnboard} user={this.props.user}/>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = AddressSettingsComponent;