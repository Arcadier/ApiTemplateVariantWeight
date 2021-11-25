var React = require('react');
var BaseClassComponent = require('../../shared/base.jsx');
var $ = require('jQuery');
var Moment = require('moment');

class DateComponent extends BaseClassComponent {
    constructor(props) {
        super(props);

        this.onDateChange = this.onDateChange.bind(this);
    }

    componentDidMount() {

        var _this = this;

        let dateId = `${this.props.customFieldDefinition.Code}-date`;        
        $('#' + dateId).datetimepicker({ format: 'DD/MM/YYYY', 
                        }).keypress(function(event) {
                            // event.preventDefault();
                        }).on("dp.change", function (e) {
                            _this.props.onCustomDateChanged(_this.props.customFieldDefinition, e.target.value, true);
                        });
        let timeId = `${this.props.customFieldDefinition.Code}-time`;
        $('#' + timeId).datetimepicker({ format: 'LT'
                        }).keypress(function (event) {
                            // event.preventDefault();
                        }).on("dp.change", function (e) {
                            _this.props.onCustomDateChanged(_this.props.customFieldDefinition, e.target.value, false);
                        });

        //$('.cmn_date').on('dp.change', function (e) { console.log(e.date); });
    }

    onDateChange(e) {
        console.log(e);
    }

    render() {
        let css = "input-text cmn_date datepicker-txt ";
        let cssTime = "input-text cmn_date_time datepicker-txt ";
        if (this.props.customFieldDefinition.IsMandatory) {
            css += "required";
            cssTime += "required";
        }
        
        let dateVal = "";
        let timeVal = "";
        if (this.props.customFieldValues && this.props.customFieldValues.Values && this.props.customFieldValues.Values.length > 0) {
            dateVal = Moment.unix(this.props.customFieldValues.Values[0]).utc().local().format('DD/MM/YYYY');
            timeVal = Moment.unix(this.props.customFieldValues.Values[0]).utc().local().format('hh:mm A');
        }        
        //if (this.props.customFieldDefinition.DataFieldType === "datetime" && this.props.customFieldValues && this.props.customFieldValues.Values) {
        //    if (this.props.customFieldValues.Values.length > 0) {
        //        dateVal = this.props.Values[0].split(" ")[0];
        //    }
        //    if (this.props.customFieldValues.Values.length > 1) {
        //        timeVal = this.props.Values[1].split(" ")[1];
        //    }
        //}
        let dateId = `${this.props.customFieldDefinition.Code}-date`;
        let timeId = `${this.props.customFieldDefinition.Code}-time`;
        return (
            <React.Fragment>
                <div className="input-container">
                    <div className="custom-datepicker">
                        <span className="additional-one">{this.props.customFieldDefinition.Name}</span><br/>
                        <input type="text" className={css} name="date" placeholder="DD/MM/YYYY" defaultValue={dateVal} id={dateId} />
                        <span className="input-group-addon"><span className="glyphicon glyphicon-calendar"></span></span>
                    </div>
                </div>                
                {
                    this.props.customFieldDefinition.DataFieldType === "datetime" && 
                    (
                        <div className="input-container">
                            <div className="custom-datepicker">
                                <span className="additional-one d-flex">&nbsp;</span><br />
                                <input type="text" className={cssTime} name="date" placeholder="00:00" defaultValue={timeVal} id={timeId} />
                                <span className="input-group-addon"><span className="glyphicon glyphicon-time"></span></span>
                            </div>
                        </div>
                    )
                }
            </React.Fragment>
        )
    }
}

module.exports = DateComponent;