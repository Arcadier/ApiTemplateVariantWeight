'use strict';
var React = require('react');

class LandingComponent extends React.Component {

    render() {
        return (
            <div className="intrest-area text-center">
                <a href='/accounts/interested-user'>
                    Interested in the marketplace?
                    <br/>
                    click here to let us know!
                </a>
            </div>
        );
    }
}

module.exports = LandingComponent;