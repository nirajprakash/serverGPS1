'use strict'

module.exports = function (sequelize, Datatypes) {
    return sequelize.define('vehicleVibration', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        userid: {
            type: Datatypes.TEXT,
            allowNull: false,
            unique: false
        },tripid: {
            type: Datatypes.TEXT,
            allowNull: false,
            unique: false
        },username: {
            type: Datatypes.TEXT,
            allowNull: false,
            unique: false
        },time: {
            type: Datatypes.TEXT,
            allowNull: false,
            unique: false
        },vehicle: {
            type: Datatypes.TEXT,
            allowNull: false,
            unique: false
        },accel_x: {
            type: Datatypes.FLOAT,
            allowNull: false,
            unique: false
        },accel_y: {
            type: Datatypes.FLOAT,
            allowNull: false,
            unique: false
        },accel_z: {
            type: Datatypes.FLOAT,
            allowNull: false,
            unique: false
        },gyro_x: {
            type: Datatypes.FLOAT,
            allowNull: false,
            unique: false
        },gyro_y: {
            type: Datatypes.FLOAT,
            allowNull: false,
            unique: false
        },gyro_z: {
            type: Datatypes.FLOAT,
            allowNull: false,
            unique: false
        },magnet_x: {
            type: Datatypes.FLOAT,
            allowNull: false,
            unique: false
        },magnet_y: {
            type: Datatypes.FLOAT,
            allowNull: false,
            unique: false
        },magnet_z: {
            type: Datatypes.FLOAT,
            allowNull: false,
            unique: false
        },latitude: {
            type: Datatypes.FLOAT,
            allowNull: false,
            unique: false
        },longitude: {
            type: Datatypes.FLOAT,
            allowNull: false,
            unique: false
        }
    });
}
