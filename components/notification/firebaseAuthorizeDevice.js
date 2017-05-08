'use strict';

var self = authoriseFirebaseDevice;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var firebaseModel = require('./Model.js');

function authoriseFirebaseDevice(req, res) {
    var bag = {
        reqMonk: req.monk,
        reqBody: req.body,
        reqParams: req.params,
        resBody: {
            status: 1,
            message: 'success',
            errors: [],
            data: {
                isRegistered: false
            }
        }
    };

    bag.where = util.format('notifications|%s|registrationToken:%s', self.name, bag.reqParams.registrationToken);
    winston.info(bag.where, 'Inside');

    async.series([
            _checkInputParams.bind(null, bag),
            _searchToken.bind(null, bag),
            _attachAccount.bind(null, bag)
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

    if (_.isEmpty(bag.reqParams.registrationToken)) {
        winston.error(where, errList.MissingQueryParam('registrationToken'));
        return next(errList.MissingQueryParam('registrationToken'));
    }

    /*
    if (_.isEmpty(bag.reqBody)) {
        winston.error(where, errList.MissingRequestBody());
        return next(errList.MissingRequestBody());
    }
    */
    return next();
}

function _searchToken(bag, next) {
    var where = bag.where + '|' + _searchToken.name;
    winston.verbose(where, 'Inside');

    winston.verbose(bag.reqParams.registrationToken, 'registrationToken');

    var query = {
        where: {
            registrationToken: bag.reqParams.registrationToken
        }
    };

    firebaseModel.findOne(
        query
    ).asCallback(
        function(err, firebaseDevice) {
            if (err) {
                winston.error(where, errList.DBOperationFailed(), err);
                return next(errList.DBOperationFailed());
            }

            if (_.isEmpty(firebaseDevice)) {
                winston.error(where, 'no result found');
                //return next(errList.NoBookingFound());
            } else {
                winston.verbose(firebaseDevice.dataValues, 'Database result');

                bag.firebaseDevice = firebaseDevice;
                winston.verbose(bag.firebaseDevice.dataValues.registrationToken, 'Device Props');

            }

            return next();
        }
    );
}

function _attachAccount(bag, next) {

    var where = bag.where + '|' + _attachAccount.name;
    winston.verbose(where, 'Inside');

    if (_.isEmpty(bag.firebaseDevice)) {

        firebaseModel.create({
            registrationToken: bag.reqParams.registrationToken,
            accountId: bag.reqMonk.accountId
        }).asCallback(
            function(err, firebaseDevice) {
                if (err) {
                    winston.error(where, errList.DBOperationFailed(), err);
                    return next(errList.DBOperationFailed());
                }

                //bag.firebaseDevice = firebaseDevice.dataValues;
                bag.resBody.data.isRegistered = true;

                return next();
            }
        );
    } else {
        var update = {
            accountId: bag.reqMonk.accountId
        };


        bag.firebaseDevice.update(update).asCallback(
            function(err, firebaseDevice) {
                if (err) {
                    winston.error(where, errList.DBOperationFailed(), err);
                    return next(errList.DBOperationFailed());
                }

                bag.firebaseDevice = firebaseDevice.dataValues;
                bag.resBody.data.isRegistered = true;

                return next();
            }
        );

    }
}
