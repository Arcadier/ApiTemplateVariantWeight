'use strict';
var React = require('react');

class LanguageMenuComponentTemplate extends React.Component {
    render() {
        return (
            <li className="h-lanaguage">
                <div id="SelectLanguage" className="dd-container" style={{ width: 'auto' }}>
                    <div className="dd-select" style={{ width: 'auto', background: 'rgb(238, 238, 238)' }}>
                        <input className="dd-selected-value" type="hidden" id="SelectLanguage" value="1" />
                        <a className="dd-selected">
                            <img className="dd-selected-image" src="/assets/images/country_flags/en.svg" style={{ marginRight: '5px' }} />
                            <label className="dd-selected-text" style={{ lineHeight: 17 }}>EN</label>
                        </a>
                        <span className="dd-pointer dd-pointer-down"></span>
                    </div>
                    <ul className="dd-options dd-click-off-close" style={{ width: 'auto', display: 'none' }}>
                        <li>
                            <a className="dd-option dd-option-selected">
                                <input className="dd-option-value" type="hidden" value="1" />
                                <img src="assets/images/gb.svg" className="dd-option-image" />
                                <label className="dd-option-text">EN</label>
                            </a>
                        </li>
                    </ul>
                </div>
            </li>
        )
    }
}

module.exports = LanguageMenuComponentTemplate;