'use strict';
var React = require('react');

var UserMenuComponentTemplate = require('./user-menu')
var LanguageMenuComponentTemplate = require('./language-menu')
var ExtraMenuComponent = require('./extra-menu');

class HeaderMenuComponentTemplate extends React.Component {

    renderName() {
        if (this.props.user && this.props.user.Guest === false) {
            if (this.props.user.DisplayName) {
                return (
                    <React.Fragment>
                        <p>{this.props.user.DisplayName.substring(0, 15)}</p>
                        <i className="fa fa-angle-down"></i>
                    </React.Fragment>
                )
            }
            return (
                <React.Fragment>
                    <p>{(this.props.user.UserName || '').substring(0, 15)}</p>
                    <i className="fa fa-angle-down"></i>
                </React.Fragment>
            )
        }
        return (<p><a href={this.getLoginUrl()}>REGISTER/SIGN IN</a></p>);
    }


    getLoginUrl() {
        let loc = (location.pathname + location.search).substr(1)
        return `/accounts/non-private/sign-in?returnUrl=${loc}`
    }

    handleMobileToggleClick(e) {
        $(".header.mod li.h-extramenus").slideToggle();
        $(".mobile_top_toggler > span .fa-angle-down").toggleClass("rotate");
        $(".mobile_top_toggler > span").toggleClass('_menu');

        if ($(".mobile_top_toggler > span").hasClass('_menu'))
        {
            var $overlay = $('<div class="menu-overlay"/>').on('click', function () {
                    $('.mobile_top_toggler > span').trigger('click');
                });
            $('body').append( $overlay )
        }
        else 
        {
            $('.menu-overlay').remove();
        }
    }

    render() {
        return (
            <div className="pull-right">
                <ul className="header-menus">
                    <ExtraMenuComponent {...this.props} />
                    <LanguageMenuComponentTemplate {...this.props} />
                    <UserMenuComponentTemplate {...this.props} />
                    <li className="mobile_top_toggler">
                        <span onClick={(e) => this.handleMobileToggleClick(e)}>
                            <span>
                                {this.renderName()}
                            </span>
                        </span>
                    </li>
                </ul>
            </div>
        );
    }
}

module.exports = HeaderMenuComponentTemplate;