'use strict';

process.title = 'consult.api';
module.exports = expressApp;

var glob = require('glob');
var async = require('async');
var express = require('express');
var Sequelize = require('sequelize');


var path = './config/environments/dev.env'

/*var NODE_ENV = process.env.NODE_ENV;
if (NODE_ENV) {
    if (NODE_ENV !== 'dev' && NODE_ENV !== 'beta' && NODE_ENV !== 'prod') {
        __logErrorAndExit('Invalid NODE_ENV', 'NODE_ENV should be dev/beta/prod');
        process.exit();
    }
    console.log('Exporting environment variables..');
    path = './config/environments/' + process.env.NODE_ENV + '.env';
}

*/


require('dotenv').config({
    path: path
});

global.util = require('util');
global.errorCommon = require('./utils/commonError.js');
global.winston = require('winston');

// Create express app
if (require.main === module) {
    global.app = expressApp();
    module.exports = global.app;
}

function expressApp() {
    try {
        winston.info('app starting...');
        var app = express();

        // Set up morgan logging for run mode dev
        if (process.env.RUN_MODE === 'dev') {
            app.use(require('morgan')('dev'));
        }

        app.use(require('body-parser').urlencoded({
            extended: true,
            limit: 1024 * 1024 * 100,
            parameterLimit: 100000
        }));

        app.use(require('cookie-parser')());
        app.use(require('method-override')());
        app.use(express.static(__dirname + '/public'));

        app.get('/', function(req, res) {
            res.render('index');
        });

        // setup
        async.series([
                checkEnvVariables.bind(null),
                connectDB.bind(null),
                addRoutes.bind(null, app),
                startListening.bind(null, app)
            ],
            function(err) {
                if (err)
                    onErrorAndExit('API unable to listen', err);

                return app;
            }
        );

    } catch (err) {
        onErrorAndExit('Uncaught Exception thrown from expressApp: ', err);
    }
}

// async functions

function checkEnvVariables(next) {
    var where = 'app|' + checkEnvVariables.name;
    winston.verbose(where, 'Inside');

    if (!process.env.API_PORT)
        return next({
            message: 'API_PORT is not defined'
        });
    if (!process.env.RUN_MODE)
        return next({
            message: 'RUN_MODE is not defined'
        });
    if (!process.env.DB_NAME)
        return next({
            message: 'DB_NAME is not defined'
        });
    if (!process.env.DB_USER_NAME)
        return next({
            message: 'DB_USER_NAME is not defined'
        });
    if (!process.env.DB_USER_PWD)
        return next({
            message: 'DB_USER_PWD is not defined'
        });
    if (!process.env.DB_HOST)
        return next({
            message: 'DB_HOST is not defined'
        });
    if (!process.env.DB_PORT)
        return next({
            message: 'DB_PORT is not defined'
        });
    if (!process.env.API_URL)
        return next({
            message: 'API_URL is not defined'
        });

    return next();
}

function connectDB(next) {
    var where = 'app|' + connectDB.name;
    winston.verbose(where, 'Inside');

    global.sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER_NAME,
        process.env.DB_USER_PWD, {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: 'mysql',
            define: {
                charset: 'utf8'
            }
        }
    );

    glob.sync('./models/*.js').forEach(
        function(modelFile) {
            importModel(modelFile);
        }
    );

    sequelize.sync({
        logging: winston.info
    }).then(function() {
        winston.debug('database synced');
        return next();
    });
}


/*
function addAuthModels(app, next) {
    var where = 'app|' + _addAuthModels.name;
    winston.verbose(where, 'Inside');

    var oauthConfig = {
        model: require('./allTables/accounts/authMethods.js'),
        grants: ['password', 'refresh_token'],
        debug: true
    };

    app.oauth = oauthserver(oauthConfig);
    app.use(app.oauth.errorHandler());
    return next();
}
*/

function addRoutes(app, next) {
    var where = 'app|' + addRoutes.name;
    winston.verbose(where, 'Inside');

    glob.sync('./components/**/*routes.js').forEach(
        function(routeFile) {
            importRoute(app, routeFile);
        }

    );

    return next();
}

function startListening(app, next) {
    var where = 'app|' + startListening.name;
    winston.verbose(where, 'Inside');

    try {
        app.listen(
            process.env.API_PORT,
            function(err) {
                if (err)
                    return next(err);

                winston.info('API listening on port: ', process.env.API_PORT);
            }
        );
    } catch (error) {
        return next(error);
    }
}

// helper functions
function importRoute(app, routeFile) {
    winston.debug('Requiring route file: ', routeFile);
    require(routeFile)(app);
}

function importModel(modelFile) {
    winston.debug('Importing model file: ', modelFile);
    sequelize.import(modelFile);
}


/*
function __importAccountModel(modelFile) {
    winston.debug('Requiring model file: ' + modelFile);
    require(modelFile);
}
*/

function onErrorAndExit(message, err) {
    winston.error(message);
    winston.error(err);
    if (err.stack) winston.error(err.stack);
    setTimeout(function() {
        process.exit();
    }, 3000);

}