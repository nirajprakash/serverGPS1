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
        resBody: {
            status: 1,
            message: 'success',
            error: {},
            data: {
                isInserted: false
            }
        }
    };
    mAsync.series([
            checkInputParams.bind(null, bag),
            verifyAccess.bind(null, bag),
            dbAddData.bind(null, bag)
        ],
        function(err) {
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
    if (_.isEmpty(bag.reqQuery.rawdata)) {
        winston.error(where, errorCommon.missingQueryParam('rawdata'));
        return next(errorCommon.missingQueryParam('rawdata'));
    }

    bag.auth = {
            'user': bag.reqQuery.username,
            'pass': bag.reqQuery.password
        }
        // if (_.isEmpty(bag.reqHeader.authorization)) {
        //     if (_.isEmpty(bag.reqBody.authorization)) {
        //         winston.error(where, errorCommon.authHeaderNotPresent());
        //         return next(errorCommon.authHeaderNotPresent());
        //     } else {
        //         bag.authHeader = bag.reqBody.authorization.split(' ', 3);
        //     }

    // } else {
    //     bag.authHeader = bag.reqHeader.authorization.split(' ', 3);

    // }

    // if (_.first(bag.authHeader) !== 'Bearer') {
    //     winston.error(where, errorCommon.invalidAuthHeader(bag.authHeader[0]));
    //     return next(errorCommon.invalidAuthHeader(bag.authHeader[0]));
    // }


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


function dbAddData(bag, next) {

    var where = bag.where + '|' + dbAddData.name;
    winston.verbose(where, 'Inside');

    var dbEntry = _getNewModel(bag);
    mModel.create(dbEntry)
        .asCallback(
            function(err, project) {
                // body...
                if (err) {
                    winston.error(where, errorCommon.dbOperationFailed(), err);
                    return next(errorCommon.dbOperationFailed())
                }
                bag.resBody.data.isInserted = true;
                return next();
            }
        );

}


function _getNewModel(bag) {
    var where = bag.where + '|' + _getNewModel.name;
    winston.verbose(where, 'Inside');

    /*
        var featureIdArr = [];
        if (!_.isEmpty(bag.reqQuery.featureIds)) {
            var featureIds = bag.reqQuery.featureIds.split(',');
            if (featureIds && featureIds.length >= 0){

            }

        }
    */

    var rawfields = bag.raw.split("_");

    winston.verbose(where + "| rawfields|", rawfields);
    if (rawfields && rawfields.length >= 2) {
        bag.lat = rawfields[0];
        bag.lng = rawfields[1];
    }
    var date = new Date();

    var data = {
        date: date.toString(),
        raw: bag.raw,
        lat: bag.lat,
        lng: bag.lng
    }

    return data;



}