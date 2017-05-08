'use strict';

var self = testNotification;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var firebaseModel = require('./Model.js');

var FancyFirebase = require('./fancyFirebaseTest.js');

function testNotification(req, res) {
    var bag = {
        reqMonk: req.monk,
        reqBody: req.body,
        reqParams: req.params,
        resBody: {
            status: 1,
            message: 'success',
            errors: [],
            data: {
                isNotificationSent: false
            }
        }
    };

    bag.where = util.format('notifications|%s|accountId:%s', self.name, bag.reqParams.accountId);

    winston.info(bag.where, 'Inside');

    bag.firebase = {};
    async.series([
            _checkInputParams.bind(null, bag),
            __searchFirebaseDeviceTokens.bind(null, bag),
            _sendNotification.bind(null, bag)
        ],
        function(err) {
            winston.info(bag.where, 'Completed');
            if (err) {
                bag.resBody.status = 0;
                bag.resBody.message = 'failed';
                bag.resBody.errors.push(err);
            }
            res.send(bag.resBody);
        }
    );
}

function _checkInputParams(bag, next) {
    var where = bag.where + '|' + _checkInputParams.name;
    winston.verbose(where, 'Inside');

    if (_.isEmpty(bag.reqParams.accountId)) {
        winston.error(where, errList.MissingQueryParam('accountId'));
        return next(errList.MissingQueryParam('accountId'));
    }

    /*
    if (_.isEmpty(bag.reqBody)) {
        winston.error(where, errList.MissingRequestBody());
        return next(errList.MissingRequestBody());
    }
    */

    bag.fancyFirebase = new FancyFirebase();

    return next();
}

function _searchFirebaseDeviceTokens(bag, next) {
    var where = bag.where + '|' + _searchToken.name;
    winston.verbose(where, 'Inside');

    winston.verbose(bag.reqParams.registrationToken, 'registrationToken');

    var query = {
        where: {
            accountId: bag.reqParams.accountId
        }
    };

    firebaseModel.findAll(
        query
    ).asCallback(
        function(err, firebaseDevices) {
            if (err) {
                winston.error(where, errList.DBOperationFailed(), err);
                return next(errList.DBOperationFailed());
            }

            if (_.isEmpty(firebaseDevices)) {
                winston.error(where, 'no result found');
                return next(errList.NoBookingFound());
            } else {

                var pluckedDevices = _.pluck(firebaseDevices, "dataValues");
                var deviceTokens = [];
                // = _.last(pluckedDevices);

                _.each(pluckedDevices, function(device) {
                    deviceTokens.push(device.registrationToken);
                });
                bag.firebaseDeviceTokens = deviceTokens;
                /*
                winston.verbose(firebaseDevice.dataValues, 'Database result');
                bag.firebaseDevice = firebaseDevice;
                winston.verbose(bag.firebaseDevices.dataValues.registrationToken, 'Device Props');
                */
            }

            return next();
        }
    );
}

function _sendNotification(bag, next) {
    var where = bag.where + '|' + _searchToken.name;
    winston.verbose(where, 'Inside');

    winston.verbose(bag.reqParams.accountId, 'accountId');
    bag.firebase.notificationMessage = "notification messagess";


    var data = {
        title: "FancyMonk",
        message: bag.firebase.notificationMessage,
        dataType: 12,
        dataId: "12345stete",
        registeredDevices: bag.firebaseDeviceTokens
    };

    winston.verbose(data, 'DEVICE');

    bag.fancyFirebase.sendNotificationSimple(data,
        function(err, response) {
            if (err) {
                winston.error(where, errList.FancyCallerError('sendNotificationSimple'));
                return next(errList.FancyCallerError('sendNotificationSimple'));
            }
            bag.resBody.data.isNotificationSent = true;
            bag.response = response;

            winston.verbose(bag.response, 'FIREBASE- Respnse');
            return next();
        }
    );
}

/*

bag.fancyCaller.sendOTP(data,
      function(err, response) {
         if (err) {
            winston.error(where, errList.FancyCallerError('sendOTP'));
            return next(errList.FancyCallerError('sendOTP'));
         }

         bag.response = response;
         return next();
      }
   );
*/
