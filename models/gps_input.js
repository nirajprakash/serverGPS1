'use strict'

module.exports = function(sequelize, Datatypes) {
    return sequelize.define('gps_inputs', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        date: {
            type: Datatypes.STRING(1000),
            allowNull: false
        },
        raw: {
            type: Datatypes.TEXT,
            allowNull: false
        },
        lat: {
            type: Datatypes.DOUBLE,
            allowNull: true
        },
        lng: {
            type: Datatypes.DOUBLE,
            allowNull: true
        },
        safety_stat: {
            type: Datatypes.ENUM,
            values: ['SAFE', 'N_SAFE']
        },
        truckKey:{
            type: Datatypes.STRING(255),
            allowNull: true
        },
        truckId:{
            type: Datatypes.INTEGER,
            allowNull: true
        }

    });
}