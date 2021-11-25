'use strict';
var React = require('react');
var EnumCoreModule = require('../../../../../../public/js/enum-core');

class CountryComponent extends React.Component {
    componentDidMount() {
        this.initializeLegacyScript();
    }

    initializeLegacyScript() {
        const countryList = EnumCoreModule.GetCountries();
        const self = this;
        let addCountries = [];

        const bindCountryDeleteAction = function (countryCode, countryName) {
            $('.sol-current-selection .sol-selected-display-item').each(function (index, el) {
                if ($(el).find('.sol-selected-display-item-text').html() == countryName) {
                    const buttonDelete = $(el).find('.sol-quick-delete');

                    buttonDelete.attr('country-id', countryCode);
                    buttonDelete.off('click',() => self.removeSelectedCountry(countryCode,self));
                    buttonDelete.on('click', () => self.removeSelectedCountry(countryCode, self));
                    return false;
                }
            });
        };

        $('#selectCountries').searchableOptionList({
            events: {
                onInitialized() {
                    $('.sol-option input[type="checkbox"]').on('click', function () {
                        var countryCode = $(this).val();
                        if ($(this).is(':checked')) {
                            var countryName = $(this).parents('.sol-label').find('.sol-label-text').text();
                            $(".sol-inner-container input").removeClass("error-con");
                            addCountries.push({
                                id: countryCode,
                                name: countryName
                            });
                            self.props.addCountries(addCountries);
                            setTimeout(function () {
                                bindCountryDeleteAction(countryCode, countryName);
                            }, 500);
                        }
                        else {
                            self.props.removeCountry(countryCode);
                        }
                      
                    });

                    $('.sol-action-buttons .sol-select-all').on('click', function () {
                        $(".sol-inner-container input").removeClass("error-con");
                        $('table#tblAvailability > tbody > tr').remove();
                        $('table#tblPricing > tbody > tr').remove();

                        const countriesToAdd = [];

                        $('.sol-option').each(function () {
                            var $this = $(this);
                            var countryCode = $this.find('input[type="checkbox"]:checked').val();
                            var countryName = $(this).find('.sol-label-text').text();

                            countriesToAdd.push({
                                id: countryCode,
                                name: countryName
                            });
                            setTimeout(function () {
                                bindCountryDeleteAction(countryCode, countryName);                                
                            }, 500);
                        });
                        self.props.addCountries(countriesToAdd);
                    });

                    $('.sol-deselect-all').on('click', function () {
                        self.props.removeAllCountries();
                    });

                    $('.sol-input-container input[type="text"]').keypress(function (e) {
                        if (e.which == 13) {
                            e.preventDefault();
                        }
                    });

                    if (countryList) {
                        Object.keys(countryList).map(function(key) {
                            bindCountryDeleteAction(countryList[key].alpha2code, countryList[key].name);
                        });
                    }
                    if (self.props.countries) {
                        self.props.countries.forEach(function (country) {
                            $('.sol-option').each(function () {
                                var $this = $(this);
                                var countryName = $(this).find('.sol-label-text').text();
                                let countryCode = $(this).find('.sol-checkbox').val();

                                if (countryCode === country.id) {
                                    $(this).find('.sol-checkbox').prop("checked", true);

                                    let html = "<span class='sol-quick-delete' country-id=" + countryCode +
                                        ">×</span ><span class='sol-selected-display-item-text'>" + countryName + "</span>";

                                    // create a new div element 
                                    let newDiv = document.createElement("div");
                                    $(newDiv).addClass("sol-selected-display-item")
                                    $(newDiv).append(html);                                   
                                    $('.sol-current-selection').append(newDiv);

                                    setTimeout(function () {
                                        bindCountryDeleteAction(countryCode, countryName);
                                    }, 500);
                                }

                            });
                            $('.sol-current-selection').append("</div>");
                        })
                    }
                }
            }
        });
    }

    removeSelectedCountry(countryCode,self) {
        const { removeCountry } = self.props;
        removeCountry(countryCode);

        $('.sol-current-selection .sol-selected-display-item').each(function (index, el) {
            if ($(el).find('.sol-quick-delete').attr('country-id') === countryCode) {
                $(el).remove();
            }
        });
        $('.sol-option input[type="checkbox"]').each(function (index, el) {
            if ($(el).val() === countryCode) {
                $(el).prop("checked", false);
            }
        })
    }

    renderOptionValueCountries() {
        let self = this;
        return EnumCoreModule.GetCountries().map(function(country) {

            let countrySelected = "";
            self.props.countries.forEach(function(ctr) {
                if (ctr.id === country.alpha2code) {
                    countrySelected = "selected";
                }
            });
            return (
                <option key={"opt" + country.name} value={country.alpha2code}>{country.name}</option>
            );
        });
    }

    renderCheckBoxValueCountries() {
        return EnumCoreModule.GetCountries().map(function(country) {
            return (
                <div className="sol-option" key={"chk" + country.name}>
                    <label className="sol-label">
                        <input type="checkbox" className="sol-checkbox" name="character" defaultValue={country.alpha2code}/>
                        <div className="sol-label-text">
                            {country.name}
                        </div>
                    </label>
                </div>
            );
        });
    }

    render() {
        return (
            <React.Fragment>
                <div className="tab-container tabcontent" id="countries_tab">
                    <div className="tab-title">
                        <div className="tab-text">
                            <span>Countries</span>
                        </div>
                    </div>
                    <div className="tab-content un-inputs">
                        <div className="item-form-element">
                            <div className="col-md-12">
                                <div className="row">
                                    <form>
                                        <div>
                                            <label>Delivers to*</label>
                                            <div className="form-element-select">
                                                <select id="selectCountries" name="country" multiple="multiple">
                                                    <optgroup>
                                                        {this.renderOptionValueCountries()}
                                                    </optgroup>
                                                </select>
                                                
                                                <i className="fa fa-search" aria-hidden="true" />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = CountryComponent;