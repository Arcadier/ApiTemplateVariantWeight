'use strict';
const React = require('react');
const BaseComponent = require('../../../../shared/base');

class LocationListComponent extends BaseComponent {
    componentDidMount() {
        this.initializeLegacyScript();
    }

    initializeLegacyScript() {
        const { locations } = this.props;
        const self = this;

        let variantGroupName = '';
        if (locations && locations.length > 0) {
            variantGroupName = locations[0].GroupName;
        }

        SearchableOptionList.defaults.texts.searchplaceholder = `Select ${variantGroupName}`;

        $('#selectCountries').searchableOptionList({
            events: {
                onInitialized() {
                    $('.sol-option input[type="checkbox"]').on('click', function() {
                        let locationIds = [];
                        const locationId = $(this).val();

                        if ($(this).is(':checked')) {
                            const locationName = $(this).parents('.sol-label').find('.sol-label-text').text();
                            $(".sol-inner-container input").removeClass("error-con");

                            locationIds.push(locationId);
                            self.props.addLocations(locationIds);
                        }
                        else {
                            self.props.removeLocation(locationId);
                        }
                    });

                    $('.sol-action-buttons .sol-select-all').on('click', function () {
                        $(".sol-inner-container input").removeClass("error-con");

                        let locationIds = [];

                        $('.sol-option').each(function () {
                            const locationId = $(this).find('input[type="checkbox"]:checked').val();

                            locationIds.push(locationId);
                        });
                        self.props.addLocations(locationIds);
                    });

                    $('.sol-deselect-all').on('click', () => {
                        self.props.removeAllLocations();
                    });

                    $('.sol-input-container input[type="text"]').keypress((e) => {
                        if (e.which == 13) {
                            e.preventDefault();
                        }
                    });

                    if (self.props.selectedLocationIds) {
                        self.props.selectedLocationIds.forEach(function (locationId) {
                            $('.sol-option').each(function () {
                                const $this = $(this);
                                const value = $(this).find('.sol-checkbox').val();

                                if (value == locationId) {
                                    $this.find('.sol-checkbox').prop("checked", true);
                                }
                            });
                        })
                    }
                }
            }
        });
    }

    removeSelectedLocation(locationId, self) {
        const { removeLocation } = self.props;
        removeLocation(locationId);

        $('.sol-current-selection .sol-selected-display-item').each(function (index, el) {
            if ($(el).find('.sol-quick-delete').attr('location-id') === locationId) {
                $(el).remove();
            }
        });
        $('.sol-option input[type="checkbox"]').each(function (index, el) {
            if ($(el).val() === locationId) {
                $(el).prop("checked", false);
            }
        })
    }

    renderOptionValueLocations() {
        const { locations } = this.props;

        return locations.map((location) => {
            return (
                <option key={"opt-" + location.ID} value={location.ID}>{location.Name}</option>
            );
        });
    }

    render() {
        return (
            <div className="col-md-12">
                <div className="row">
                    <form>
                        <div>
                            <div className="form-element-select">
                                <select id="selectCountries" name="country" multiple="multiple">
                                    <optgroup>
                                        {this.renderOptionValueLocations()}
                                    </optgroup>
                                </select>
                                <i className="fa fa-search" aria-hidden="true" />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

module.exports = LocationListComponent;