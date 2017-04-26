'use strict';

module.exports = projectAndroidRoutes;

function projectAndroidRoutes(app) {
    app.post('/gps', require('./getGPSData.js'));
     app.get('/gps', require('./getGPSData.js'));
}
