'use strict'
var React = require('react');

class AvailabilityComponent extends React.Component {
    renderRow(countries) {
        let self = this;
        if (countries != null) {
            return countries.map(function (data, i) {
                let isPurchasable = "";
                let isUnlimited = "";
                let disabled = "";
                let classRequired = "table-input required numbersOnly stock";
                if (data.unlimited) {
                    isUnlimited = "checked";
                    disabled = "disabled";
                    classRequired = "table-input numbersOnly stock";
                }
                if (data.purchasable) {
                    isPurchasable = "checked";
                }
                if (data.stock) {
                    data.stock = parseInt(data.stock);
                }
                return (
                    <tr key={i} id={"rowAvail" + data.countryCode}>
                        <td>{data.countryName}</td>
                        <td>
                            <input type="text"
                                className="table-input"
                                defaultValue={data.sku}
                                onChange={(e) => self.props.SkuMoqStockChange(e.target.value, "sku", data.countryCode)} />
                        </td>
                        <td>
                            <input type="text"
                                className="table-input numbersOnly"
                                defaultValue={data.moq}
                                onChange={(e) => self.props.SkuMoqStockChange(e.target.value, "moq", data.countryCode)} />
                        </td>
                        <td className="td-stock">
                            <input type="text"
                                className={classRequired}
                                disabled={disabled}
                                defaultValue={data.stock}
                                onChange={(e) => self.props.SkuMoqStockChange(e.target.value, "stock", data.countryCode)} />
                        </td>
                        <td className="check-box unlimited">
                            <span>
                                <input type="checkbox" id={"checkUnli-" + data.countryCode}
                                    onChange={(e) => self.props.unliOrPurchasableChanged("unlimited", data.countryCode)}
                                    checked={isUnlimited} />
                                <label htmlFor={"checkUnli-" + data.countryCode}>
                                </label>
                            </span>
                        </td>
                        <td className="check-box purchaseable">
                            <span>
                                <input type="checkbox" id={"checkAvail-" + data.countryCode}
                                    onChange={(e) => self.props.unliOrPurchasableChanged("purchasable", data.countryCode)}
                                    checked={isPurchasable} />
                                <label htmlFor={"checkAvail-" + data.countryCode}>
                                </label>
                            </span>
                        </td>
                    </tr>
                )
            })
        }
    }

    render() {
        let purchasableAll = "";
        let unlimitedAll = "";

        this.props.availabilities.forEach(function (data) {
            if (data.purchasableAll) {
                purchasableAll = "checked";
            }
            if (data.unlimitedAll) {
                unlimitedAll = "checked";
            }
        });

        return (
            <React.Fragment>
                <div className="tab-container tabcontent" id="availability_tab">
                    <div className="tab-title">
                        <div className="tab-text">
                            <span>Availability</span>
                        </div>
                    </div>
                    <div className="tab-content un-inputs">
                        <div className="col-md-12">
                            <div className="row">
                                <div className="un-ul-table">
                                    <table className="table" id="tblAvailability">
                                        <thead>
                                            <tr>
                                                <th>Country</th>
                                                <th>SKU</th>
                                                <th>MOQ</th>
                                                <th>Stock*</th>
                                                <th className="check-box unlimited">
                                                    <span>
                                                        <input type="checkbox" id="checkUnlimited"
                                                            onChange={(e) => this.props.unliOrPurchasableChanged("unlimitedall", "none")}
                                                            checked={unlimitedAll} />
                                                        <label htmlFor="checkUnlimited" />
                                                    </span>
                                                    Unlimited
                                                    </th>
                                                <th className="check-box purchaseable">
                                                    <span>
                                                        <input type="checkbox" id="checkPurchaseable"
                                                            onChange={(e) => this.props.unliOrPurchasableChanged("purchasableall", "none")}
                                                            checked={purchasableAll} />
                                                        <label htmlFor="checkPurchaseable" />
                                                    </span>
                                                    Purchasable
                                                    </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.renderRow(this.props.availabilities)}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = AvailabilityComponent;