'use strict';
var self = getGPSData;
module.exports = self;

var mModel = sequelize.import('../../models/gps_input.js');
var mAsync = require('async');
var mUserMain = require('../../utils/userMain.json');

var _ = require('underscore');

function getGPSData(req, res) {
    var bag = {
        reqHeader: req.headers,
        reqQuery: req.query,
        resBody: {}
    };
    mAsync.series([
        checkInputParams.bind(null, bag),
        verifyAccess.bind(null, bag),
        dbGetData.bind(null, bag),
        assignWithResponse.bind(null, bag)

    ],
        function (err) {
            if (err) {
                res.status(500);
                bag.error = err;

                bag.resBody.status = 0;
                bag.resBody.error = err;
                bag.resBody.message = '[Failed]: ' + err.message;
                winston.error("Error:  ", bag.resBody);
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

    bag.offset = 0;
    if (bag.reqQuery.offset)
        bag.offset = parseInt(bag.reqQuery.offset);

    bag.limit = 1;
    if (bag.reqQuery.limit)
        bag.limit = parseInt(bag.reqQuery.limit);

    bag.auth = {
        'user': bag.reqQuery.username,
        'pass': bag.reqQuery.password
    }

    bag.raw = bag.reqQuery.rawdata;
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


function dbGetData(bag, next) {
    var where = bag.where + '|' + dbGetData.name;
    winston.verbose(where, 'Inside');

    var query = {
        order: [
            ['updatedAt', 'DESC']
        ],
        offset: bag.offset,
        limit: bag.limit
    };

    //query.where.$and = [];

    /*if (bag.bookingStatuses) {
        query.where.$and.push(__generateLikeQueryFromArray(bag.bookingStatuses, 'status'));
    }*/

    winston.debug('query: ', util.inspect(query, false, null, true));
    mModel.findAll(query).asCallback(
        function (err, gpsData) {
            if (err) {
                winston.error(where, errList.dbOperationFailed(), err);
                return next(errList.dbOperationFailed());
            }

            bag.gpsData = _.pluck(gpsData, 'dataValues');
            //winston.verbose(where + "||  bookingList  ||", bag.bookings);


            return next();
        }
    );
}


function assignWithResponse(bag, next) {
    var where = bag.where + '|' + assignWithResponse.name;
    winston.verbose(where, 'Inside');

    if (_.isEmpty(bag.gpsData)) {
        return next();
    }
    var data = [];
    _.each(bag.gpsData, function (gpsRow) {
        var gpsItem = {
            coords: {
                lat: gpsRow.lat,
                lng: gpsRow.lng
            },
            date: gpsRow.date,
            truckId: "aa",
            safety_stat: "SAFE"
        };
        data.push(gpsItem);
    });
    bag.resBody = data;
    return next();
}