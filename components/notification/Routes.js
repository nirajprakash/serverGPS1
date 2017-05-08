module.exports = notificationRoutes;



function notificationRoutes(app) {


 app.post('/notification/authorize-device/:registrationToken', require('./authorizeDevice.js'));
 app.get('/notification/authorize-device/:registrationToken',  require('./authorizeDevice.js'));

    // // notification routes
    // app.post('/notification/test', require('./notificationRmTest.js'));
    // app.post('/notification/register-device/:registrationToken', verifyClient, require('./firebaseRegisterDevice.js'));

    // app.post('/notification/authorize-device/:registrationToken', verifyAccount, app.oauth.authorise(), require('./firebaseAuthorizeDevice.js'));

    // app.get('/admin/:adminRouteParam/notification/send-message/:accountId', verifyAdmin,
    //     require('./notification_route_test.js'));


    // app.post('/notification/register-restaurantmanager-device/:registrationToken', require('./rmFirebaseRegisterDevice.js'));

    // app.post('/notification/authorize-restaurantmanager-device/:registrationToken', require('./rmFirebaseAuthorizeDevice.js'));
}
