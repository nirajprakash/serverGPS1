'use strict';


module.exports = function (sequelize, Datatypes) {
    return sequelize.define('firebase_device', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        registrationToken: {
            type: Datatypes.STRING(255),
            allowNull: false
        },
        accountId: {
            type: Datatypes.STRING(36),
            allowNull: true
        }
    });
}