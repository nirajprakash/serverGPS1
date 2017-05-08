'use strict';

var self = notificationRmTest;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var FancyFirebase = require('../../utilities/fancyFirebase.js');
var firebaseModel = require('../notification/Model.js');

function notificationRmTest(req, res) {
   var bag = {
      reqBody: req.body,
      resBody: {
         status: 1,
         message: 'success',
         errors: [],
         data: {
         }
      }
   };

   bag.where = util.format('bookings|%s', self.name);
   winston.info(bag.where, 'Inside');

   async.series([
         _checkInputParams.bind(null, bag),
         _searchFirebaseDeviceTokens.bind(null, bag),
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

   if (_.isEmpty(bag.reqBody)) {
      winston.error(where, errList.MissingRequestBody());
      return next(errList.MissingRequestBody());
   }

   if (_.isEmpty(bag.reqBody.msg)) {
      winston.error(where, errList.MissingBodyParam('msg'));
      return next(errList.MissingBodyParam('msg'));
   }

   if (_.isEmpty(bag.reqBody.accountId)) {
      winston.error(where, errList.MissingBodyParam('accountId'));
      return next(errList.MissingBodyParam('accountId'));
   }

   return next();
}

function _searchFirebaseDeviceTokens(bag, next) {
    var where = bag.where + '|' + _searchFirebaseDeviceTokens.name;
    winston.verbose(where, 'Inside');

    var query = {
        where: {
            accountId: bag.reqBody.accountId
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
                return next(errList.NoRegisteredDeviceFound());
            } else {

                var pluckedDevices = _.pluck(firebaseDevices, "dataValues");
                var deviceTokens = [];

                _.each(pluckedDevices, function(device) {
                    deviceTokens.push(device.registrationToken);
                });

                //bag.firebaseDeviceTokens = pluckedDevices.registrationToken;
                bag.firebaseDeviceTokens = deviceTokens;

            }

            return next();
        }
    );
}

function _sendNotification(bag, next) {
    if (bag.firebaseDeviceTokens == null) {
        return next("Notification not sent cause no firebase registered device found");
    }

    bag.fancyFirebase = new FancyFirebase();

    var where = bag.where + '|' + _sendNotification.name;
    winston.verbose(where, 'Inside');

    var notifMsg;


//'restaurantRejected','restaurantAccepted', 'restaurantCompleted'

    notifMsg = bag.reqBody.msg;

    var data = {
        /*notification: {
              title: data.message
          },*/
        data: {
            title: "FancyMonk",
            message: notifMsg,
            type: "waiter-less",
            // dataType: 12,
            // dataId: "12345stete",
            //   id: data.id,
            //   type: data.type,
            //   typeid: data.typeId
            /* extra fields */

        },
        registration_ids: bag.firebaseDeviceTokens,
        //registration_ids: data.registeredDevices,
        priority: 'high', //data.priority,
        //to: bag.firebaseDeviceTokens
        // registeredDevices: bag.firebaseDeviceTokens
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

            if (bag.response.error == "InvalidRegistration") {
                winston.verbose(bag.response.error, 'Notification failed');
            }

            if (bag.response.error == "NotRegistered") {
                // winston.verbose(bag.response.error, 'Notification failed');
                // winston.info('removing entry');
                // var query = {
                //     where: {
                //         accountId: bag.bag.reqBody.accountId
                //     }
                // };
                // firebaseModel.destroy(query).asCallback(
                //     function(err, count) {
                //         if (err) {
                //             winston.error(where, errList.DBOperationFailed(), err);
                //             return next(errList.DBOperationFailed());
                //         }
                //         winston.debug(util.format('deleted %s registered token for accountId: %s', count,
                //             bag.booking.id));
                //         // return next();
                //     }
                // );
            }


            winston.verbose(bag.response, 'FIREBASE- Respnse');
            return next();
        }
    );
}
