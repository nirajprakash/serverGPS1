'use strict';

module.exports = projectAndroidRoutes;

function projectAndroidRoutes(app) {
    app.get('/truck', require('./getTrucks.js'));
}