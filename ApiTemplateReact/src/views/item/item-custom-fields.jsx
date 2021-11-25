'use strict';
let React = require('react');
let ReactRedux = require('react-redux');
let Entities = require('html-entities').XmlEntities;
let Moment = require('moment');

class ItemCustomFieldsComponent extends React.Component {
    componentDidMount() {
        if (typeof window !== 'undefined') {
            var $ = window.$;
        }
    }

    renderCustomFields() {
        let self = this;

        if (self.props.itemDetails.CustomFields) {
            return self.props.itemDetails.CustomFields.map(function (property, index) {
                let loopVals = property.Values.filter(x => x !== null && x.length > 0)
                let valCtr = loopVals.length;
                if (valCtr === 0) return;
                return (
                    <div key={index} className="idclt-custom-field full-width">
                        <span className="title" data-code={property.Code} data-name={property.Name}>{property.Name}</span>
                        {self.renderValues(property, loopVals, valCtr)}
                    </div>
                )
            });
        }

        return '';
    }

    renderValues(property, values, valCtr) {
        let pdfFilename = "";
        let self = this;
        if (property.DataInputType != null) {
            if (property.DataInputType.toLowerCase() == "upload") {
                if (property.Values && property.Values.length > 0) {
                    var splitUrl = property.Values[0].split('/');
                    var filename = splitUrl[splitUrl.length - 1];
                    var index = filename.indexOf('_');

                    pdfFilename = filename.substring(index + 1);
                }
            }
        }
        const entities = new Entities();

        return values.map(function (propertyValue, index) {
            let first = "";
            if (valCtr > 1) {
                first = ",";
            }

            valCtr--;
            if (property.DataInputType != null) {
                if (property.DataInputType.toLowerCase() == "hyperlink / url") {
                    let hyperlink = propertyValue;
                    if (!propertyValue.startsWith("http") && !propertyValue.startsWith("https")) {
                        hyperlink = "http\://" + propertyValue;
                    }

                    return (
                        <span className="custom-field" key={index}>
                            <p>
                                <a href={hyperlink} target="_blank">{propertyValue + first}</a>
                            </p>
                        </span>
                    )
                }
                else if (property.DataInputType.toLowerCase() == "number") {
                    return (
                        <span className="custom-field" key={index}>
                            <p style={{ "wordWrap": "break-word" }}>{parseFloat(propertyValue).toFixed(2) + first}</p>
                        </span>
                    )
                }
                else if (property.DataInputType.toLowerCase() == "email") {
                    return (
                        <span className="custom-field" key={index}>
                            <p>
                                <a href={`mailto:${propertyValue}`} className="normal-black-text" style={{ "wordWrap": "break-word" }}>{propertyValue + first}</a>
                            </p>
                        </span>
                    )
                }
                else if (property.DataInputType.toLowerCase() == "textarea") {
                    return (
                        <span className="custom-field" key={index}>
                            <p>
                                <span className="normal-black-text" style={{ "wordWrap": "break-word" }} dangerouslySetInnerHTML={{ __html: propertyValue }} />
                            </p>
                        </span>
                    )
                }
                else if (property.DataInputType.toLowerCase() == "upload") {
                    return (
                        <span className="custom-field" key={index}>
                            <p>
                                <span className="normal-black-text" style={{ "wordWrap": "break-word" }}><a href={propertyValue} target="_blank">{pdfFilename + first}</a></span>
                            </p>
                        </span>
                    )
                }
                else if (property.DataInputType.toLowerCase() == "location") {
                    let googleMapKey = process.env.GOOGLE_MAP_API_KEY;

                    if (propertyValue && propertyValue.length === 0) {
                        value = " ";
                    }

                    let srcUrl = "https://www.google.com/maps/embed/v1/place?q=" + encodeURI(propertyValue) + "&key=" + googleMapKey;
                    return (
                        <div className="map-area" key={index}>
                            <div style={{ "overflow": 'hidden', "width": '568px', "height": '336px', "resize": 'none', "maxWidth": '100%' }}>
                                <div id="embed-map-display" style={{ height: '100%', width: '100%', 'maxWidth': '100%' }}>
                                    <iframe style={{ height: '100%', width: '100%', border: '0', }} frameBorder="0"
                                        src={srcUrl}></iframe>
                                </div>
                            </div>
                        </div >
                    )
                } else if (property.DataInputType.toLowerCase() == "formattedtext") {
                    let decodeText = entities.decode(propertyValue);
                    return (
                        <span className="custom-field" key={index}>
                            <div dangerouslySetInnerHTML={{ __html: decodeText }}></div>
                        </span>
                    )
                } else if (property.DataInputType.toLowerCase() == "datetime" || property.DataInputType.toLowerCase() == "date") {
                    let datetime = "";
                    if (propertyValue > 1) {
                        datetime = Moment.unix(propertyValue).utc().local().format('DD/MM/YYYY');
                        if (property.DataFieldType.toLowerCase() == "datetime") {
                            datetime = datetime + ' ' + Moment.unix(propertyValue).utc().local().format('HH:mm A');
                        }
                        return (
                            <span className="custom-field" key={index}>
                                <p>
                                    {datetime + first}
                                </p>
                            </span>
                        )
                    }
                } else if (property.DataInputType.toLowerCase() == "checkbox") {
                    return (
                        <span className="custom-field" key={index}>
                            <p>
                                {propertyValue}
                            </p>
                        </span>
                    )
                } else {
                    return (
                        <span className="custom-field" key={index}>
                            <p>
                                {propertyValue + first}
                            </p>
                        </span>
                    )
                }
            } else {
                return (
                    <span className="custom-field" key={index}>
                        <p>
                            {propertyValue + first}
                        </p>
                    </span>
                )
            }
        });
    }

    render() {
        return (
            <div className="idcl-bot">
                <div className="idclt-custom-field full-width">
                    <span className="title">Description</span>
                    <span className="custom-field"><p>
                        <span>{this.props.itemDetails.BuyerDescription}</span></p>
                    </span>
                </div>
                {this.props.customContent}
                <div className="idclt-custom-field full-width">
                    {this.renderCustomFields()}
                </div>
            </div>
        );
    }
}

module.exports = ItemCustomFieldsComponent;