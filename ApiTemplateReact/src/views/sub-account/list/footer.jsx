'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

class FooterComponent extends BaseComponent {
    render() {
        return (
            <div className="footer bigger-footer">
                <div className="new-footer-content">
                    <div className="footer-top">
                        <div className="nfc-left">
                            <div className="nfc-menu">
                                <span>Trillia Market</span>
                                <ul>
                                    <li><a href="#" target="_blank">Home</a></li>
                                    <li><a href="#" target="_blank">Diabetes</a></li>
                                    <li><a href="#" target="_blank">Cardiovascular</a></li>
                                    <li><a href="#" target="_blank">Cancer</a></li>
                                    <li><a href="#" target="_blank">Mental Health</a></li>
                                    <li><a href="#" target="_blank">Site Map</a></li>
                                </ul>
                            </div>
                            <div className="nfc-menu">
                                <span>Corporate Info</span>
                                <ul>
                                    <li><a href="#" target="_blank">About Us</a></li>
                                    <li><a href="#" target="_blank">Why Trillia</a></li>
                                    <li><a href="#" target="_blank">Blog</a></li>
                                    <li><a href="#" target="_blank">Careers</a></li>
                                    <li><a href="#" target="_blank">Terms of Services</a></li>
                                    <li><a href="#" target="_blank">Privacy Policy</a></li>
                                </ul>
                            </div>
                            <div className="nfc-menu">
                                <span>My Account</span>
                                <ul>
                                    <li><a href="#" target="_blank">Cart</a></li>
                                    <li><a href="#" target="_blank">Purchase Order</a></li>
                                    <li><a href="#" target="_blank">Settings</a></li>
                                    <li><a href="#" target="_blank">Reset Password</a></li>
                                    <li><a href="#" target="_blank">Logout</a></li>
                                </ul>
                            </div>
                            <div className="nfc-menu">
                                <span>More Info</span>
                                <ul>
                                    <li><a href="#" target="_blank">FAQ's</a></li>
                                    <li><a href="#" target="_blank">Trade Financing</a></li>
                                    <li><a href="#" target="_blank">Vetting Guidelines</a></li>
                                    <li><a href="#" target="_blank">Order Tracking</a></li>
                                    <li><a href="#" target="_blank">Insurance</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="nfc-right">
                            <span>Powered by</span>
                            <div className="footer-logo">
                                <i className="footer-complete-logo" />
                            </div>
                            <span>34 Boon Leat Terrace #04-17</span>
                            <span>Singapore 119866</span>
                            <span>(+65) 6123 4567</span>
                        </div>
                    </div>
                    <div className="footer-bot">
                        <div className="footer-bot-left">
                            <p>Copyright © 2019 Trillia Pte Ltd. All rights reserved. For more corporate information, visit us at <a href="https://www.trillia.io" target="_blank">www.trillia.io</a></p>
                        </div>
                        <ul className="footer-social-navigation">
                            <li>
                                <a href="https://www.facebook.com/trillia" target="_blank" id="facebook">
                                    <img src="/assets/images/fb.svg" alt="facboook" title="facebook" kasperskylab_antibanner="on" className="img-responsive" />
                                </a>
                            </li>
                            <li>
                                <a href="https://www.twitter.com/trilliahealth" target="_blank" id="twitter" className="img-responsive">
                                    <img src="/assets/images/twitter.svg" alt="twitter" title="twitter" kasperskylab_antibanner="on" className="img-responsive" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = FooterComponent;