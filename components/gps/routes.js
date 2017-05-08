'use strict';

module.exports = projectAndroidRoutes;

function projectAndroidRoutes(app) {
    app.post('/gps', require('./postGPSData.js'));
     app.get('/gps', require('./postGPSData.js'));
     
     app.get('/gps/output', require('./getGPSData.js'));
}
