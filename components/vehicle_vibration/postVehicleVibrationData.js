'use strict';
var self = postGPSData;
module.exports = self;

var mModel = sequelize.import('../../models/vehicle_vibration.js');

function postGPSData(req, res) {
    console.log(req.body);
    var error = false;
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
    var jsonArrayString = JSON.stringify(req.body)
    var jsonArray = JSON.parse(jsonArrayString)
    for (var i = jsonArray.length - 1; i >= 0; i--) {
        var partsOfData = JSON.stringify(jsonArray[i].data).split(',');

        console.log(partsOfData[14])
        console.log(partsOfData[15].substring(0,partsOfData[15].length -1))

        var vibrationData = {
            userid : partsOfData[0].substring(1),
            tripid : partsOfData[1],
            username : partsOfData[2],
            time : partsOfData[3],
            vehicle : partsOfData[4],
            accel_x: partsOfData[5],
            accel_y: partsOfData[6],
            accel_z: partsOfData[7],
            gyro_x: partsOfData[8],
            gyro_y: partsOfData[9],
            gyro_z: partsOfData[10],
            magnet_x: partsOfData[11],
            magnet_y: partsOfData[12],
            magnet_z: partsOfData[13],
            latitude: partsOfData[14],
            longitude: partsOfData[15].substring(0,partsOfData[15].length -1)
        }
        mModel.create(vibrationData)
        .asCallback(
        function (err, project) {
            if (err) {
                console.log(err);
                error =true;
            }
        }); 
        res.send(!error);        
    }
       
}

