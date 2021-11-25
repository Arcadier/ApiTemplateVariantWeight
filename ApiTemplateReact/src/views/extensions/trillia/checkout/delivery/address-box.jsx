'use strict';
const React = require('react');
const BaseComponent = require('../../../../shared/base');

class AddressBoxComponent extends BaseComponent {
    render() {
        const { index, address, setDeliveryAddress, showDeleteAddress, showFirst, showSecond } = this.props;

        return (
            <div key={address.ID} onClick={(e) => setDeliveryAddress(address.ID)} className="pdcb-address-box  parent-r-b onboarder-address" style={{ 'height': '210px' }}>
                <span className="pdcb-detail">
                    <p>{showFirst(address.Name)}</p>
                    <p>{showSecond(address.Name)}</p>
                    <p>{address.Line1}</p>
                    <p>{address.City + ", " + [address.State === null ? '' : address.State]}</p>
                    <p>{address.Country}</p>
                    <p>{address.PostCode}</p>
                </span>
                {
                    index > 0 && <span className="icon-delete openModalRemove"><i className="fa fa-trash" onClick={(e) => showDeleteAddress(address.ID)}></i></span>
                }
            </div>
        );
    }
}

module.exports = AddressBoxComponent;