'use strict';

var self = firebaseNotificationApp;
module.exports = self;

var firebase = require("firebase");

firebase.initializeApp({
    serviceAccount: serviceAccount: "google-services.json",
    databaseURL: "https://fancymonk-1327.firebaseio.com/"
});

ref = firebase.database().ref();

function listenForNotificationRequests() {
    var requests = ref.child('notificationRequests');
    ref.on('child_added', function(requestSnapshot) {
        var request = requestSnapshot.val();
        sendNotificationToUser(
            request.username,
            request.message,
            function() {
                request.ref().remove();
            }
        );
    }, function(error) {
        console.error(error);
    });
};

function sendNotificationToUser(username, message, onSuccess) {
    request({
        url: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        headers: {
            'Content-Type': ' application/json',
            'Authorization': 'key=' + API_KEY
        },
        body: JSON.stringify({
            notification: {
                title: message
            },
            to: '/topics/user_' + username
        })
    }, function(error, response, body) {
        if (error) {
            console.error(error);
        } else if (response.statusCode >= 400) {
            console.error('HTTP Error: ' + response.statusCode + ' - ' + response.statusMessage);
        } else {
            onSuccess();
        }
    });
}