'use strict';

var self = authoriseFirebaseDevice;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var mUserMain = require('../../utils/userMain.json');

var mModel = sequelize.import('../../models/firebase-device.js');

function authoriseFirebaseDevice(req, res) {
    var bag = {
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
        _verifyAccess.bind(null, bag),
        _searchToken.bind(null, bag),
        _getRmId.bind(null, bag),
        _attachAccount.bind(null, bag)
    ],
        function (err) {
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


function checkInputParams(bag, next) {
    var where = bag.where + '|' + checkInputParams.name;
    winston.verbose(where, 'Inside');
    if (_.isEmpty(bag.reqQuery)) {
        winston.error(where, errorCommon.missingRequestQuery());
        return next(errorCommon.missingRequestQuery());
    }

    if (!bag.reqQuery.username) {
        winston.error(where, errorCommon.missingQueryParam("username"));
        return next(errorCommon.missingQueryParam("username"));
    }

    if (!bag.reqQuery.password) {
        winston.error(where, errorCommon.missingQueryParam("password"));
        return next(errorCommon.missingQueryParam("password"));
    }

    if (_.isEmpty(bag.reqParams.registrationToken)) {
        winston.error(where, errorCommon.missingQueryParam('registrationToken'));
        return next(errorCommon.missingQueryParam('registrationToken'));
    }

    return next();
}

function verifyAccess(bag, next) {
    var where = bag.where + '|' + verifyAccess.name;
    winston.verbose(where, 'Inside');

    if (mUserMain.username == bag.auth.user && mUserMain.password == bag.auth.pass) {
        return next();
    }
    return next(errorCommon.unAuthorizedClient(bag.authHeader[1]));
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

    mModel.findOne(
        query
    ).asCallback(
        function (err, firebaseDevice) {
            if (err) {
                winston.error(where, errorCommon.dbOperationFailed(), err);
                return next(errorCommon.dbOperationFailed());
            }

            if (_.isEmpty(firebaseDevice)) {
                winston.error(where, 'no result found');
                //return next(errorCommon.NoBookingFound());
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

        mModel.create({
            registrationToken: bag.reqParams.registrationToken,
            accountId: mUsermain.accountId
        }).asCallback(
            function (err, firebaseDevice) {
                if (err) {
                    winston.error(where, errorCommon.dbOperationFailed(), err);
                    return next(errorCommon.dbOperationFailed());
                }

                //bag.firebaseDevice = firebaseDevice.dataValues;
                bag.resBody.data.isRegistered = true;

                return next();
            }
            );
    } else {
        var update = {
            accountId: mUsermain.accountId
        };


        bag.firebaseDevice.update(update).asCallback(
            function (err, firebaseDevice) {
                if (err) {
                    winston.error(where, errorCommon.dbOperationFailed(), err);
                    return next(errorCommon.dbOperationFailed());
                }

                    winston.verbose(where + "|| update ||", firebaseDevice.dataValues);


                bag.firebaseDevice = firebaseDevice.dataValues;
                bag.resBody.data.isRegistered = true;

                return next();
            }
        );

    }
}
