'use strict';

var self = authoriseFirebaseDevice;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var firebaseModel = require('./Model.js');
var restaurantmanagers = sequelize.import('../restaurantmanager/Model.js');

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
            _getRmId.bind(null, bag),
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

    if (_.isEmpty(bag.reqBody.rmToken)) {
       winston.error(where, errList.MissingBodyParam('rmToken'));
       return next(errList.MissingBodyParam('rmToken'));
    }

    if(bag.reqBody.rmToken)
    {
      bag.rmToken = bag.reqBody.rmToken;
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

function _getRmId(bag, next)
{
  var where = bag.where + '|' + _getRmId.name;
  winston.verbose(where, 'Inside');

  var query = {
      where: {
          token: bag.rmToken
      }
  };

  restaurantmanagers.findOne(query)
  .then(function(data)
  {
    // console.log('data', data);
    if(data != null)
    {
      bag.restaurantManager = data;
    }
    else {
      // bag.resBody.message = "not available";
      return next(errList.NoRestaurantManagerFound(bag.rmToken));
    }

    return next();
  })
  .catch(function(err) {
      winston.error('error: ', JSON.parse(JSON.stringify(err)));
      return next(errList.DBOperationFailed());
  });
}


function _attachAccount(bag, next) {

    var where = bag.where + '|' + _attachAccount.name;
    winston.verbose(where, 'Inside');

    if (_.isEmpty(bag.firebaseDevice)) {

        firebaseModel.create({
            registrationToken: bag.reqParams.registrationToken,
            accountId: bag.restaurantManager.id
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
            accountId: bag.restaurantManager.id
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
