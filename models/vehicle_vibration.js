'use strict'

module.exports = function (sequelize, Datatypes) {
    return sequelize.define('vehicle_vibration', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        data: {
            type: Datatypes.STRING(255),
            allowNull: false,
            unique: false
        }
    });
}
