'user strict';

var self = FancyFirebase;
module.exports = self;

var _ = require('underscore');
var request = require('request');

function FancyFirebase() {
    winston.info('FancyFirebase accessed');
}

// simpleNotific request
FancyFirebase.prototype.sendNotificationSimple =
    function(data, callback) {
        var options = {
            method: 'POST',
            url: 'https://fcm.googleapis.com/fcm/send',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'key=AIzaSyBvhlhegfkkHES-rAqkcwOR9__PaPjQVUY' /* + API_KEY */
            },
            body: JSON.stringify({
                /*notification: {
                    title: data.message
                },*/
                data: {
                    title: data.title,
                    id: data.id,
                    message: data.message,
                    type: data.type,
                    typeid: data.typeId
                    /* extra fields */

                },
                registration_ids: data.registeredDevices
            })
        };
        this.makeRequest(options, callback);
};






/*
 *************  TOSMS APIs ends    *************
 */


// make request
FancyFirebase.prototype.makeRequest = function(options, callback) {
    if (_.isEmpty(options)) {
        winston.error(errList.RequestOptionsNotPresent());
        return callback(errList.RequestOptionsNotPresent());
    }
    request(options,
        function(err, res, body) {
            if (err)
                return callback(errList.InternalRequestError(options.url));

            var regex = new RegExp("fcm.googleapis.com");
            if (regex.test(options.url))
                return callback(err, body, res);

            var parsedBody = {};
            var error = null;
            if (!_.isEmpty(body)) {
                if (_.isObject(body)) {
                    parsedBody = body;
                } else {
                    try {
                        parsedBody = JSON.parse(body);
                    } catch (err) {
                        error = true;
                        parsedBody = body;
                        winston.error('Unable to parse body: ', body);
                    }
                }
            }

            return callback(error, parsedBody, res);
        }
    );
};
