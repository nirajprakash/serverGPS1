'use strict';
var self = postGPSData;
module.exports = self;

var mModel = sequelize.import('../../models/vehicle_vibration.js');

function postGPSData(req, res) {
    console.log(req.body);
    res.send("True");
    /*
    EXPLANATION: 
        Here we recieve a post data - which is a json array in string from. 
        We simply save the json array string in the database. 
        
        Each JsonObject denotes a single location data from a vehicle. The 
        json array is a collection of all the data that was collected by a vehicle
        in a single or multiple journeys until being uploaded.

        Later we would convert the string to json array and then get 
        json objects from it, and split the string on the basis of comma, 
        to extract the relevant information associated together as a bundle.

    */
    var vibrationData = {
        data: JSON.stringify(req.body)
    }
    mModel.create(vibrationData)
        .asCallback(
        function (err, project) {
            if (err) {
                console.log(err);
            }
        });    
}