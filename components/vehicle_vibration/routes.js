'use strict';

module.exports = projectAndroidRoutes;

var bodyParser = require('body-parser')
function projectAndroidRoutes(app) {
	app.use(bodyParser.json())
    app.post('/vehicle_vibration', require('./postVehicleVibrationData.js'));
}
