'use strict';

module.exports = projectAndroidRoutes;

function projectAndroidRoutes(app) {
    app.post('/gps', require('./postGPSData.js'));
}