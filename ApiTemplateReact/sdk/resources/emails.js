'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Emails() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Emails, ArctickClient);

Emails.prototype.sendEdm = function(options, callback) {
    const self = this;

    const from = options.from;
    const to = options.to;
    const subject = options.subject;
    const body = options.body;
    let attachments = options.attachments ? options.attachments : null;

    self._acquireAdminAccessToken(function(err, data) {
        if (!err) {
            self._makeRequest({
                method: 'POST',
                path: '/api/v2/admins/' + data.UserId + '/emails',
                data: {
                    From: from,
                    To: to,
                    Subject: subject,
                    Body: body,
                    Attachments: attachments
                }
            }, callback);
        }
    });
};

module.exports = Emails;
