'use strict'

module.exports = function (sequelize, Datatypes) {
    return sequelize.define('truck', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        truckKey: {
            type: Datatypes.STRING(255),
            allowNull: false,
            unique: true
        }
    });
}